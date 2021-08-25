const util = require('util')

const express = require('express')
const Joi = require('joi')
const bcrypt = require('bcryptjs')

const jsonwebtoken = require('jsonwebtoken')
// const jwt = {
//   sign: util.promisify(jsonwebtoken.sign),
//   verify: util.promisify(jsonwebtoken.verify)
// }
const jwt = new Array('sign', 'verify').reduce((sum, method) => Object.assign(sum, {
  [method]: util.promisify(jsonwebtoken[method])
}), {})

const signupSchema = Joi.object().keys({
  email: Joi.string().required().email({ minDomainAtoms: 2 }),
  username: Joi.string().required().regex(/^[a-zA-Z0-9]{3,32}$/),
  password: Joi.string().required().regex(/^[a-zA-Z0-9]{3,30}$/),
})

const { User } = require('../models')

// https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)

module.exports = function (app) {
  const router = express.Router()

  router.post('/signup', [
    // validate req.body against schema
    wrap(async (req, res, next) => {
      const result = await Joi.validate(req.body, signupSchema)

      // Example of how to pass data between middlewares
      req.x_typesetter_data = { result }
      next()
    }),
    // send custom message if ValidationError
    (error, req, res, next) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({ success: false, message: error.details[0].message })
      } else {
        next(error)
      }
    },
    // save User
    wrap(async (req, res, next) => {
      const user = await User.create({
        email: req.body.email,
        username: req.body.username,
        password: await bcrypt.hash(req.body.password, 8)
      })

      // TODO trim fields (like password)
      res.send({ success: true, data: { user } })
    }),
    // NOTE assumes email is the only unique index
    (error, req, res, next) => {
      // https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.err
      if (error.code === 11000) {
        res.status(400).send({ success: false, message: `Account with email ${req.body.email} already exists` })
      } else {
        next(error)
      }
    }
  ])

  router.post('/login', [
    // If this rejects, our global generic error handler will capture it
    wrap(async function (req, res, next) {
      const loginSchema = Joi.object().keys({
        email: Joi.string().required().email({ minDomainAtoms: 2 }),
        password: Joi.string().required().regex(/^[a-zA-Z0-9]{3,30}$/),
      })

      await Joi.validate(req.body, loginSchema)

      next()
    }),
    // Here we want to have specific error handling functionality, so try/catch
    // Another option is to return an error of a specific type,
    // Then have the following middleware check if != that type, else it passes through next
    async function (req, res, next) {
      try {
        const user = await User.findOne({ email: req.body.email })
        const compare = await bcrypt.compare(req.body.password, user.password)

        if (compare) {
          next()
        } else {
          throw new Error('password does not match hash')
        }
      } catch (error) {
        // TODO test this
        // Do not let user know if login failed because email does not exist
        // See: https://www.gnucitizen.org/blog/username-enumeration-vulnerabilities
        next(new Error('Username or password incorrect'))
        // res.status(400).send({ success: false, message: 'Username or password incorrect' })
      }
    },
    wrap(async function (req, res, next) {
      // If we got here, password was correct.
      // Now let's create a JWT

      // TODO pass this through instead of getting it again
      const user = await User.findOne({ email: req.body.email })

      const payload = { id: user._id }
      // An advanced solution would grab secret from a JSON Web Key Set endpoint
      // See: https://github.com/auth0/node-jwks-rsa
      const secret = process.env.JWT_SECRET || 'secretsauce'

      // "There are no default values for expiresIn, notBefore, audience,
      // subject, issuer. These claims can also be provided in the payload
      // directly with exp, nbf, aud, sub and iss respectively, but you can't
      // include in both places."


      // TODO store information about issued JWTs in database?
      // TODO rate limiting?

      // const token = jwt.sign(payload, secret, {
      const token = await jwt.sign({}, secret, {
        algorithm: 'HS256',
        expiresIn: '100m',
        // Use notBefore to prevent weird bad timezone issues
        // notBefore: '1m',
        audience: process.env.JWT_AUDIENCE || 'http://localhost:3000',
        issuer: process.env.JWT_ISSUER || 'TypeSetter App',
        // subject: user.email, // Or id, and then empty payload?
        subject: '' + user._id, // Or id, and then empty payload?
        // jwtid
        // noTimestamp: false // if true, iat "issued at" claim not included
        // header
        // keyid
        // mutatePayload: false
      })

      res.send({ data: { token } })
    })
    // If this was left here, we would get "Username or password incorrect" error when validation failed
    // (error, req, res, next) => {
    //   // Handle email and not found and bad password the same way
    //   res.status(400).send({ success: false, message: 'Username or password incorrect' })
    // }
  ])

  router.get('/protectedtest', [
    // homemade express-jwt
    wrap(async (req, res, next) => {
      const token = req.headers.authorization.split(/(b|B)earer\ /)[2]

      const decoded = await jwt.verify(token, process.env.JWT_SECRET || 'secretsauce', {
        algorithms: [ 'HS256' ],
        audience: process.env.JWT_AUDIENCE || 'http://localhost:3000',
        issuer: process.env.JWT_ISSUER || 'TypeSetter App',
        ignoreExpiration: false,
        ignoreNotBefore: false,
        // use this in combination with /:id to verify ownership?
        // subject
      })

      next()
    }),
    async (error, req, res, next) => {
      if (error.name === 'TokenExpiredError') {
        error.skipLog = true
        error.statusCode = 403
      }

      next(error)
    },
    wrap(async function (req, res, next) {
      res.send({ wip: true })
    })
  ])

  return router
}

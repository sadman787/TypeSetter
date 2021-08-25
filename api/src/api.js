const express = require('express')

const mongoose = require('mongoose')
const morgan = require('morgan')
const winston = require('winston')

const util = require('util')
const jsonwebtoken = require('jsonwebtoken')
const jwt = new Array('sign', 'verify').reduce((sum, method) => Object.assign(sum, {
  [method]: util.promisify(jsonwebtoken[method])
}), {})

const { User } = require('./models')

const PORT = process.env.PORT || 3000

const app = express()

const {
  MONGODB_HOST,
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_DATABASE
} = process.env


// TODO localize timestamp, see: https://medium.com/front-end-hacking/node-js-logs-in-local-timezone-on-morgan-and-winston-9e98b2b9ca45
const logger = winston.createLogger({
  // exitOnError: false,
  // Or, to only exit on certain uncaught errors:
  // (and perhaps also to add shutdown logic)
  // exitOnError: (err) => err.code != 'EPIPE'
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      level: process.env.LOG_LEVEL || 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`)
      )
    })
  ]
})
Object.assign(logger, {
  infoStream: { write: (msg, encoding) => logger.info(msg) },
  errorStream: { write: (msg, encoding) => logger.error(msg) }
})
// const logger = {
//   info(msg) {
//     console.log(msg)
//   }
// }


logger.info('Application started')

const usersRouter = require('./routes/users.js')(app)
const postsRouter = require('./routes/posts.js')(app)
const authRouter = require('./routes/auth.js')(app)
const followingRouter = require('./routes/followingRoutes.js')(app)
const blockRouter = require('./routes/blockRoutes.js')(app)

if (process.env.NODE_ENV === 'development') {
  logger.info('Activating CORS')
  app.use(require('cors')())
}

// At the very start of the middleware stack, goes HTTP logging (so that
// request time can be calculated)
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 500,
  stream: logger.errorStream
}))
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode >= 500,
  stream: logger.infoStream
}))

app.use(express.json())

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)

app.use([
  wrap(async (req, res, next) => {
    //console.log(req.path)
    if (req.path === '/auth/login' || req.path === '/auth/signup') {
      return next()
    }
    const token = req.headers.authorization.split(/(b|B)earer\ /)[2]

    const decoded = await jwt.verify(token, process.env.JWT_SECRET || 'secretsauce', {
      algorithms: [ 'HS256' ],
      audience: process.env.JWT_AUDIENCE || 'http://localhost:3000',
      issuer: process.env.JWT_ISSUER || 'TypeSetter App',
      ignoreExpiration: false,
      ignoreNotBefore: false,
      // use this in combination with /:id to verify ownership?
      // sub
    })

    //console.log(decoded)

    req.user = await User.findById(decoded.sub)

    next()
  }),
  async (error, req, res, next) => {
    if (error.name === 'TokenExpiredError') {
      error.skipLog = true
      error.statusCode = 403
    }

    next(error)
  },
])

app.use('/users', usersRouter)
app.use('/posts', postsRouter)
app.use('/auth', authRouter)
app.use('/following', followingRouter)
app.use('/block', blockRouter)

// Error handling
// See: https://gist.github.com/zcaceres/2854ef613751563a3b506fabce4501fd
// If an error occurs in this middleware, user will get HTML
app.use((error, req, res, next) => {
  // We only want to log truly unexpected errors.
  // For example, logging all "jwt expired" errors just adds noise
  if (!error.skipLog) {
    console.error(error.stack)
  }
  // Assume problem with internal software and send 500
  // If it was an expected error, status should have been set already.
  // Or include status in error object
  res.status(error.statusCode || 500).send({ success: false, message: error.message })
})

// 404s are assumed if no middleware ahead responded
// Just set status and empty body - no HTML response like Express has built in
app.use((req, res, next) => {
  res.status(404).end()
})

// Only listen once MongoDB connection is established
// TODO Promise.all(app.get('needs').map(n => n()))
// so that individual routes can "export" their dependencies
mongoose.connect(`mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}`, {
//mongoose.connect('mongodb://localhost:27017/appAPI', {
  useNewUrlParser: true,
  poolSize: 5
}).then(() => logger.info(`Successfully connected to mongodb://${MONGODB_USERNAME}:***@${MONGODB_HOST}/${MONGODB_DATABASE}`))
  .catch(console.error)
  .then(() => {
    // Wrapping callback(err, data) with Promise
    return new Promise((resolve, reject) => {
      app.listen(PORT, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
  .then(() => logger.info(`Listening on ${PORT}`))
  // .then(() => {
  //   new Promise((resolve, reject) => reject(new Error('Test unhandledRejection')))
  // })

// Toggle this, along with winston option 'exitOnError'
// setTimeout(() => {
//   throw new Error('Test uncaughtException')
// }, 5*1000)

// Coerce unhandledRejection into uncaughtException, which should kill process,
// since in the future, this will happen anyways:
//
// [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated.
// In the future, promise rejections that are not handled will terminate the
// Node.js process with a non-zero exit code.
//
// If promise was reject with a new Error(msg), then we should have full stack
// trace.
process.on('unhandledRejection', (err, p) => {
  throw err
})


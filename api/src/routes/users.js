const express = require('express')
const mongoose = require('mongoose')


const { User, Post } = require('../models')

const ObjectId = mongoose.Types.ObjectId
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)

module.exports = function (app) {
  const router = express.Router()

  router.get('/', async (req, res) => {
    const users = await User.find()

    res.send(users)
  })

  router.get('/:id', wrap(async (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).send({errorMessage: `Invalid ObjectId`})
      }
    const user = await User.findById(req.params.id).populate('followers').populate('following').populate('blocked')

    res.send(user)
  }))

  router.patch('/:id', wrap(async (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).send({errorMessage: `Invalid ObjectId`})
      }
    const user = await User.findByIdAndUpdate(req.params.id, { "$set": req.body }, { new: true })

    res.send(user)
  }))

  router.post('/', (req, res) => {
    User.create(req.body)
      .then(() => {
        res.send(`Created user with email ${req.params.email}`)
      })
  })

  router.delete('/:id', (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).send({errorMessage: `Invalid ObjectId`})
      }
      User.deleteOne({_id: new ObjectId(req.params.id)}, (err, result) => {
          if (err) {
              console.log(err);
              res.status(400).send(err)
          } else {
              Post.deleteMany({userId: req.params.id}).then((doc) => {

                  res.send({result,doc})
              })
          }
      })
  })

  return router
}

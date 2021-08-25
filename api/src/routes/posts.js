const express = require('express')
const { User, Post, Comment } = require('../models')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

module.exports = function (app) {
  const router = express.Router()

  router.get('/', async (req, res) => {
      const posts = await Post.find().populate('userId').populate('comments')
      res.send(posts)
  })

  // Get posts for specific user
  router.get('/:id', async (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).send({errorMessage: `Invalid ObjectId`})
      }
    Post.findOne({ _id: req.params.id }).populate('userId').populate('comments')
                    .exec( (err, posts) => {
                        if (err) {
                            return res.status(500).send(err)
                        }
                       User.populate(posts, {path: 'comments.userId', select: 'username'}).then((doc) =>{
                           res.send(doc)
                       }).catch(err => {
                           res.status(500).send(err)
                       })
                    })
  })

  // Get posts for user and their followers
  router.get('/followed/:id/:page', async (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).send({errorMessage: `Invalid ObjectId`})
      }
      const user = await User.find({_id: req.params.id})
      if (user.length <= 0) {
          return res.status(404).send({arrorMessage: `Cannot find user with id ${req.params.id}`})
      }
      const page = parseInt(req.params.page)
      if (page <= 0) {
          return res.status(400).send({errorMessage: `Page number out of bounds`})
      }
      const following = user[0].following.map(followed => { return {userId: followed}})
      following.push({userId:req.params.id})
      const posts = await Post.find({$or: following}).skip(page*10-10).limit(10).sort({createdAt: 'descending'}).populate('userId')
      res.send(posts)
  })

  router.get('/user/:id', async (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).send({errorMessage: `Invalid ObjectId`})
      }
    const posts = await Post.find({ userId: req.params.id }).populate('userId').populate('comments')

    res.send(posts)
  })

  router.post('/', (req, res) => {
    const {userId, postContent, isTypeset} = req.body
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).send({errorMessage: `Invalid ObjectId`})
    }
    Post.create({userId, postContent, isTypeset, comments: []}, (err) => {
        if (err) {
            res.status(400).send(err)
        } else {
            res.send()
        }
    })
  })

  router.patch('/:id', (req, res) =>{
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).send({errorMessage: `Invalid ObjectId`})
      }
      Post.updateOne({_id: new ObjectId(req.params.id)}, {$set: req.body}, {}, function (err, raw){
          if (err) {
              console.log(err);
              res.status(400).send(err)
          } else{
              res.send(raw)
          }
      })
  })

  router.delete('/:id', (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).send({errorMessage: `Invalid ObjectId`})
      }
      Post.deleteOne({_id: new ObjectId(req.params.id)}, (err, result) => {
          if (err) {
              console.log(err);
              res.status(400).send(err)
          } else {
              res.send(result)
          }
      })
  })

  router.patch('/comment/:id', (req, res) => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(404).send({errorMessage: `Invalid ObjectId`})
      }
      const newComment = new Comment({
          userId: req.body.userId,
          commentContent: req.body.commentContent
      })
      newComment.save().then((result) => {
          Post.updateOne({_id: req.params.id}, {$push: {comments: newComment}},{}, function (err, raw){
            if (err) {
              console.log(err);
              res.status(400).send(err)
            } else{
              res.send(raw)
            }
          })
      }).catch(error => {
          res.status(400).send(error)
      })
  })

  return router
}

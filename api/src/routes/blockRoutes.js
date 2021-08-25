const express = require('express')

const util = require('util')
const jsonwebtoken = require('jsonwebtoken')
const jwt = new Array('sign', 'verify').reduce((sum, method) => Object.assign(sum, {
  [method]: util.promisify(jsonwebtoken[method])
}), {})

const { ObjectID } = require('mongodb')

const { User } = require('../models')

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)

module.exports = function(app) {
  const router = express.Router()

  // Adds the user whom fid belongs to to the blocked list of uid, removes fid
  // from the followers list of uid and removes uid from the following list of
  // fid
  router.post('/block/:uid/:fid', [
    wrap(async (req, res, next) => {
      const uid = req.params.uid
      const fid = req.params.fid

      // Return an error if the user requesting this action does not have the
      // same id as uid and is not an admin
      if (!(String(req.user._id) === uid || req.user.isAdmin)) { 
        // Should return some kind of error message?
        const error = new Error('Not authorized to perform this action')
        error.statusCode = 401
        return next(error)
      }

      var user = await User.findById(uid, {lean: false})
      var followingUser = await User.findById(fid, {lean: false})
      
      // Checks if both ids exist
      if (!(user && followingUser)) {
        const error = new Error('A given user id was not valid')
        error.statusCode = 404
        return next(error)
      }

      // TODO should check if fid is already blocked by uid

      await followingUser.following.pull(uid)
      await user.followers.pull(fid)
      await user.blocked.push(fid)

      followingUser = await followingUser.save()
      user = await user.save()

      user = await User.findById(uid).populate('following').populate('followers').populate('blocked')

        console.log("Hello?")
      console.log(user)
      res.send({ user })

    }),
    async (error, req, res, next) => {
      if (error.name === 'CastError') {
        error.statusCode = 404
        error.message = 'A given user id was not valid'
      }
      next(error)
    }
  ])

  // Removes/unblocks the user whom fid belngs to from the block list of uid
  router.post('/unblock/:uid/:fid', [
    wrap(async (req, res, next) => {
      const uid = req.params.uid
      const fid = req.params.fid

      // Return an error if the user requesting this action does not have the
      // same id as uid and is not an admin
      if (!(String(req.user._id) === uid || req.user.isAdmin)) { 
        // Should return some kind of error message?
        const error = new Error('Not authorized to perform this action')
        error.statusCode = 401
        return next(error)
      }

      var user = await User.findById(uid, {lean: false})
      var followedUser = await User.findById(fid, {lean: false})

      // Checks if both ids exist
      if (!(user && followedUser)) {
        const error = new Error('A given user id was not valid')
        error.statusCode = 404
        return next(error)
      }
      
      // TODO Should check if fid is actually on the block list of uid

      await user.blocked.pull(fid)
      user = await user.save()

      user = await User.findById(uid).populate('following').populate('followers').populate('blocked')

      res.send({ user, followedUser })

    }),
    async (error, req, res, next) => {
      if (error.name === 'CastError') {
        error.statusCode = 404
        error.message = 'A given user id was not valid'
      }
      next(error)
    }
  ])

  return router
}

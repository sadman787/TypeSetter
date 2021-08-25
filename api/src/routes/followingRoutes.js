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

  router.get('/testStuff', async (req, res) => {
    console.log(req.user)
  })

  // Adds the user whom uid belong to to the followers list of fid and adds 
  // the user whom fid belongs to the following of uid
  router.post('/follow/:uid/:fid', [
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

      // TODO Should check if fid has blocked uid

      // TODO Check if uid is already following fid

      //await user.update(
      //  {$push: {following: fid}}, {new: true})
      user = await User.findByIdAndUpdate(uid, 
        {$push: {following: fid}}, {new: true})

      //await followedUser.update(
      //  {$push: {followers: uid}}, {new: true})
      followedUser = await User.findByIdAndUpdate(fid, 
        {$push: {followers: uid}}, {new: true})
      
      // Need to update user after followedUser updates in case they are
      // following themselves
      user = await User.findById(uid).populate('following').populate('followers').populate('blocked')

      // Need to check this again because we pulled from the database again
      if (!(user && followedUser)) {
        const error = new Error('A given user id was not valid')
        error.statusCode = 404
        return next(error)
      }

      //user.lean = true;
      //followedUser.lean = true;

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

  // Removes the user whom fid belongs to from the following list of uid and
  // removes the user whom uid belongs to from the followers list of fid.
  router.post('/unfollow/:uid/:fid', [
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

      // TODO Should check if uid is already not following fid
        

      // TODO Check if uid is already following fid

      // Removes followedUser from user's following list
      user = await User.findByIdAndUpdate(uid, {$pull: {following: fid}},
          {new: true})
        
      // Removes user from followedUser's followers list
      followedUser = await User.findByIdAndUpdate(fid, {$pull: {followers: uid}},
          {new: true})

      // Need to update user after followedUser updates in case they are
      // unfollowing themselves
      user = await User.findById(uid).populate('following').populate('followers').populate('blocked')

      // Need to check this again because we pulled from the database again
      if (!(user && followedUser)) {
        const error = new Error('A given user id was not valid')
        error.statusCode = 404
        return next(error)
      }

      res.send({ user, followedUser })

    }), 
    async (error, req, res, next) => {
      if (error.name === 'CastError') {
        error.statusCode = 404
        error.message = 'A given user id was not valid'
      }
      next(error)
    }
    //const uid = req.params.uid
    //const fid = req.body.fid

    //if (!ObjectID.isValid(uid) || !ObjectID.isValid(fid)) {
    //  return res.status(404).send()
    //}
  ])

  //// Sends the list of people who are following the user whom uid belongs to
  //router.get('/following', async (req, res, next) => {
  //  // Need a way to find out who is logged in
  //  const uid = req.body.uid
  //    
  //  if (!ObjectID.isValid(uid)) {
  //    return res.status(404).send()
  //  }
  //  
  //  User.findById(id).then((user) => {
  //    if (!user) {
  //      res.status(404).send()
  //    } else {
  //      const following = user.following
  //      res.send({ following })
  //    }
  //  }).catch(next)
  //}
  return router
}

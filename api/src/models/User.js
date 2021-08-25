const mongoose = require('mongoose')

const User = mongoose.model('User', mongoose.Schema({
  email: { type: 'string', required: true, unique: true },
  username: {type: 'string', required: true, unique:true},
  password: { type: 'string', required: true },
  following: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
  }],
  blocked: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
  }],
  isAdmin: {type: 'boolean', default: false},
}))

module.exports = User

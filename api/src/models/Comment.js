const mongoose = require('mongoose')

const Comment = mongoose.model('Comment', mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      autopopulate: true
  },
  commentContent: {
      type: String,
      required: true,
      trim: true
  }
}, {timestamps: true}))

module.exports = Comment

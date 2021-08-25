const mongoose = require('mongoose')

const Post = mongoose.model('Post', mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      autopopulate: true
  },
  postContent: {
      type: String,
      required: true,
      trim: true
  },
  isTypeset: {
      type: Boolean,
      required: true
  },
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
}, {timestamps: true}))

module.exports = Post

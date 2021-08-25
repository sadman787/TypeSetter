const mongoose = require('mongoose')
const faker = require('faker')
const bcrypt = require('bcryptjs')

const {
  User,
  Post,
  Comment
} = require('./models')

const {
  MONGODB_HOST,
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_DATABASE
} = process.env

async function main () {
  await mongoose.connect(`mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}`, {
    useNewUrlParser: true,
    poolSize: 5
  })

  const passwordHash = await bcrypt.hash('password', 8)

  const USERS_COUNT = 10
  const POSTS_PER_USER_COUNT = 3
  const COMMENTS_PER_POST_COUNT = 5
  const FOLLOWING_PER_USER_COUNT = 3

  // === USERS ===
  await User.create({
    username: 'bob',
    email: 'bob@mail.com',
    password: passwordHash,
    following: [],
    followers: [],
    blocked: []
  })

  await User.create({
    username: 'admin',
    email: 'admin@typesetter.xyz',
    password: passwordHash,
    following: [],
    followers: [],
    blocked: [],
    isAdmin: true
  })

  for (let i = 0; i < USERS_COUNT; i++) {
    await User.create({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: passwordHash,
      following: [],
      followers: [],
      blocked: []
    })
  }

  for (user of await User.find()) {
    Post.create({
      userId: user._id,
      postContent: '\\int_0^\\infty f(x)dx',
      isTypeset: true
    })

    for (let i = 0; i < POSTS_PER_USER_COUNT; i++) {
      await Post.create({
        userId: user._id,
        postContent: faker.lorem.sentences(),
        isTypeset: false
      })
    }
  }

  const userIds = (await User.find()).map((user) => user._id)

  const getRandomInt = function(max){
      return Math.floor(Math.random() * Math.floor(max))
  }

  for (let i = 0; i < userIds.length; i++) {
      const alreadyFollowed = []
      for (let k = 0; k < FOLLOWING_PER_USER_COUNT; k++) {

          let j = getRandomInt(userIds.length)
          while(j === i || alreadyFollowed.includes(j)){
              j = getRandomInt(userIds.length)
          }
          alreadyFollowed.push(j)
          await User.updateOne({_id: userIds[i]}, {$push: {following: userIds[j]}})
          await User.updateOne({_id: userIds[j]}, {$push: {followers: userIds[i]}})
      }
  }

  const posts = await Post.find().populate("userId")
  for (let i = 0; i < posts.length; i++) {
      for (let j = 0; j < posts[i].userId.followers.length; j++) {
          const res = await Comment.create({
            userId: posts[i].userId.followers[j],
            commentContent: faker.lorem.sentences()
          })
          await Post.updateOne({_id: posts[i]._id}, {$push: {comments: res}})
      }
   }
  // TODO blocked

  await mongoose.connection.close()
}

main()
  .then(() => {
    console.log('Seeders finished')
  })
  .catch((err) => {
    console.error(err)

    return mongoose.connection.close()
  })
  .catch(console.error)

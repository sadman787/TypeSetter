import faker from 'faker'

// This whole file can be considered server calls (POSTs and GETs)
// But in reality we will be bootstrapping fake data into real DB serverside

export const db = {
  users: [],
  tweets: [],
  followings: [],
  followers: [],
  blocked: [],
  comments: []
}

db.users.push({
  username: 'bob',
  email: 'bob@gmail.com',
  password: 'password',
  isAdmin: true
})

for (let i = 0; i < 10; i++) {
  db.users.push({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: 'password'
  })
}

db.tweets.push({
  id: 0,
  username: 'bob',
  postContent: '\\int_0^\\infty f(x)dx',
  isTypeset: true
})
let tweetId = 1
db.users.forEach((user) => {
  db.tweets.push({
    id: tweetId,
    username: user.username,
    postContent: faker.lorem.sentences()
  })

  tweetId++
})

export const getNextTweetId = () => {
    const id = tweetId
    tweetId++
    return id
}

let commentId = 0
db.tweets.forEach((tweet) => {
  for (let i = 0; i < 5; i++) {
    db.comments.push({
      id: commentId,
      tweetId: tweet.id,
      content: faker.lorem.sentences(),
      username: db.users[Math.floor(Math.random() * db.users.length)].username
    })

    commentId++
  }
})

const wait = (cb) => new Promise((resolve, reject) => {
  setTimeout(() => resolve(cb()), 1000)
})

export const usersAdd = (user) => wait(() => {
  db.users.push(user)

  return user
})

export const usersGetAll = () => wait(() => db.users)

export const usersGetByIdentity = (identity) => wait(() => {
  let userToReturn

  db.users.forEach((user) => {
    const { email, username } = user

    if (email === identity || username === identity) {
      userToReturn = user
    }
  })

  return userToReturn
})

export const tweetsByIdSync = (id) => {
  let tweetToReturn

  db.tweets.forEach((tweet) => {
    if (tweet.id === id) {
      tweetToReturn = tweet
    }
  })

  return tweetToReturn
}

export const deleteTweet = (id) => {
    db.tweets = db.tweets.filter((tweet) => tweet.id !== id)
}

export const commentsByTweetIdSync = (id) => db.comments.filter(({ tweetId }) => tweetId === id)

// Fake followings
for (let i = 0; i < 10; i++) {
  db.followings.push({
    name: faker.internet.userName(),
    numOfFollowers: Math.floor((Math.random() * 1000)),
    image: `https://picsum.photos/200/200/?image=${Math.floor((Math.random() * 600))}`
  })
}

export const followings = db.followings

// Fake followers
for (let i = 0; i < 10; i++) {
  db.followers.push({
    name: faker.internet.userName(),
    numOfFollowers: Math.floor((Math.random() * 1000)),
    image: `https://picsum.photos/200/200/?image=${Math.floor((Math.random() * 600))}`
  })
}

export const followers = db.followers

// Fake blocked users
for (let i = 0; i < 10; i++) {
  db.blocked.push({
    name: faker.internet.userName(),
    numOfFollowers: Math.floor((Math.random() * 1000)),
    image: `https://picsum.photos/200/200/?image=${Math.floor((Math.random() * 600))}`
  })
}

export const blocked = db.blocked

console.log('=== FAKE DB ===')
console.log(db.users[1])

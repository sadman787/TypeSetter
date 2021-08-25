import * as db from './db.js'

// server call: POST /login
export const login = ({ identity, password }) => {
  return db.usersGetByIdentity(identity)
    .then((user) => {
      if (user && user.password === password) {
        return { success: true, error: null, data: user }
      } else {
        return { success: false, error: 'Bad password or identity' }
      }
    })
}

// server call: GET /users
export const getAllUsers = () => {
    return db.usersGetAll();
}

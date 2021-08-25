import { Container } from 'unstated'
import jwtDecode from 'jwt-decode'
import debug from 'debug'
import axios from 'axios'
import moment from 'moment'

const log = debug('typesetter:UserState')

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000'
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.patch['Content-Type'] = 'application/json'
axios.defaults.headers.put['Content-Type'] = 'application/json'

export class UserState extends Container {
  state = {
    initialized: false,
    user: null,
    token: null,
    expiredOrBadToken: null
  }

  async init(history) {
    const token = sessionStorage.getItem('token')

    log('Environment:', process.env)

    let decoded
    try {
      decoded = jwtDecode(token)
      log('Decoded JWT: ', decoded)
    } catch (err) {
      log(err.message)
      return this.setState({
        initialized: true,
        expiredOrBadToken: true
      })
    }

    const now = new Date().getTime()
    log(`Current time is ${moment().format('MMMM Do YYYY, h:mm:ss a')} and JWT exp is ${moment(new Date(decoded.exp * 1000)).format('MMMM Do YYYY, h:mm:ss a')}`)
    const expired = now >= decoded.exp * 1000
    if (expired) {
      log('JWT is expired')
      return this.setState({
        initialized: true,
        expiredOrBadToken: true
      })
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    const user = await axios.get(`/users/${decoded.sub}`)
    await this.setState({
      initialized: true,
      token,
      user: user.data
    })

    const from = history.location.state ? history.location.state.from : undefined
    const next = from !== undefined ? from : '/feed'

    log(`JWT from sessionStorage is not expired, redirecting to ${next}`)
    history.push(next, { from: history.location.pathname })
  }

  setToken = async (token) => {
    sessionStorage.setItem('token', token)

    let decoded
    try {
      decoded = jwtDecode(token)
      // log('Decoded JWT: ', decoded)
    } catch (err) {
      log(err.message)
      return this.setState({
        initialized: true,
        expiredOrBadToken: true
      })
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    const user = await axios.get(`/users/${decoded.sub}`)

    await this.setState({
      initialized: true,
      token,
      user: user.data
    })
  }

  async reloadUser() {
    const { token } = this.state
    const id = this.state.user._id
    const user = await axios.get(`/users/${id}`)

    log('Reloaded user:', user)

    await this.setState({
      user: user.data
    })
  }

  async setUser(user) {
    await this.setState({ user })
  }

  logout = (history) => {
    sessionStorage.removeItem('token')
    this.setState({ token: null })
    // history.push('/')
  }
}

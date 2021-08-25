import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { Button, Form, Grid } from 'semantic-ui-react'
import debug from 'debug'
import axios from 'axios'

const log = debug('typesetter:LoginForm')

class LoginFormComponent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      identity: '',
      password: '',
      errorMessage: ''
    }

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleInputChange = (e) => {
    e.preventDefault()

    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit(e) {
    this.setState({ errorMessage: '' })

    e.preventDefault()

    // Assignment destructuring
    const {
      identity,
      password
    } = this.state

    log('Attempting login')
    axios.post('/auth/login', {
      email: identity,
      password
    }).then(({ data }) => {
        log(data)
        return this.props.setToken(data.data.token)
      })
      .then(() => {
        const from = this.props.history.location.state ? this.props.history.location.state.from : undefined
        const next = from !== undefined ? from : '/feed'
        console.log(`pushing to ${next}`)
        this.props.history.push(next, [ { from: this.props.history.location.pathname } ])

      })
      .catch((err) => {
        this.setState({ errorMessage: err.message })
      })
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit} width="100%">
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <Form.Input
                type="text"
                name="identity"
                icon="user"
                placeholder="email or username"
                value={this.state.identity}
                onChange={this.handleInputChange}
                fluid
              />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column width={16}>
              <Form.Input
                type="password"
                name="password"
                icon="lock"
                placeholder="password"
                value={this.state.password}
                onChange={this.handleInputChange}
                fluid
              />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column width={8}>
              <Button color='teal' size='large' fluid>
                  Login
              </Button>
            </Grid.Column>

            <Grid.Column width={8}>
              <Link to="/signup">
                <Button size="large" fluid>
                  Register
                </Button>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        {this.state.errorMessage !== '' ? <span>{this.state.errorMessage}</span> : null}
      </Form>
    )
  }
}

export const LoginForm = withRouter(LoginFormComponent)

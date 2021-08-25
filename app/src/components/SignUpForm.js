import React, { Component } from 'react';
import { Button, Form, Segment } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import debug from 'debug'
import axios from 'axios'

import * as db from '../db.js'


const log = debug('typesetter:SignUpForm')

export class SignUpForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      username: '',
      password: '',
      passwordVerify: '',
      success: false
    }

    // Can do this or use class properties syntax (foo = () => {})
    // (which will get proper this since => means an implicit .bind(this))
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleInputChange = (e) => {
    e.preventDefault()

    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit(e) {
    e.preventDefault()

    // Assignment destructuring
    const {
      email,
      username,
      password,
      passwordVerify
    } = this.state

    // TODO how to do nice form verification?

    if (email === '' || username === '' || password === '') {
      return alert('Required fields missing')
    }

    if (password !== passwordVerify) {
      return alert('Passwords do not match')
    }

    // Show loading while creating user?
    // server call POST /users

    axios.post('/auth/signup', {
      email,
      username,
      password
    }).then(({ data }) => {
        log(data)
      })
      .catch((err) => {
        this.setState({ errorMessage: err.message })
      })

    db.usersAdd({ email, username, password })
      .then((user) => {
        this.setState({
          email: '',
          username: '',
          password: '',
          passwordVerify: ''
        })

        alert(`Successfully created account ${user.email}!`)
        this.setState({ success: true })
      })
  }

  render() {
    return (
      this.state.success
        ? <Redirect to={{ pathname: '/' }} />
        : <Form onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                type="text"
                name="email"
                placeholder="email"
                value={this.state.email}
                onChange={this.handleInputChange}
              />

              <Form.Input
                fluid
                type="text"
                name="username"
                placeholder="username"
                value={this.state.username}
                onChange={this.handleInputChange}
              />

              <Form.Input
                fluid
                type="password"
                name="password"
                placeholder="password"
                value={this.state.password}
                onChange={this.handleInputChange}
              />

              <Form.Input
                fluid
                type="password"
                name="passwordVerify"
                placeholder="confirm password"
                value={this.state.passwordVerify}
                onChange={this.handleInputChange}
              />

              <Button color="teal" size="large" fluid>
                Register
              </Button>
            </Segment>
          </Form>
    )
  }
}

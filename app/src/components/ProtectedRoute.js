import React, { Component } from 'react'
import { Subscribe } from 'unstated'
import { Route, Redirect } from 'react-router-dom'
import debug from 'debug'

import { UserState } from '../containers'

const log = debug('typesetter:ProtectedRoute')

export class ProtectedRoute extends Component {
  render() {
    return (
      <Subscribe to={[ UserState ]}>
        {(user) => {
          console.log(user.state)

          const {
            component: Component,
            ...rest
          } = this.props

          // TODO add needsAdmin prop to also check user.state.user.isAdmin
          const allowed = user.state.token !== null

          log(`Wants to visit ${this.props.path}, allowed: ${allowed}`)

          return (
            <Route
              {...rest}
              render={(props) =>
                allowed
                  ? <Component {...props} />
                  : <Redirect to={{
                      pathname: '/',
                      state: { from: props.location }
                    }} />
              }
            />
          )
        }}
      </Subscribe>
    )
  }
}

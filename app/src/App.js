import React, { Component } from 'react';
import {
  HashRouter as Router,
  Route,
  Switch
} from "react-router-dom"
import debug from 'debug'
import { Provider } from 'unstated'

import UNSTATED from 'unstated-debug'

import './App.css';
import 'semantic-ui-css/semantic.min.css';
import 'katex/dist/katex.min.css'

import {
  ProtectedRoute
} from './components'

import {
  Home,
  Register,
  Profile,
  Feed,
  TweetPage,
  Admin,
  FollowersPage,
  FollowingPage,
  BlockedPage
} from './pages'

UNSTATED.logStateChanges = true

class ExamplePrivateComponent extends Component {
  render() {
    return (
      <div>test</div>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)

    debug('typesetter:App')('Initilizing app')

    this.state = {
      user: null
    }
  }

  setUser = (user) => {
    this.setState({ user })
  }

  render() {
    return (
      <Provider>
        <Router>
          <div>
            <Switch>
              <Route path="/" exact render={() => (
                <Home
                  setUser={this.setUser}
                />
              )} />
              <Route path="/signup" component={Register} />

              <ProtectedRoute path="/test" component={ExamplePrivateComponent} />

              <ProtectedRoute path="/profile/:id" component={Profile} />

              <ProtectedRoute path="/feed" component={Feed} />

              <ProtectedRoute path="/tweet/:id" component={TweetPage} />
              <ProtectedRoute path="/followers" component={FollowersPage}  />

              <ProtectedRoute path="/following" component={FollowingPage}  />

              //<ProtectedRoute path="/blocked" component={BlockedPage}  />
              <ProtectedRoute path="/blocked" render={() => (
                <BlockedPage user={this.state.user}/>)} />
              <ProtectedRoute path="/admin" component={Admin} />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;

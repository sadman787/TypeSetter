import React, { Component } from 'react'
import '../components/EachFeed.css';
import {Dashboard, AdminTable} from '../components'

import { Redirect } from 'react-router-dom'
import { UserState } from '../containers'

import { Subscribe } from 'unstated'

export class Admin extends Component {

  render() {
  	return (
        <Subscribe to={[ UserState ]}>
          {(user) => {
              return user.state.user.isAdmin ? (<div>
              <Dashboard user={user} />
              <div className="heading">Admin Table</div>
              <AdminTable usercontainer={user}/>
              </div>): <Redirect to={{
                  pathname: '/feed',
                  state: { from: this.props.location }
                }} />}}
        </Subscribe>)
  }
}

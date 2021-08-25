import React, { Component } from 'react'
import '../components/EachFeed.css';
import { Subscribe } from 'unstated'
import { Dashboard, Followers } from '../components'
import { UserState } from '../containers'

export class FollowersPage extends Component {

  render() {
  	return (
      <Subscribe to={[ UserState ]}>
        {(user) => {
          return (
  			<div>
			  <Dashboard user = {user.state.user}/>
  			  <Followers usercontainer={user}/>
  			</div>
          )
        }}
      </Subscribe>
    )
  }
}

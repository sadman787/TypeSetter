import React, { Component } from 'react'
import '../components/EachFeed.css';
import { Subscribe } from 'unstated'
import { Dashboard, Blocked } from '../components'
import { UserState } from '../containers'

export class BlockedPage extends Component {

  render() {
  	return (
      <Subscribe to={[ UserState ]}>
        {(user) => {
          console.log('In BlockedPage, ', user.state.user.blocked)
          return (
  			<div>
			  <Dashboard user={user.state.user}/>
  			  <Blocked usercontainer={user}/>
  			</div>
          )
        }}
      </Subscribe>
    )
  }
}

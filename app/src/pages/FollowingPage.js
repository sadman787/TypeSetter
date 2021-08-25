import React, { Component } from 'react'
import '../components/EachFeed.css';
import { Subscribe } from 'unstated'
import {Dashboard, Following} from '../components'
import { UserState } from '../containers'

export class FollowingPage extends Component {

  render() {
  	return (
      <Subscribe to={[ UserState ]}>
        {(user) => {
          return (
  			<div>
			  <Dashboard />
  			  <Following usercontainer={user}/>
  			</div>
          )
        }}
      </Subscribe>
    )
  }
}

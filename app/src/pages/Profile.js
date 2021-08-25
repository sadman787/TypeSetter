import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Subscribe } from 'unstated'
import * as DataBase from '../db'

import EachFeed from '../components/EachFeed'
// import OwnerInfo from '../components/OwnerInfo'
import ProfileViewOtherUser from '../components/ProfileViewOtherUser'

import {Dashboard, ProfileSettings} from '../components'

import { UserState } from '../containers'
import axios from 'axios'
import debug from 'debug'

const log = debug('typesetter:Feed')

export class ProfileComponent extends Component {

  componentWillReceiveProps (newProps) {
      if (newProps.match) {
          const profileId = newProps.match.params.id
          this.setState({profileId})
      }
  }

  constructor(props) {
    super(props)

    this.state = {
    	following: false,
    	follow: 'Follow',
    	feeds: [],
        profileId: this.props.profileId,
        reload: true,
        user: {}
    }}

  toggleFollow = (e, user) => {
     if (e != null) {
         e.preventDefault()
     }
    if(this.state.following === false || this.state.following === 'Follow'){
      this.setState({follow: 'Following'});
      this.setState({following: true});
      if (e != null) {
          //db update
          axios.post(`/following/follow/${user.state.user._id}/${this.state.profileId}`, {user:user.state.user})
          .then((data) => this.props.usercontainer.setUseer(data.data.user))
          .catch((err) =>{
            this.setState({ errorMessage: err.message, reload: false })
          })
      }
  	}
    else{
    	this.setState({follow: 'Follow'});
        this.setState({following: false});
        if (e != null) {
            axios.post(`/following/unfollow/${user.state.user._id}/${this.state.profileId}`, {user:user.state.user})
            .then((data) => this.props.usercontainer.setUseer(data.data.user))
            .catch((err) =>{
              this.setState({ errorMessage: err.message, reload: false })
            })
        }
    }
  }

  loadUserInfo = () => {
      axios.get(`/users/${this.state.profileId}`)
      .then(({data}) => {
          log(data)
          this.setState({user: data})
      })
  }

  loadFeed = () => {
      const reload = false
      this.setState({reload})
      axios.get(`/posts/user/${this.state.profileId}`)
        .then(({ data }) => {
          log(data)
           const feeds = data
        this.setState({ feeds})
        })
        .catch((err) => {
          this.setState({ errorMessage: err.message, reload: false })
        })
  }

  render() {
    return (
      <Subscribe to={[ UserState ]}>
        {(user) => {
            if (this.state.reload) {
                this.loadFeed()
                this.loadUserInfo()
                const followIds = user.state.user.following.map(user => user._id)
                if (followIds.includes(this.state.profileId)) {
                    this.toggleFollow()
                }
            }
          let accountOwnerView = null;
          let otherUserView = null;
          //Just checking if someone logged on while chekcing profile page, need to check if logged in user is the owner
          //
          if(user.state.user._id === this.state.profileId || user.state.user.isAdmin) {
              console.log(user.state.user);
              accountOwnerView = (<div>
                      <Dashboard user={user.state.user}/>
                      {this.state.user.username ? (<div>
                      <h1 style={{paddingLeft:'30px', paddingTop:'30px'}}>@{this.state.user.username}</h1>
                      <div>
                          <ProfileSettings
                            user={user}
                            token={user.state.token}
                          />
                  </div></div>): null}
              </div>)
          }
          else{
              console.log('Other User view');
              accountOwnerView = (
                  <div>
                      <Dashboard user={user.state.user}/>
                      <div>
                          {this.state.user.username?(<h1>{this.state.user.username}</h1>): null}
                          <button onClick={(e) => this.toggleFollow(e, user)}>{this.state.follow}</button>
                      </div>
                      {this.state.feeds.map( feed => {
                          return <EachFeed
                          username = {feed.userId.username}
                          postContent = {feed.postContent}
                          isTypeset = {feed.isTypeset}
                          id = {this.state.profileId}
                          key = {feed._id}
                          profile = {true}
                          />
                      } )}
                  </div>

              )
          }

          return accountOwnerView

        }}
      </Subscribe>
    )
  }
}

export class Profile extends Component {
  render() {
    return (
      <Subscribe to={[ UserState ]}>
        {(user) => <ProfileComponent usercontainer={user} profileId={this.props.match.params.id} />}
      </Subscribe>
    )
  }
}

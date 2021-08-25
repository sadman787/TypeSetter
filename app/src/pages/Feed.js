import React, { Component } from 'react'
import debug from 'debug'
import { Subscribe } from 'unstated'

import { Button} from 'semantic-ui-react'
import EachFeed from '../components/EachFeed'
import '../components/EachFeed.css';
import {Dashboard } from '../components'
import TweetForm from '../components/TweetForm'
import * as database from '../db.js'
import { UserState } from '../containers'
import axios from 'axios'

const log = debug('typesetter:Feed')

class FeedComponent extends Component {
  constructor(props){
    super(props)

    this.state = {
      // server call GET /tweets
      showFeeds: true,
      currPage: 1,
      feeds: []
    }

    this.reloadTweets()
  }

  reloadTweets = () => {
    const id = this.props.usercontainer.state.user._id

    // TODO: only retrieve posts from users that the current user follows
	axios.get(`/posts/followed/${id}/1`)
      .then(({ data }) => {
        log(data)
         const feeds = data
         const currPage = 2
         const reload = false
         const disableLoad = false
      this.setState({ feeds,currPage, reload, disableLoad})
      })
      .catch((err) => {
        this.setState({ errorMessage: err.message })
      })
  }

  loadTweets = (e) => {
    const id = this.props.usercontainer.state.user._id

      e.preventDefault()
      e.persist()
      axios.get(`/posts/followed/${id}/${this.state.currPage}`,)
        .then(({ data }) => {
          log(data)
          if (data.length === 0) {
              const disableLoad = true
              this.setState({disableLoad})
              return
          }
          let {feeds, currPage} = this.state
           feeds = feeds.concat(data)
           currPage+=1
        this.setState({ feeds,currPage})
        })
        .catch((err) => {
          this.setState({ errorMessage: err.message })
        })
  }

  render() {
      if (this.state.reload) {
          return (<Subscribe to={[ UserState ]}>
            {(user) => {
                this.reloadTweets(user.state.user._id, sessionStorage.getItem('token'))
                return null
            }}
        </Subscribe>)
      }
    return (
      <div>
        <Dashboard />
        <br />

        <TweetForm user={this.props.usercontainer.state.user} reloadTweets={this.reloadTweets}/>
        <h2 style={{paddingLeft:'20vw'}}>Your Feed</h2>
        {this.state.feeds.map(feed => (
          <EachFeed
            username = {feed.userId.username}
            postContent = {feed.postContent}
            isTypeset = {feed.isTypeset}
            id = {feed._id}
            userId = {feed.userId._id}
            key = {feed._id}
          />
        ))}
        <Button disabled={this.state.disableLoad} onClick={this.loadTweets} color='teal' size='large' fluid
            style={{width:'500px', margin:'0 auto'}}>
            Load More
        </Button>
      </div>
    )
  }
}

export class Feed extends Component {
  render() {
    return (
      <Subscribe to={[ UserState ]}>
        {(user) => <FeedComponent usercontainer={user} />}
      </Subscribe>
    )
  }
}

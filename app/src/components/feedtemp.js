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

export class Feed extends Component {

    constructor(props){
		super(props)
		this.state = {
	        // server call GET /tweets
			showFeeds: true,
            currPage: 1,
			feeds: [],
            reload: true,
            disableLoad: false
		}
	}

  reloadTweets = (id, token) => {
    // TODO: only retrieve posts from users that the current user follows
	axios.get(`http://localhost:3000/posts/followed/${id}/1`,
              {headers:{authorization : `bearer ${token}`}}
    ).then(({ data }) => {
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

  loadTweets = (e, user, token) => {
      e.preventDefault()
      e.persist()
      axios.get(`http://localhost:3000/posts/followed/${user.state.user._id}/${this.state.currPage}`,
                {headers:{authorization : `bearer ${token}`}}
      ).then(({ data }) => {
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
      <Subscribe to={[ UserState ]}>
        {(user) => {
            console.log("feed State")
          log(user)

          const id = user.state.user._id
          return (
            <div>
              <Dashboard user={user}/>
              <br />

              <TweetForm user={user} reloadTweets={this.reloadTweets}/>
              <div className="heading">Your Feed</div>
              {this.state.feeds.map(feed => (
                <EachFeed
                  username = {feed.userId.username}
                  postContent = {feed.postContent}
                  isTypeset = {feed.isTypeset}
                  id = {feed.id}
                  key = {feed._id}
                />
              ))}
              <Button disabled={this.state.disableLoad} onClick={(e) => this.loadTweets(e, user, sessionStorage.getItem('token'))} color='teal' size='large' fluid>
                  Load More
              </Button>
            </div>
          )
        }}
      </Subscribe>
    )
  }
}

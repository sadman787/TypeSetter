import React, { Component } from 'react'
import { Comment,Checkbox,Button,TextArea,Form,Header } from 'semantic-ui-react'

import { Subscribe } from 'unstated'
import Tweet from '../components/EachFeed.js'

import { UserState } from '../containers'
import {Dashboard} from '../components'
import * as db from '../db.js'
import axios from 'axios'
import debug from 'debug'
import './Tweet.css'

const log = debug('typesetter:tweet')

export class TweetPage extends Component {
    componentWillReceiveProps (newProps) {
        const id = newProps.match.params.id
        this.setState({id})
    }
    constructor(props){
        super(props)
        this.state = {
            id: props.match.params.id,
            tweet: {
                userId: {},
                postContent: '',
                isTypeset: false,
                comments: []
            },
            newTweet: {
                userId: {},
                postContent: '',
                isTypeset: false,
                comments: []
            },
            loaded: false,
            edit: false,
            canEdit: false,
            comment: ''
        }
    }

    loadTweet = (user) => {
        axios.get(`/posts/${this.state.id}`)
        .then((data) => {
            log(data)
            const canEdit = data.data.userId._id === user.state.user._id || user.state.user.isAdmin
            this.setState({tweet:data.data, newTweet:data.data, loaded:true, canEdit})
        }).catch((err) => log(err))
    }
    handleContentChange = (e) => {
        e.preventDefault()
        const {newTweet} = this.state
        newTweet.postContent = e.target.value
        this.setState({ newTweet})
    }

    handleCommentChange = (e) => {
        this.setState({comment:e.target.value})
    }

    switchLateX = (e) => {
        e.preventDefault()
        const {newTweet} = this.state
        newTweet.isTypeset = !newTweet.isTypeset
        this.setState({newTweet})
    }


    handleSave = (e, user) => {
        e.preventDefault()
        const postContent = this.state.newTweet
        if (postContent === '' ){
            return alert('Cannot have post with no content.')
        }
        axios.patch(`/posts/${this.state.id}`, this.state.newTweet)
        .then((data) => {
            log(data)
            this.setState({tweet:this.state.newTweet, loaded:true, edit:false})
        }).catch((err) => log(err))
    }

    handleEdit = (e) => {
        e.preventDefault()
        this.setState({edit:true})
    }

    handleCancel = (e) => {
        e.preventDefault()
        this.setState({edit:false, newTweet: this.state.tweet})
    }

    loadButtons = ()=> {
        return this.state.edit? (<div className='save'><span><Button onClick={this.handleSave}>Save</Button>
        <Button onClick={this.handleCancel}>Cancel</Button></span></div>)
        : (<div className='edit'><Button onClick={this.handleEdit}>Edit
    </Button></div>)
    }

    addComment = (e, user) => {
        axios.patch(`/posts/comment/${this.state.id}`, {userId:user.state.user._id,
                                                        commentContent: this.state.comment})
        .then((data) => {
            console.log(data);
            this.loadTweet(user)
        }).catch((err) => console.log(err))
        this.setState({comment:''})
    }


  // server call GET /tweets/:id
  render(){

      return (
          <Subscribe to={[ UserState ]}>
    {(user) =>{
        if (!this.state.loaded) {
            this.loadTweet(user)
        }
        return (<div >
          <Dashboard user={user}/>
          <div className='post'>
          {this.state.edit ? (<div><div className='text'><TextArea autoHeight style={{width:'100%'}}
          onChange={this.handleContentChange}
          value={this.state.newTweet.postContent}
          placeholder='Content' />
          <Checkbox onChange={this.switchLateX} checked={this.state.newTweet.isTypeset} label="Parse LateX" />
            </div></div>)
            :<Tweet
            username={this.state.tweet.userId.username}
            postContent={this.state.tweet.postContent}
            isTypeset={this.state.tweet.isTypeset}
          />}
          {this.state.canEdit? this.loadButtons() : null}
          <h3>Comments</h3>
          <Comment.Group>
            {this.state.tweet.comments.map((comment) => (
              <Comment key={comment._id} >
                  <Comment.Avatar src={`https://react.semantic-ui.com/images/avatar/small/${comment.userId.username}.jpg`} />
                <Comment.Content >
                  <Comment.Author as='a'>{comment.userId.username}</Comment.Author>
                  <Comment.Text>{comment.commentContent}</Comment.Text>
                </Comment.Content>
              </Comment>
            ))}
            <Form reply onSubmit={(e) => this.addComment(e,user)}>
                <Form.TextArea className='addComment' onChange={this.handleCommentChange} value={this.state.comment}/>
                <Button type='submit' content='Add Comment' labelPosition='left' icon='edit' primary />
                </Form>
            </Comment.Group>
          </div>
        </div>
    )}
  }
  </Subscribe>
)
    }
}

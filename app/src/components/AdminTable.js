import React, { Component } from 'react';
import { Button, Table } from 'semantic-ui-react'
import * as api from '../api.js'
import * as db from '../db.js'
import { Link } from 'react-router-dom'
import axios from 'axios'
import debug from 'debug'

const log = debug('typesetter:AdminTable')

export class AdminTable extends Component {
    constructor(props) {
        super(props);
        // server call GET /tweets

        this.state = {
            userRows: null,
            tweetRows: null,
            reload: true
        };
    }

    handleUserEdit = (e, username) => {
        e.preventDefault()
        //TODO: Edit
        //TODO: save to db
    }

    handleUserRemove = (e, id) => {
        e.preventDefault()
        if (id === this.props.usercontainer.state.user._id) {
            console.log('dont delete urself')
            return
        }
        const userRows = this.state.userRows.filter(row => row.key !== id)
        this.setState({userRows})
        //TODO: remove from db

        axios.delete(`/users/${id}`)
        .then(data => log(data))
        .catch(err => log(err))
    }

    handleTweetEdit = (e, id) => {
        e.preventDefault()
        //TODO: Edit
        //TODO: save to db
    }

    handleTweetRemove = (e, id) => {
        e.preventDefault()
        const tweetRows = this.state.tweetRows.filter(row => row.key !== id)
        this.setState({tweetRows})
        // server call DELETE /tweet/:id
        axios.delete(`/posts/${id}`)
        .then(data => log(data))
        .catch(err => log(err))
    }

    tableBody = () => {
        axios.get('/users')
        .then(users =>{
            log(users)
            const userRows = users.data.map(user => {
                return (<Table.Row key={user._id} id={user._id}>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                      <Link to={`/profile/${user._id}`}>
                    <Button color="blue">
                        Edit
                    </Button>
                </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Button color="red" onClick={(e) => this.handleUserRemove(e, user._id)}>
                        Remove
                    </Button>
                  </Table.Cell>
              </Table.Row>)
            });
            this.setState({userRows, reload: false})
        }).catch(err => console.log(err))
    }

    loadPosts = () => {
        axios.get('/posts')
        .then(posts =>{
            log(posts)
        const tweetRows = posts.data.map(tweet => {
            return (<Table.Row key={tweet._id} id={tweet._id}>
              <Table.Cell>{tweet.userId.username}</Table.Cell>
              <Table.Cell><Link to={`/tweet/${tweet._id}`}>{tweet._id}</Link></Table.Cell>
              <Table.Cell>
                  <Link to={`/tweet/${tweet._id}`}>
                <Button color="blue" >
                    Edit
                </Button>
                </Link>
              </Table.Cell>
              <Table.Cell>
                <Button color="red" onClick={(e) => this.handleTweetRemove(e, tweet._id)}>
                    Remove
                </Button>
              </Table.Cell>
          </Table.Row>)
        })
        this.setState({tweetRows, reload: false})
    }).catch(err => log(err))
    }

    render() {
        if (this.state.reload) {
            this.tableBody();
            this.loadPosts();
        }
        return (<div>
  <Table  celled>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Username</Table.HeaderCell>
        <Table.HeaderCell>Email</Table.HeaderCell>
        <Table.HeaderCell>Edit</Table.HeaderCell>
        <Table.HeaderCell>Remove</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>
      {this.state.userRows}
    </Table.Body>
  </Table>

  <Table  celled>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Username</Table.HeaderCell>
        <Table.HeaderCell>ID</Table.HeaderCell>
        <Table.HeaderCell>Edit</Table.HeaderCell>
        <Table.HeaderCell>Remove</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
        <Table.Body>
          {this.state.tweetRows}
        </Table.Body>
        </Table>
</div>);
    }

}

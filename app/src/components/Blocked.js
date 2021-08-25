import React, { Component } from 'react';
import { Button, Card, Image } from 'semantic-ui-react'
import axios from 'axios'
import debug from 'debug'
import { Link } from 'react-router-dom'

const log = debug('typesetter:Blocked')

export class Blocked extends Component {
  //constructor(props) {
  //  super(props)
  //  this.state = {
  //    user: this.props.user.state.user
  //  }
  //}

  handleDelete = (e, user, id) => {
    e.preventDefault()
    const token = sessionStorage.getItem('token')
    axios.post(`/block/unblock/${String(user._id)}/${id}`, null)
      .then((user) => {
      //this.state.user = user;
      // OR can setUser(user) if the server gives new user
      return this.props.usercontainer.setUser(user.data.user)
      //return this.props.user.
    }).catch((err) => {
      this.setState({ errorMessage: err.Message})
    })
  }

  makeLink = (user) => {
    return (
      <Link to={`/${user._id}`}>
        {user.username}
      </Link>
    );
  }

  pplCardList = () => {
    const cardsOfPpl = this.props.usercontainer.state.user.blocked.map((person) =>
      <Card key={person._id}>
        <Card.Content>
          {undefined ? <Image floated='left' size='tiny' src="" />
            : null}
          <Card.Header>{this.makeLink(person)}</Card.Header>
          <Card.Meta>{person.followers.length} followers</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <div className='ui deleteFromList'>
            <Button basic color='red' onClick={(e) =>
              this.handleDelete(e, this.props.usercontainer.state.user, person._id)}>
              Unblock
            </Button>
          </div>
        </Card.Content>
      </Card>
    );
    return (
      <Card.Group>
        {cardsOfPpl}
      </Card.Group>
    );
  }

  render() {
    //console.log('In blocked render,', this.props.usercontainer.state.user.blocked)

    return (<div style={{paddingLeft:'30px', paddingTop:'30px'}}>
      <div id='pageName' key="one">
        <h3 style={{paddingBottom:'10px'}}>Blocked</h3>
      </div>
      <this.pplCardList/>
    </div>);
  }
}

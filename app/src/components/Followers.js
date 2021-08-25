import React, { Component } from 'react';
import { Button, Card, Image } from 'semantic-ui-react'
import axios from 'axios'
import debug from 'debug'
import { Link } from 'react-router-dom'

const log = debug('typesetter:Followers')

export class Followers extends Component {
  handleDelete = (e, user, id) => {
    e.preventDefault()
    const token = sessionStorage.getItem('token')
    axios.post(`/block/block/${String(user._id)}/${id}`, null)
      .then((user) => {
      console.log(user)
      return this.props.usercontainer.setUser(user.data.user)
    }).catch((err) => {
      this.setState({ errorMessage: err.Message })
    })
  }

  makeLink = (user) => {
    return (
      <Link to={`/${user._id}`}>
        {user.username}
      </Link>
    );
  }

  PplCardList = () => {
    console.log(this.props.usercontainer)
    const cardsOfPpl = this.props.usercontainer.state.user.followers.map((person, idx) =>
      <Card key={person.username.toString()}>
        <Card.Content>
          {undefined ?<Image floated='left' size='tiny' src={person.image} />: null}
          <Card.Header>{person.username}</Card.Header>
          <Card.Meta>{person.followers.length} followers</Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <div className='ui deleteFromList'>
            <Button basic color='red' onClick={(e) =>
              this.handleDelete(e, this.props.usercontainer.state.user, person._id)}>
              Block
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
    return (<div style={{paddingLeft:'30px', paddingTop:'30px'}}>
      <div id='pageName' key="one">
        <h3 style={{paddingBottom:'10px'}}>Followers</h3>
      </div>
      <this.PplCardList/>
    </div>);
  }
}

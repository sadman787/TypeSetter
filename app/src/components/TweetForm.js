import React, { Component } from 'react';
import { Button, Form, Grid, Checkbox, TextArea } from 'semantic-ui-react'
import axios from 'axios'

import debug from 'debug'
const log = debug('typesetter:TweetForm')


export default class TweetForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: this.props.user,
            postContent: "",
            isTypeset: false
        };
    }

    handleInputChange = (e, type) => {
        e.preventDefault()
        this.setState({ [type]: e.target.value })
    }

    switchLateX = (e) => {
        e.preventDefault()
        const isTypeset = !this.state.isTypeset
        this.setState({isTypeset})
    }

    handleSubmit = (e) => {
        e.preventDefault()
        if (this.state.postContent !== '') {
            axios.post(`/posts`, {
                postContent: this.state.postContent,
                userId: this.state.user._id,
                isTypeset: this.state.isTypeset
            }).then((res)=>log(res)).catch((err)=>log(err))
            this.setState({ postContent: '' })
            this.props.reloadTweets()
        }

    }

    render() {
        return (<Form onSubmit={this.handleSubmit} width="100%">
                <Grid centered>
                  <Grid.Row>
                    <Grid.Column width={8}>
                      <TextArea
                      onChange={(e) => this.handleInputChange(e, "postContent")}
                      value={this.state.postContent}
                      placeholder='Content' />
                    </Grid.Column>
                  </Grid.Row>

                  <Grid.Row>
                    <Grid.Column width={8}>
                      <Checkbox onChange={this.switchLateX} label="Parse LateX" />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <Button type="submit" color='teal' size='large' fluid>
                          Post
                      </Button>
                    </Grid.Column>
                    </Grid.Row>
                </Grid>
              </Form>
        );
    }

}

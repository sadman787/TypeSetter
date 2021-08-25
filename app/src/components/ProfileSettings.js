import React, { Component } from 'react';
import { Button, Input, Grid } from 'semantic-ui-react'
import axios from 'axios'

import * as DataBase from '../db'

export class ProfileSettings extends Component{
    constructor(props){
        super(props);
        this.state = {
            user: this.props.user.state.user,
            edit: {
                username: false,
                password: false,
                email: false
            },
            newInfo: {
                username: "",
                password:"",
                email: ""
            },
            errorMessage: ''
        }
    }

    handleInputChange = (e, type) => {
        e.preventDefault();
        const {newInfo} = this.state;
        newInfo[type] = e.target.value;
        this.setState({newInfo});
    }

    handleClick = (e, type) =>{
        e.preventDefault();
        console.log(this.state);
        const {edit} = this.state;
        edit[type] = true
        this.setState({edit})

    }

    handleSave = (e, type) => {
        e.preventDefault();
        // TODO: verify that new email,user,pass is valid
        const {user, edit, newInfo} = this.state;
        if (newInfo[type] !== "") {
            // TODO: update info in db
            this.changeHandler(type)
            edit[type] = false
            user[type] = newInfo[type]
            newInfo[type] = ""
            this.setState({user, newInfo, edit})
        }
    }

    handleCancel = (e, type) => {
        e.preventDefault();
        // TODO: verify that new email,user,pass is valid
        // TODO: update info in db
        const {newInfo, edit} = this.state;
        edit[type] = false
        newInfo[type] = ""
        this.setState({newInfo, edit})
    }

    changeHandler = (type) =>{
      axios.patch(`/users/${this.props.user.state.user._id}`, {
        [type]: this.state.newInfo[type]
    }).then((data) => {
        console.log(`Modified user ${type}`)
        console.log(data);
        this.props.user.reloadUser()
      })
        .catch((err) => {
          this.setState({ errorMessage: err.message })
        })
    }

    formatBoxes(type){
        const name = type.charAt(0).toUpperCase() + type.slice(1);
        return (<Grid.Row>
            <Grid.Column verticalAlign="middle" textAlign="right" width={4}>
            {name}:
            </Grid.Column>
            <Grid.Column width={4}>
            <Input
                fluid
                type="text"
                disabled={!this.state.edit[type]}
                value={this.state.edit[type] ? this.state.newInfo[type]: this.state.user[type]}
                onChange={(e) => this.handleInputChange(e, type)}>
            </Input>
            </Grid.Column>
            <Grid.Column width={4}>{this.state.edit[type] ?
                <span>
                    <Button onClick={(e) => this.handleSave(e, type)}>Save
                    </Button>
                    <Button onClick={(e) => this.handleCancel(e, type)}>Cancel
                    </Button>
                </span>:
                <Button onClick={(e) => this.handleClick(e, type)}>Change
                </Button>}
            </Grid.Column>
            {this.state.errorMessage !== '' ? <span>{this.state.errorMessage}</span> : undefined}
        </Grid.Row>)
    }

    render(){
        return (<Grid>
            {this.formatBoxes("email")}
            {this.formatBoxes("username")}
            {null ? this.formatBoxes("password") : undefined}
        </Grid>)
    }
}

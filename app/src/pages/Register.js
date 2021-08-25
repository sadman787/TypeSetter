import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react'

import { SignUpForm } from '../components'

export class Register extends Component {
  render() {
    return (
      <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 450 }}>
          <SignUpForm />
        </Grid.Column>
      </Grid>
    )
  }
}

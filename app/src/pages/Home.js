import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react'
import { Subscribe } from 'unstated'
import { withRouter } from 'react-router'
import debug from 'debug'

import { Link } from 'react-router-dom'
import { LoginForm } from '../components'
import { UserState } from '../containers'

const log = debug('typesetter:Home')

class HomeComponent extends Component {
  render() {
    return (
      <Subscribe to={[ UserState ]}>
        {(user) => {
          log(user.state)

          // TODO any other way to initialized unstated without a toggle?
          // Maybe with <Provider inject={[ UserState ]}> <UserState /> </Provider> ?
          // See: https://github.com/jamiebuilds/unstated#provider
          //
          // Since user.init calls history.push, the following line is what throws:
          //
          // Warning: Cannot update during an existing state
          // transition (such as within `render`). Render methods should be a
          // pure function of props and state.
          //
          // But it works so....
          if (!user.state.initialized) {
            log('Calling user.init')
            user.init(this.props.history)
          }

          // return (
          //   <div>
          //     {user.state.token === null
          //       ? <Grid>
          //           <Grid.Row>
          //             <Grid.Column width={8}>
          //               <h2>Typesetter</h2>
          //             </Grid.Column>
          //             <Grid.Column width={8}>
          //               <LoginForm setToken={user.setToken} />
          //             </Grid.Column>
          //           </Grid.Row>
          //         </Grid>
          //       : <span>Checking existing token</span>
          //     }
          //   </div>
          // )

          return (
            <div >
                <Link to="/feed"> <h1 style={{paddingLeft:'30px',paddingTop:'5px'}}>Typesetter</h1> </Link>
                <div style={{position:'relative',margin:'0 auto',maxWidth:'600px',paddingTop:'50px', paddingRight:'100px'}}>
                <LoginForm setToken={user.setToken} />
                </div>
            </div>
          )
        }}
      </Subscribe>
    )
  }
}

export const Home = withRouter(HomeComponent)

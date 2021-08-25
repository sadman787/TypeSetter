import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import { Subscribe } from 'unstated'
import { withRouter } from 'react-router'

import { UserState } from '../containers'

class DashboardComponent extends Component {
    constructor(props) {
        super(props);
    }

    makeMenuItem = (name, users) => {
        const nameCap = name.charAt(0).toUpperCase() + name.slice(1);
        return (
        <Menu.Item
        link
          name={name}>
          <Link to={name === 'profile' ? `/profile/${users.state.user._id}` :`/${name}`}>
              {nameCap}
              </Link>
          </Menu.Item>)
    }
    render() {
        return (
          <Subscribe to={[ UserState ]}>
            {(users) => (
              <div>

                  <Link to="/feed"> <h1 style={{paddingLeft:'30px',paddingTop:'5px'}}>Typesetter</h1> </Link>
                <Menu>
                  {this.makeMenuItem("profile", users)}
                  {this.makeMenuItem("feed")}
                  {this.makeMenuItem("following")}
                  {this.makeMenuItem("followers")}
                  {this.makeMenuItem("blocked")}

                  {users.state.user && users.state.user.isAdmin ? this.makeMenuItem("admin") : null}

                  <Menu.Menu position="right" style={{paddingRight:'30px'}}>
                    <h2 style={{paddingRight:'30px',paddingTop:'5px'}}>{users.state.user.username}</h2>
                    <button onClick={() => users.logout(this.props.history)}>logout</button>
                  </Menu.Menu>

                </Menu>
              </div>
            )}
          </Subscribe>
        );
    }

}

export const Dashboard = withRouter(DashboardComponent)

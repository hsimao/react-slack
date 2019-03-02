import React, { Component } from 'react'
import firebase from '../../firebase'
import { Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react'

class UserPanel extends Component {
  state = {
    user: this.props.currentUser
  }

  // user 下拉次選單
  dropdownOptions = () => [
    {
      key: 'user',
      text: (
        <span>
          <strong>{this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    { key: 'avatar', text: <span>修改大頭貼</span> },
    { key: 'signout', text: <span onClick={this.handleSignout}>登出</span> }
  ]

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('用戶登出成功')
      })
  }

  render() {
    const { user } = this.state
    return (
      <Grid style={{ background: '#611f69' }}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2rem', margin: 0 }}>
            {/*App header*/}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>SlackChat</Header.Content>
            </Header>
            {/* User 下拉列表 */}
            <Header style={{ padding: '0.25rem' }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    {user.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>{' '}
          </Grid.Row>
        </Grid.Column>
      </Grid>
    )
  }
}

export default UserPanel

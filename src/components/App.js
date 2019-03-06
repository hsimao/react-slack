import React from 'react'
import { Grid } from 'semantic-ui-react'
import './App.scss'
import { connect } from 'react-redux'

import ColorPanel from './ColorPanel'
import SidePanel from './SidePanel'
import Messages from './Messages'
import MetaPanel from './MetaPanel'

// prettier-ignore
const App = ({ currentUser, currentChannel, isPrivateChannel, userPosts, primaryColor, secondaryColor }) => (
  <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
    <ColorPanel
      key={currentUser && currentUser.name}
      currentUser={currentUser}
      primaryColor={primaryColor}
    />
    <SidePanel key={currentUser && currentUser.uid} currentUser={currentUser} primaryColor={primaryColor} />
    <Grid.Column style={{ marginLeft: 320, minHeight: '100vh' }}>
      <Messages
        key={currentChannel && currentChannel.id}
        currentChannel={currentChannel}
        currentUser={currentUser}
        isPrivateChannel={isPrivateChannel}
      />
    </Grid.Column>
    <Grid.Column width={4}>
      <MetaPanel
        userPosts={userPosts}
        currentChannel={currentChannel}
        key={currentChannel && currentChannel.name}
        isPrivateChannel={isPrivateChannel}
      />
    </Grid.Column>
  </Grid>
)

// 引入 redux 資料
const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts,
  primaryColor: state.colors.primaryColor,
  secondaryColor: state.colors.secondaryColor
})

export default connect(mapStateToProps)(App)

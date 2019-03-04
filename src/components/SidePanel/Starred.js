import React, { Component } from 'react'
import firebase from '../../firebase'
import { connect } from 'react-redux'
import { setCurrentChannel, setPrivateChannel } from '../../actions'

import { Menu, Icon } from 'semantic-ui-react'

class Starred extends Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    activeChannel: '',
    starredChannels: []
  }

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid)
    }
  }

  // 離開組件時移除 firebase 監聽
  componentWillUnmount() {
    if (this.state.user) {
      this.removeListeners(this.state.user.uid)
    }
  }

  removeListeners = userId => {
    this.state.usersRef
      .child(userId)
      .child('starred')
      .off()
  }

  // 監聽我的最愛資料增加
  addListeners = userId => {
    const starredRef = this.state.usersRef.child(userId).child('starred')

    // 監聽新增
    starredRef.on('child_added', snap => {
      const starredChannel = { id: snap.key, ...snap.val() }
      this.setState({
        starredChannels: [...this.state.starredChannels, starredChannel]
      })
    })

    // 監聽刪除
    starredRef.on('child_removed', snap => {
      const channelRemoveId = snap.key
      const filteredChannels = this.state.starredChannels.filter(channel => {
        return channel.id !== channelRemoveId
      })
      this.setState({ starredChannels: filteredChannels })
    })
  }

  // 切換對話框
  changeChannel = channel => {
    this.setActiveChannel(channel)
    this.props.setCurrentChannel(channel)
    this.props.setPrivateChannel(false)
  }

  // 當前顯示對話窗
  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id })
  }

  // 顯示對話窗列表
  displayChannels = starredChannels =>
    starredChannels.length > 0 &&
    starredChannels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        # {channel.name}
      </Menu.Item>
    ))

  render() {
    const { starredChannels } = this.state
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> 我的最愛
          </span>{' '}
          ({starredChannels.length})
        </Menu.Item>
        {/* 群組列表 */}
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    )
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Starred)

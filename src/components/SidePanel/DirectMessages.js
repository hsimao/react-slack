import React, { Component } from 'react'
import firebase from '../../firebase'
import { connect } from 'react-redux'
import { setCurrentChannel, setPrivateChannel } from '../../actions'
import { Menu, Icon } from 'semantic-ui-react'

class DirectMessages extends Component {
  state = {
    activeChannel: '',
    user: this.props.currentUser,
    users: [],
    usersRef: firebase.database().ref('users'),
    connectedRef: firebase.database().ref('.info/connected'),
    presenceRef: firebase.database().ref('presence')
  }

  componentDidMount() {
    if (this.state.user) {
      this.addlisteners(this.state.user.uid)
    }
  }

  componentWillUnmount() {
    this.removeListeners()
  }

  removeListeners = () => {
    this.state.usersRef.off()
    this.state.presenceRef.off()
    this.state.connectedRef.off()
  }

  addlisteners = currentUserUid => {
    let loadedUsers = []
    // 監聽用戶
    this.state.usersRef.on('child_added', snap => {
      // 用戶列表不要包含自己, 用戶狀態預設為籬線
      if (currentUserUid !== snap.key) {
        let user = snap.val()
        user['uid'] = snap.key
        user['status'] = 'offline'
        loadedUsers.push(user)
        this.setState({ users: loadedUsers })
      }
    })

    // 監聽自己在線狀態, 一連結就將自己更新到 presence 內並設定為 true
    this.state.connectedRef.on('value', snap => {
      // 如果在線, 則將 presence 自己的狀態設定為 true
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(currentUserUid)
        ref.set(true)
        // 斷開連結就將自己從 presence 資料內刪除
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.error(err)
          }
        })
      }
    })

    // 監聽 presence 資料新增，將新增的用戶狀態更新為 offline
    this.state.presenceRef.on('child_added', snap => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key)
      }
    })

    // 監聽 presence 資料刪除，將刪除的用戶狀態更新為 offline
    this.state.presenceRef.on('child_removed', snap => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key, false)
      }
    })
  }

  // 更新 users 用戶狀態
  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user['status'] = `${connected ? 'online' : 'offline'}`
      }
      return acc.concat(user)
    }, [])
    this.setState({ users: updatedUsers })
  }

  isUserOnline = user => user.status === 'online'

  changeChannel = user => {
    const channelId = this.getChannelId(user.uid)
    const channelData = {
      id: channelId,
      name: user.name
    }
    this.props.setCurrentChannel(channelData)
    this.props.setPrivateChannel(true)
    this.setActiveChannel(user.uid)
  }

  // 好友私訊對話框 id, 使用 < 比較方法 產出兩個用戶皆相同的 id
  getChannelId = userId => {
    const currentUserId = this.state.user.uid
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`
  }

  setActiveChannel = userId => {
    this.setState({ activeChannel: userId })
  }

  render() {
    const { users, activeChannel } = this.state
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="user" /> 會員
          </span>{' '}
          ({users.length})
        </Menu.Item>
        {users.map(user => (
          <Menu.Item
            key={user.uid}
            active={user.uid === activeChannel}
            onClick={() => this.changeChannel(user)}
            styly={{ opacity: 0.7, fontStyle: 'italic' }}
          >
            <Icon
              name="circle"
              color={this.isUserOnline(user) ? 'green' : 'red'}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    )
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(DirectMessages)

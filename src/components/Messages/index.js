import React, { Component } from 'react'
import { Segment, Comment } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { setUserPosts } from '../../actions'

import firebase from '../../firebase'

import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import Message from './Message'
import Typing from './Typing'
import Skeleton from './Skeleton'

class Messages extends Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref('privateMessages'),
    messagesRef: firebase.database().ref('messages'),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    isChannelStarred: false,
    user: this.props.currentUser,
    userRef: firebase.database().ref('users'),
    typingRef: firebase.database().ref('typing'),
    progressBar: false,
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    typingUsers: [],
    connectedRef: firebase.database().ref('.info/connected'),
    listeners: []
  }

  componentDidMount() {
    const { channel, user, listeners } = this.state
    // 如果有對話窗、用戶資料，則監聽該對話窗內的訊息資料, 跟清空之前監聽的 firebase 事件
    if (channel && user) {
      this.removeListeners(listeners)
      this.addListeners(channel.id)
      this.addUserStarsListener(channel.id, user.uid)
    }
  }

  componentWillUnmount() {
    // 清空所有已記錄的 firebase 事件
    this.removeListeners(this.state.listeners)
    // 移除 connected
    this.state.connectedRef.off()
  }

  // 刪除所有已經紀錄在 listeners 內的 firebase 監聽事件
  removeListeners = listeners => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event)
    })
  }

  // 組件更新時觸發
  componentDidUpdate(prevProps, prevState) {
    // 只要有更新就滾動到最底部
    if (this.messagesEnd) {
      this.scrollToBottom()
    }
  }

  // 監聽參數儲存封裝，以便後續移除監聽用
  addToListeners = (id, ref, event) => {
    // 檢查是否已經儲存
    const index = this.state.listeners.findIndex(listener => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      )
    })

    if (index === -1) {
      const newListener = { id, ref, event }
      this.setState({ listeners: this.state.listeners.concat(newListener) })
    }
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' })
  }

  addListeners = channelId => {
    this.addMessageListener(channelId)
    this.addTypingListener(channelId)
  }

  // 監聽用戶打字狀態
  addTypingListener = channelId => {
    let typingUsers = []
    this.state.typingRef.child(channelId).on('child_added', snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        })
        this.setState({ typingUsers })
      }
    })
    this.addToListeners(channelId, this.state.typingRef, 'child_added')

    // 監聽刪除
    this.state.typingRef.child(channelId).on('child_removed', snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key)
      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key)
        this.setState({ typingUsers })
      }
    })
    this.addToListeners(channelId, this.state.typingRef, 'child_removed')

    this.state.connectedRef.on('value', snap => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(err => {
            if (err !== null) {
              console.error(err)
            }
          })
      }
    })
  }

  addMessageListener = channelId => {
    let loadedMessages = []
    const ref = this.getMessagesRef()
    // 調用 firebase on 事件 監聽該對話窗訊息
    ref.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val())
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      })
      this.countUniqueUsers(loadedMessages)
      this.countUserPosts(loadedMessages)
    })

    this.addToListeners(channelId, ref, 'child_added')
  }

  // 監聽我的最愛狀態
  addUserStarsListener = (channelId, userId) => {
    this.state.userRef
      .child(userId)
      .child('starred')
      .once('value')
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val())
          const prevStarred = channelIds.includes(channelId)
          this.setState({ isChannelStarred: prevStarred })
        }
      })
  }

  // privateChannel 判斷回傳不同 database 的儲存路徑
  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state
    return privateChannel ? privateMessagesRef : messagesRef
  }

  // 我的最愛切換
  handleStar = () => {
    this.setState(
      prevState => ({
        isChannelStarred: !prevState.isChannelStarred
      }),
      () => this.starChannel()
    )
  }

  // 將我的最愛頻道儲存到 firebase users/userId/starred 底下
  starChannel = () => {
    const starredRef = this.state.userRef.child(
      `${this.state.user.uid}/starred`
    )
    if (this.state.isChannelStarred) {
      starredRef.update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: this.state.channel.createdBy
        }
      })
      console.log('star')
    } else {
      starredRef.child(this.state.channel.id).remove(err => {
        if (err !== null) {
          console.error(err)
        }
      })
      console.log('unstar')
    }
  }

  // 搜尋 input 改變
  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    )
  }

  // 搜尋 - 比對訊息內容跟用戶姓名
  handleSearchMessages = () => {
    const channelMessage = [...this.state.messages]
    // 全域比對、不分大小寫
    const regex = new RegExp(this.state.searchTerm, 'gi')
    const searchResults = channelMessage.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message)
      }
      return acc
    }, [])

    this.setState({ searchResults })
    setTimeout(() => this.setState({ searchLoading: false }), 500)
  }

  // 算出當下對話窗共有幾位用戶
  countUniqueUsers = messages => {
    const uniqueUsers = [...new Set(messages.map(it => it.user.name))]
    const numUniqueUsers = uniqueUsers.length
    this.setState({ numUniqueUsers })
  }

  // 整理該頻道每位用戶的留言次數
  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        }
      }
      return acc
    }, {})
    this.props.setUserPosts(userPosts)
  }

  // render message
  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ))

  isProgressBarVisible = percent => {
    if (percent > 0) {
      this.setState({ progressBar: true })
      if (percent === 100) {
        // 100% 後過1秒恢復沒有progressBar的高度
        setTimeout(() => {
          this.setState({ progressBar: false })
        }, 1000)
      }
    }
  }

  // 判斷私人對話框或群組對話框, 回傳不同符號 => (群組 #) (私人 @)
  displayChannelName = channel => {
    const tag = this.state.privateChannel ? '@' : '#'
    return channel ? `${tag}${channel.name}` : ''
  }

  // 顯示所有打字中的用戶
  displayTypingUsers = users =>
    users.length > 0 &&
    users.map(user => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '0.2em'
        }}
        key={user.id}
      >
        <span className="user__typing">{user.name} 正在輸入</span>
        <Typing />
      </div>
    ))

  // 產生10條假訊息畫面
  displayMessageSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null

  render() {
    // prettier-ignore
    const { messagesRef, messages, channel, user, progressBar, numUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel, isChannelStarred, typingUsers, messagesLoading} = this.state

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          isChannelStarred={isChannelStarred}
          handleStar={this.handleStar}
        />

        <Segment>
          <Comment.Group
            className={progressBar ? 'messages__progress' : 'messages'}
          >
            {/* loading時的假畫面 */}
            {this.displayMessageSkeleton(messagesLoading)}

            {/* 對話窗 Messages */}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={node => (this.messagesEnd = node)} />
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    )
  }
}

export default connect(
  null,
  { setUserPosts }
)(Messages)

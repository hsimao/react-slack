import React, { Component } from 'react'
import { Segment, Comment } from 'semantic-ui-react'
import firebase from '../../firebase'

import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import Message from './Message'

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref('messages'),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    progressBar: false,
    numUniqueUsers: ''
  }

  componentDidMount() {
    const { channel, user } = this.state
    // 如果有對話窗、用戶資料，則監聽該對話窗內的訊息資料
    if (channel && user) {
      this.addListeners(channel.id)
    }
  }

  addListeners = channelId => {
    this.addMessageListener(channelId)
  }

  addMessageListener = channelId => {
    let loadedMessages = []
    // 調用 firebase on 事件 監聽該對話窗訊息
    this.state.messagesRef.child(channelId).on('child_added', snap => {
      loadedMessages.push(snap.val())
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      })
      this.countUniqueUsers(loadedMessages)
    })
  }

  // 算出當下對話窗共有幾位用戶
  countUniqueUsers = messages => {
    const uniqueUsers = [...new Set(messages.map(it => it.user.name))]
    const numUniqueUsers = uniqueUsers.length
    this.setState({ numUniqueUsers })
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

  displayChannelName = channel => (channel ? `#${channel.name}` : '')

  render() {
    // prettier-ignore
    const { messagesRef, messages, channel, user, progressBar, numUniqueUsers } = this.state

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
        />

        <Segment>
          <Comment.Group
            className={progressBar ? 'messages__progress' : 'messages'}
          >
            {/* 對話窗 Messages */}
            {this.displayMessages(messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
        />
      </React.Fragment>
    )
  }
}

export default Messages

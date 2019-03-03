import React, { Component } from 'react'
import { Segment, Comment } from 'semantic-ui-react'
import firebase from '../../firebase'

import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import Message from './Message'
import { chmod } from 'fs'

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref('messages'),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    progressBar: false,
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: []
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
    const { messagesRef, messages, channel, user, progressBar, numUniqueUsers, searchTerm, searchResults, searchLoading } = this.state

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
        />

        <Segment>
          <Comment.Group
            className={progressBar ? 'messages__progress' : 'messages'}
          >
            {/* 對話窗 Messages */}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
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

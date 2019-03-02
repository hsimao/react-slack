import React, { Component } from 'react'
import firebase from '../../firebase'
import { Segment, Button, Input } from 'semantic-ui-react'

class MessagesForm extends Component {
  state = {
    message: '',
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: []
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  createMessage = () => {
    const { user, message } = this.state
    const newMessage = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      },
      content: message
    }
    return newMessage
  }

  /**
   * 儲存訊息
   * 資料結構 messages / channel.id / 訊息id
   */
  sendMessage = () => {
    const { messagesRef } = this.props
    const { message, channel } = this.state
    if (message) {
      this.setState({ loading: true })
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: '', errors: [] })
          console.log('儲存成功')
        })
        .catch(err => {
          console.error(err)
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          })
        })
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: '請輸入訊息！' })
      })

      this.state.errors.forEach(item => {
        console.log(item.message)
        console.log(item.message.includes('請輸入訊息'))
      })
    }
  }

  handleEnter = event => event.key === 'Enter' && this.sendMessage()

  render() {
    const { errors, message, loading } = this.state
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          value={message}
          onChange={this.handleChange}
          onKeyPress={this.handleEnter}
          style={{ marginBottom: '0.7rem' }}
          label={<Button icon={'add'} />}
          labelPosition="left"
          placeholder={
            errors.some(error => error.message.includes('請輸入訊息'))
              ? '尚未輸入訊息！'
              : '輸入訊息'
          }
          className={
            errors.some(error => error.message.includes('請輸入訊息'))
              ? 'error'
              : ''
          }
        />
        <Button.Group icon widths="2">
          <Button
            onClick={this.sendMessage}
            disabled={loading}
            color="orange"
            content="送出訊息"
            labelPosition="left"
            icon="edit"
          />
          <Button
            color="teal"
            content="上傳檔案"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
      </Segment>
    )
  }
}

export default MessagesForm

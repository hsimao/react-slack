import React, { Component } from 'react'
import uuidv4 from 'uuid/v4'
import firebase from '../../firebase'
import { Segment, Button, Input } from 'semantic-ui-react'

import FileModal from './FileModal'
import ProgressBar from './ProgressBar'

class MessagesForm extends Component {
  state = {
    storageRef: firebase.storage().ref(),
    uploadTask: null,
    uploadState: '',
    percentUploaded: 0,
    message: '',
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false
  }

  openModal = () => this.setState({ modal: true })
  closeModal = () => this.setState({ modal: false })

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  createMessage = (fileUrl = null) => {
    const { user, message } = this.state
    const newMessage = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      }
    }

    // 圖片傳送
    if (fileUrl !== null) {
      newMessage['image'] = fileUrl
    } else {
      // 一般文字傳送
      newMessage['content'] = message
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

  // 上傳照片到 fireStorage, 並獲取預覽網址
  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id
    const ref = this.props.messagesRef
    const filePath = `chat/public/${uuidv4()}.jpg`

    this.setState(
      {
        uploadState: 'uploading',
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
      },
      // setState callback, 調用 uploadTask 處理上傳狀態
      () => {
        this.state.uploadTask.on(
          'state_changed',
          snap => {
            // 上傳進度百分比
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            )
            this.props.isProgressBarVisible(percentUploaded)
            this.setState({ percentUploaded })
          },
          // 錯誤處理
          err => {
            console.error(err)
            this.setState({
              errors: this.state.erroes.concat(err),
              uploadState: 'error',
              uploadTask: null
            })
          },
          // 上傳完畢, 取出照片預覽網址
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload)
              })
              .catch(err => {
                console.error(err)
                this.setState({
                  errors: this.state.erroes.concat(err),
                  uploadState: 'error',
                  uploadTask: null
                })
              })
          }
        )
      }
    )
  }

  // 將圖片網址儲存到資料庫
  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: 'done' })
      })
      .catch(err => {
        console.error(err)
        this.setState({
          errors: this.state.errors.concat(err)
        })
      })
  }

  render() {
    // prettier-ignore
    const { errors, message, loading, modal, uploadState, percentUploaded } = this.state

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
            disabled={uploadState === 'uploading'}
            onClick={this.openModal}
            content="上傳檔案"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    )
  }
}

export default MessagesForm
import React, { Component } from 'react'
import firebase from '../../firebase'
import { connect } from 'react-redux'
import { setCurrentChannel, setPrivateChannel } from '../../actions'
// prettier-ignore
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react'

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    typingRef: firebase.database().ref('typing'),
    channelsRef: firebase.database().ref('channels'),
    messagesRef: firebase.database().ref('messages'),
    notifications: [],
    activeChannel: '',
    channel: null,
    channels: [],
    channelName: '',
    channelDetails: '',
    modal: false,
    firstLoad: true
  }

  componentDidMount() {
    // 掛載時添加監聽方法
    this.addListeners()
  }

  componentWillUnmount() {
    // 離開組件時移除監聽  firebase 的 on('child_added')
    this.removeListeners()
  }

  // 移除 firebase 的 on 事件
  removeListeners = () => {
    this.state.channelsRef.off()
    this.state.channels.forEach(channel => {
      this.state.messagesRef.child(channel.id).off()
    })
  }

  // 使用 firebase on() 方法監聽 channels 資料是否有更新
  addListeners = () => {
    let loadedChannels = []
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val())
      // 第一次載入時預設抓取一筆資料, 使用 calback 調用 setFirstChannel()
      this.setState({ channels: loadedChannels }, this.setFirstChannel())

      // 啟用監聽通知
      this.addNotificationListener(snap.key)
    })
  }

  // 監聽對話窗更新
  addNotificationListener = updateChannelId => {
    this.state.messagesRef.child(updateChannelId).on('value', snap => {
      if (this.state.channel) {
        this.handleNotifications(
          updateChannelId, // 當下更新的對話窗id
          this.state.channel.id, // 用戶當前所在的對話窗id
          this.state.notifications,
          snap
        )
      }
    })
  }

  // 產生通知數量邏輯處理
  // prettier-ignore
  handleNotifications = ( updateChannelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0
    // 取得當下更新對話窗，所在通知陣列內的索引位置
    let index = notifications.findIndex(
      notification => notification.id === updateChannelId
    )

    // 已經在通知陣列內
    if (index !== -1) {
      // 如果本次更新的對話窗不在用戶當下位置, 使用numChildren()算出新的通知數量
      if (updateChannelId !== currentChannelId) {
        lastTotal = notifications[index].total

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren()

      // 尚未再通知陣列內的基礎參數
    } else {
      notifications.push({
        id: updateChannelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0
      })
    }

    this.setState({ notifications })
  }

  // 取得當前對話窗的通知數量
  getNotificationCount = channel => {
    let count = 0
    this.state.notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count
      }
    })
    if (count > 0) return count
  }

  // 第一次載入時因尚未點擊 channel 不會有資料，則將預設 channels 陣列內的第一筆資料存入
  setFirstChannel = () => {
    const firstChannel = this.state.channels[0]
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel)
      this.setActiveChannel(firstChannel)
      this.setState({ channel: firstChannel })
      this.setState({ firstLoad: false })
    }
  }

  // 顯示對話窗列表
  displayChannels = channels =>
    channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label color="red"> {this.getNotificationCount(channel)}</Label>
        )}
        # {channel.name}
      </Menu.Item>
    ))

  // 切換對話框
  changeChannel = channel => {
    this.setActiveChannel(channel)
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove()
    this.clearNotifications()
    this.props.setCurrentChannel(channel)
    this.props.setPrivateChannel(false)
    this.setState({ channel })
  }

  // 將當下開啟的對話窗的通知紀錄歸0
  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      notification => notification.id === this.state.channel.id
    )

    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications]
      // prettier-ignore
      updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal
      updatedNotifications[index].count = 0
      this.setState({ notifications: updatedNotifications })
    }
  }

  // 當前顯示對話窗
  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id })
  }

  closeModal = () => this.setState({ modal: false })
  openModal = () => this.setState({ modal: true })

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  // 將新對話群組儲存到 firebase
  addChannel = () => {
    const { user, channelName, channelDetails, channelsRef } = this.state
    const key = channelsRef.push().key

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL
      }
    }

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: '', channelDetails: '' })
        this.closeModal()
        console.log('儲存成功，關閉modal')
      })
      .catch(err => console.error(err))
  }

  handleSubmit = event => {
    event.preventDefault()
    if (this.isFormValid(this.state)) {
      this.addChannel()
    }
  }

  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails

  render() {
    const { channels, modal } = this.state
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> 聊天室
            </span>{' '}
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {/* 群組列表 */}
          {this.displayChannels(channels)}
        </Menu.Menu>

        {/*  新增群組 modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>新增群組</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="群組名稱"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="關於群組"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="teal" onClick={this.handleSubmit}>
              <Icon name="checkmark" />
              新增
            </Button>
            <Button color="red" onClick={this.closeModal}>
              <Icon name="remove" />
              取消
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    )
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Channels)

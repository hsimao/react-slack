import React, { Component } from 'react'
import firebase from '../../firebase'
import { connect } from 'react-redux'
import { setCurrentChannel } from '../../actions'
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react'

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    channelsRef: firebase.database().ref('channels'),
    activeChannel: '',
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
  }

  // 使用 firebase on() 方法監聽 channels 資料是否有更新
  addListeners = () => {
    let loadedChannels = []
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val())
      // 第一次載入時預設抓取一筆資料, 使用 calback 調用 setFirstChannel()
      this.setState({ channels: loadedChannels }, this.setFirstChannel())
    })
  }

  // 第一次載入時因尚未點擊 channel 不會有資料，則將預設 channels 陣列內的第一筆資料存入
  setFirstChannel = () => {
    const firstChannel = this.state.channels[0]
    if (this.state.firstLoad && this.state.channels.length > 0) {
      this.props.setCurrentChannel(firstChannel)
      this.setActiveChannel(firstChannel)
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
        # {channel.name}
      </Menu.Item>
    ))

  // 編輯
  changeChannel = channel => {
    this.setActiveChannel(channel)
    this.props.setCurrentChannel(channel)
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
      console.log('新增對話群組')
      console.log(this.state.channelName)
      console.log(this.state.channelDetails)
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
              <Icon name="exchange" /> 群組
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
            <Button color="teal" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" />
              新增
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
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
  { setCurrentChannel }
)(Channels)

import React, { Component } from 'react'
import firebase from '../../firebase'
import { connect } from 'react-redux'
import { setColors } from '../../actions'

// prettier-ignore
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment} from 'semantic-ui-react'

import { CirclePicker } from 'react-color'

class ColorPanel extends Component {
  state = {
    modal: false,
    primary: '',
    secondary: '',
    user: this.props.currentUser,
    usersRef: firebase.database().ref('users'),
    userColors: []
  }
  componentDidMount() {
    if (this.state.user) {
      this.addListener(this.state.user.uid)
    }
  }

  addListener = userId => {
    let userColors = []
    this.state.usersRef.child(`${userId}/colors`).on('child_added', snap => {
      userColors.unshift(snap.val())
      this.setState({ userColors })
    })
  }

  // 顯示當前用戶已儲存的主題色票
  displayUserColors = colors => {
    return (
      colors.length > 0 &&
      colors.map((color, index) => (
        <React.Fragment key={index}>
          <Divider />
          <div
            className="color__container"
            onClick={() => this.props.setColors(color.primary, color.secondary)}
          >
            <div
              className="color__square"
              style={{ background: color.primary }}
            >
              <div
                className="color__overlay"
                style={{ background: color.secondary }}
              />
            </div>
          </div>
        </React.Fragment>
      ))
    )
  }

  openModal = () => this.setState({ modal: true })
  closeModal = () => this.setState({ modal: false })

  handleChangePrimary = color => this.setState({ primary: color.hex })
  handleChangeSecondary = color => this.setState({ secondary: color.hex })

  handleSaveColors = () => {
    if (this.state.primary && this.state.secondary) {
      this.saveColors(this.state.primary, this.state.secondary)
    }
  }

  saveColors = (primary, secondary) => {
    this.state.usersRef
      .child(`${this.state.user.uid}/colors`)
      .push()
      .update({
        primary,
        secondary
      })
      .then(() => {
        this.closeModal()
      })
      .catch(err => console.error(err))
  }
  render() {
    const { modal, primary, secondary, userColors } = this.state
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="teal" onClick={this.openModal} />
        {this.displayUserColors(userColors)}

        {/* 顏色選擇 modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>選擇主題顏色</Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <div
                className="colorPicker__label"
                style={{ background: `${primary ? primary : '#611f69'}` }}
              >
                主色調
              </div>
              <CirclePicker
                color={primary}
                onChange={this.handleChangePrimary}
              />
            </Segment>

            <Segment inverted>
              <div
                className="colorPicker__label"
                style={{
                  background: `${secondary ? secondary : '#00b5ad'}`
                }}
              >
                輔色調
              </div>
              <CirclePicker
                color={secondary}
                onChange={this.handleChangeSecondary}
              />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="teal" onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> 儲存
            </Button>
            <Button color="red" onClick={this.closeModal}>
              <Icon name="remove" /> 取消
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    )
  }
}

export default connect(
  null,
  { setColors }
)(ColorPanel)

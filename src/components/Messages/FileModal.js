import React, { Component } from 'react'
import mime from 'mime-types'
import { Modal, Input, Button, Icon } from 'semantic-ui-react'

class FileModal extends Component {
  state = {
    file: null,
    authorized: ['image/jpeg', 'image/png'] // 可接受上傳檔案的格式
  }

  addFile = event => {
    const file = event.target.files[0]
    if (file) {
      this.setState({ file })
    }
  }

  clearFile = () => this.setState({ file: null })

  sendFile = () => {
    const { file } = this.state
    const { uploadFile, closeModal } = this.props

    if (file !== null) {
      // 驗證檔案格式
      if (this.isAuthorized(file.name)) {
        const metadata = { contentType: mime.lookup(file.name) }
        uploadFile(file, metadata)
        closeModal()
        this.clearFile()
      } else {
        console.log('格式不符！')
      }
    }
  }

  isAuthorized = filename => {
    return this.state.authorized.includes(mime.lookup(filename))
  }

  render() {
    const { modal, closeModal } = this.props

    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>選擇照片</Modal.Header>
        <Modal.Content>
          <Input
            fluid
            onChange={this.addFile}
            label="選擇照片: 格式: jpg, png"
            name="file"
            type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.sendFile} color="teal">
            <Icon name="checkmark" />
            上傳
          </Button>
          <Button color="red" onClick={closeModal}>
            <Icon name="remove" />
            取消
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

export default FileModal

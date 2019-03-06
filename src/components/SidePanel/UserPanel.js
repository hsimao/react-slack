import React, { Component } from 'react'
import firebase from '../../firebase'
import AvatarEditor from 'react-avatar-editor'

// prettier-ignore
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from 'semantic-ui-react'

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: '',
    croppedImage: '',
    blob: '',
    uploadedCroppedImage: '',
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref('users'),
    metadata: {
      contentType: 'image/jpeg'
    }
  }

  openModal = () => this.setState({ modal: true })
  closeModal = () => this.setState({ modal: false })

  // user 下拉次選單
  dropdownOptions = () => [
    {
      key: 'user',
      text: (
        <span>
          <strong>{this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    { key: 'avatar', text: <span onClick={this.openModal}>修改大頭照</span> },
    { key: 'signout', text: <span onClick={this.handleSignout}>登出</span> }
  ]

  // 處理照片上傳
  handleChange = event => {
    const file = event.target.files[0]
    const reader = new FileReader()

    if (file) {
      reader.readAsDataURL(file)
      reader.addEventListener('load', () => {
        this.setState({ previewImage: reader.result })
      })
    }
  }

  // 照片裁切
  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob)
        this.setState({
          croppedImage: imageUrl,
          blob
        })
      })
    }
  }

  // 將裁切完的照片儲存到資料庫
  uploadCroppedImage = () => {
    const { storageRef, userRef, blob, metadata } = this.state
    storageRef
      .child(`avatars/user-${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadedCroppedImage: downloadURL }, () =>
            this.changeAvatar()
          )
        })
      })
  }

  // 更新 firebase 用戶大頭照網址
  changeAvatar = () => {
    // auth Profile
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadedCroppedImage
      })
      .then(() => {
        console.log('Profile 大頭照已更新')
        this.closeModal()
      })
      .catch(err => console.error(err))

    // database users
    this.state.usersRef
      .child(this.state.user.uid)
      .update({ avatar: this.state.uploadedCroppedImage })
      .then(() => {
        console.log('database 大頭照網址已更新')
      })
      .catch(err => console.error(err))
  }

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('用戶登出成功')
      })
  }

  render() {
    const { user, modal, previewImage, croppedImage } = this.state
    const { primaryColor } = this.props

    return (
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2rem', margin: 0 }}>
            {/*App header*/}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>SlackChat</Header.Content>
            </Header>
            {/* User 下拉列表 */}
            <Header style={{ padding: '0.25rem' }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    {user.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>

          {/* edit avatar modal */}
          <Modal basic open={modal}>
            <Modal.Header>修改大頭照</Modal.Header>
            <Modal.Content>
              <Input
                onChange={this.handleChange}
                fluid
                type="file"
                label="上傳新照片"
                name="previewImage"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="center aligned">
                    {/* 上傳預覽照片 and 裁切 */}
                    {previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {/* 裁切照片完後的預覽 */}
                    {croppedImage && (
                      <Image
                        style={{ margin: '3.5rem auto' }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button color="teal" onClick={this.uploadCroppedImage}>
                  <Icon name="save" />
                  儲存
                </Button>
              )}
              {
                <Button
                  disabled={!previewImage}
                  color="teal"
                  onClick={this.handleCropImage}
                >
                  <Icon name="cut" />
                  裁切
                </Button>
              }
              <Button color="red" onClick={this.closeModal}>
                <Icon name="remove" />
                取消
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    )
  }
}

export default UserPanel

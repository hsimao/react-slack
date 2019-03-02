import React, { Component } from 'react'
import firebase from '../../firebase'
import { Link } from 'react-router-dom'
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from 'semantic-ui-react'

import style from './Register.module.scss'

import Logo from '../Logo'

class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>)

  // email password 登入
  handleSubmit = event => {
    event.preventDefault()
    const { email, password } = this.state
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true })
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(signedInUser => {
          console.log(signedInUser)
          this.setState({ loading: false })
        })
        .catch(err => {
          console.error(err)
          if (err.code === 'auth/wrong-password') {
            err.message = '密碼錯誤！'
          }
          if (err.code === 'auth/user-not-found') {
            err.code = 'email'
            err.message = '無此帳號，請重新輸入'
          }
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false
          })
        })
    }
  }

  signInWithSocial = type => {
    console.log('login')
    let provider = null
    if (type === 'gmail') provider = new firebase.auth.GoogleAuthProvider()
    if (type === 'fb') provider = new firebase.auth.FacebookAuthProvider()
    firebase.auth().languageCode = 'zh-Hant-TW'

    firebase
      .auth()
      .signInWithPopup(provider)
      .then(createdUser => {
        // 將 user 註冊資料儲存到 database
        this.saveUser(createdUser).then(() => {
          console.log(createdUser)
          console.log('用戶資料儲存完成')
        })
        this.setState({ loading: false })
      })
      .catch(err => {
        console.error(err)
        this.setState({
          errors: this.state.errors.concat(err),
          loading: false
        })
      })
  }

  // 儲存用戶資料到 database
  saveUser = createdUser => {
    const userRef = firebase.database().ref('users')
    return userRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    })
  }

  isFormValid = () => {
    if (this.isFormEmpty(this.state)) {
      return false
    } else if (!this.isPasswordValid(this.state.password)) {
      return false
    } else {
      return true
    }
  }

  // 檢查是否有空值, 有空值返回 true
  isFormEmpty = ({ email, password }) => {
    let errors = []
    let error
    let errorCode = ''
    if (!email.length) {
      errorCode += 'email'
    }
    if (!password.length) {
      errorCode += 'password'
    }
    error = { code: errorCode, message: '有欄位尚未輸入！' }
    this.setState({ errors: errors.concat(error) })
    return !email.length || !password.length
  }

  // 驗證密碼
  isPasswordValid = password => {
    let errors = []
    let error
    if (!password.length < 6) {
      return true
    } else {
      error = {
        code: 'password',
        message: '密碼長度須大於6字元'
      }
      this.setState({ errors: errors.concat(error) })
      return false
    }
  }

  handleInputError = (errors, inputName) => {
    return errors.some(error => {
      if (error.code) {
        return error.code.toLowerCase().includes(inputName)
      } else {
        return false
      }
    })
      ? 'error'
      : ''
  }

  render() {
    const { email, password, errors, loading } = this.state

    return (
      <Grid textAlign="center" verticalAlign="middle" className="content">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" color="teal" textAlign="center">
            <div className={style.logo_box}>
              <Logo />
            </div>
            登入
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="信箱"
                type="email"
                value={email}
                className={this.handleInputError(errors, 'email')}
                onChange={this.handleChange}
              />

              <Form.Input
                fluid
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="密碼"
                type="password"
                value={password}
                className={this.handleInputError(errors, 'password')}
                onChange={this.handleChange}
              />

              <Button
                disabled={loading}
                className={loading ? 'loading' : ''}
                color="teal"
                fluid
                size="large"
              >
                登入
              </Button>

              <div className={style.social_group}>
                <Icon
                  onClick={() => this.signInWithSocial('fb')}
                  name="facebook official"
                  link
                  color="blue"
                  size="big"
                />
                <Icon
                  onClick={() => this.signInWithSocial('gmail')}
                  name="google"
                  link
                  color="red"
                  size="big"
                />
              </div>
            </Segment>
          </Form>

          {errors.length > 0 && (
            <Message error>{this.displayErrors(errors)}</Message>
          )}

          <Message>
            尚未註冊？<Link to="/register">前往註冊</Link>
          </Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Login

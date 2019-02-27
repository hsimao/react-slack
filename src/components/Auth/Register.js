import React, { Component } from 'react'
import firebase from '../../firebase'
import { Link } from 'react-router-dom'
import { Grid, Form, Segment, Button, Header, Message } from 'semantic-ui-react'

import style from './Register.module.scss'

import Logo from '../Logo'

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  isFormValid = () => {
    if (this.isFormEmpty(this.state)) {
      return false
    } else if (!this.isPasswordValid(this.state)) {
      return false
    } else {
      return true
    }
  }

  // 檢查是否有空值, 有空值返回 true
  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    let errors = []
    let error
    let errorCode = ''
    if (!username.length) {
      errorCode += 'username'
    }
    if (!email.length) {
      errorCode += 'email'
    }
    if (!password.length) {
      errorCode += 'password'
    }
    if (!passwordConfirmation.length) {
      errorCode += 'passwordConfirmation'
    }
    error = { code: errorCode, message: '有欄位尚未輸入！' }
    this.setState({ errors: errors.concat(error) })

    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    )
  }

  // 驗證密碼
  isPasswordValid = ({ password, passwordConfirmation }) => {
    let errors = []
    let error
    if (password.length < 6 || passwordConfirmation.length < 6) {
      error = {
        code: 'password',
        message: '密碼長度須大於6字元'
      }
      this.setState({ errors: errors.concat(error) })
      return false
    } else if (password !== passwordConfirmation) {
      error = {
        code: 'password',
        message: '密碼兩次輸入不一致'
      }
      this.setState({ errors: errors.concat(error) })
      return false
    } else {
      return true
    }
  }

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>)

  handleSubmit = event => {
    event.preventDefault()
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true })
      // firebase email password 註冊 api
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          console.log(createdUser)
          this.setState({ loading: false })
        })
        .catch(err => {
          console.error(err)
          if (err.code === 'auth/email-already-in-use') {
            err.message = '此信箱已經註冊過，請改用其它信箱'
          }
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false
          })
        })
    }
  }

  handleInputError = (errors, inputName) => {
    errors.map(error => {
      console.log(inputName)
      console.log(error.code === inputName)
    })

    return errors.some(error => {
      if (error.code) {
        return error.code.toLowerCase().includes(inputName)
      }
    })
      ? 'error'
      : ''
  }

  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading
    } = this.state

    return (
      <Grid textAlign="center" verticalAlign="middle" className="content">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" color="orange" textAlign="center">
            <div className={style['logo-box']}>
              <Logo />
            </div>
            註冊開始聊天
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="名字"
                type="text"
                value={username}
                className={this.handleInputError(errors, 'username')}
                onChange={this.handleChange}
              />

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

              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="密碼確認"
                type="password"
                value={passwordConfirmation}
                className={this.handleInputError(errors, 'password')}
                onChange={this.handleChange}
              />

              <Button
                disabled={loading}
                className={loading ? 'loading' : ''}
                color="orange"
                fluid
                size="large"
              >
                註冊
              </Button>
            </Segment>
          </Form>

          {errors.length > 0 && (
            <Message error>{this.displayErrors(errors)}</Message>
          )}

          <Message>
            已經註冊過了？<Link to="/login">登入</Link>
          </Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Register

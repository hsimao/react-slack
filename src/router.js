import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'

import Register from './components/Auth/Register'
import firebase from './firebase'

import App from './components/App'
import Login from './components/Auth/Login'

class Root extends Component {
  componentDidMount() {
    // 監聽 onAuthStateChanged, 如果有取得 user 資料就引導到首頁
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log('user', user)
        this.props.history.push('/')
      }
    })
  }

  render() {
    return (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    )
  }
}

const RootWithAuth = withRouter(Root)

export default RootWithAuth

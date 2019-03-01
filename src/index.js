import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from 'react-router-dom'
import * as serviceWorker from './serviceWorker'

// router components
import Register from './components/Auth/Register'
import App from './components/App'
import Login from './components/Auth/Login'
import Spinner from './Spinner'

import firebase from './firebase'

import 'semantic-ui-css/semantic.min.css'

// redux 設置
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducers'
import { setUser } from './actions'
const store = createStore(rootReducer, composeWithDevTools())

// router 設置
class Root extends Component {
  componentDidMount() {
    // 監聽 onAuthStateChanged, 如果有取得 user 資料就引導到首頁
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log('user', user)
        // 將 user 資料儲存到 redux
        this.props.setUser(user)
        this.props.history.push('/')
      }
    })
  }

  render() {
    return this.props.isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    )
  }
}

const mapStateFromProps = state => ({
  isLoading: state.user.isLoading
})

// router 連結 redux
const RootWithAuth = withRouter(
  connect(
    mapStateFromProps,
    { setUser }
  )(Root)
)

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById('root')
)

serviceWorker.unregister()

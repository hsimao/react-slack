import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import App from './components/App'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'

const Root = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Switch>
  </Router>
)

export default Root

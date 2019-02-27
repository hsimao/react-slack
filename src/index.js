import React from 'react'
import ReactDOM from 'react-dom'

import * as serviceWorker from './serviceWorker'

import 'semantic-ui-css/semantic.min.css'

import Root from './router'

ReactDOM.render(<Root />, document.getElementById('root'))

serviceWorker.unregister()

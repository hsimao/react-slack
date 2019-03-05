import { combineReducers } from 'redux'
import * as actionTypes from '../actions/types'

// user
const initialUserState = {
  currentUser: null,
  isLoading: true,
  userPosts: null
}

const user_reducer = (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false
      }
    case actionTypes.CLEAR_USER:
      return {
        ...initialUserState,
        isLoading: false
      }
    default:
      return state
  }
}

// 對話框 channel
const initialChannelState = {
  currentChannel: null,
  isPrivateChannel: false
}

const channel_reducer = (state = initialChannelState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload.currentChannel
      }
    case actionTypes.SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivateChannel: action.payload.isPrivateChannel
      }
    case actionTypes.SET_USER_POSTS:
      return {
        ...state,
        userPosts: action.payload.userPosts
      }
    default:
      return state
  }
}

const rootReducer = combineReducers({
  user: user_reducer,
  channel: channel_reducer
})

export default rootReducer

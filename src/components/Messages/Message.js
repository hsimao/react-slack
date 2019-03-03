import React, { Component } from 'react'
import { Comment, Image } from 'semantic-ui-react'

import moment from 'moment'
import 'moment/locale/zh-tw'
moment.locale('zh-tw')

const isOwnMessage = (message, user) => {
  return message.user.id === user.uid ? 'message__self' : ''
}

const isImage = message => {
  return message.hasOwnProperty('image') && !message.hasOwnProperty('content')
}

const timeFromNow = timestamp => moment(timestamp).fromNow()

const Message = ({ message, user }) => (
  <Comment>
    <Comment.Avatar src={message.user.avatar} />
    <Comment.Content className={isOwnMessage(message, user)}>
      <Comment.Author as="a">{message.user.name}</Comment.Author>
      <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
      {/* 顯示圖片或訊息 */}
      {isImage(message) ? (
        <Image src={message.image} className="message__image" />
      ) : (
        <Comment.Text>{message.content}</Comment.Text>
      )}
    </Comment.Content>
  </Comment>
)

export default Message

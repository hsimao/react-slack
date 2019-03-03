import React, { Component } from 'react'
import { Header, Segment, Input, Icon } from 'semantic-ui-react'

class MessagesHeader extends Component {
  render() {
    const { channelName, numUniqueUsers } = this.props
    return (
      <Segment clearing>
        {/* 對話窗 title */}
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {`${channelName} `}
            <Icon name={'star outline'} color="black" />
          </span>
          <Header.Subheader>
            <Icon name="user outline" />
            {numUniqueUsers}
          </Header.Subheader>
        </Header>

        {/* 對話窗搜尋 input */}
        <Header floated="right">
          <Input
            size="mini"
            icon="search"
            name="search"
            placeholder="搜尋訊息"
          />
        </Header>
      </Segment>
    )
  }
}

export default MessagesHeader

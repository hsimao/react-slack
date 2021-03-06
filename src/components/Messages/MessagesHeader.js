import React, { Component } from 'react'
import { Header, Segment, Input, Icon } from 'semantic-ui-react'

class MessagesHeader extends Component {
  render() {
    // prettier-ignore
    const { channelName, numUniqueUsers, handleSearchChange, searchLoading, isPrivateChannel, isChannelStarred, handleStar} = this.props

    return (
      <Segment clearing>
        {/* 對話窗 title */}
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {`${channelName} `}
            {/* 私人評頻道不顯示星星 icon */}
            {!isPrivateChannel && (
              <Icon
                onClick={handleStar}
                name={isChannelStarred ? 'star' : 'star outline'}
                color={isChannelStarred ? 'yellow' : 'black'}
              />
            )}
          </span>
          <Header.Subheader>
            <Icon name="user outline" />
            {numUniqueUsers}
          </Header.Subheader>
        </Header>

        {/* 對話窗搜尋 input */}
        <Header floated="right">
          <Input
            loading={searchLoading}
            onChange={handleSearchChange}
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

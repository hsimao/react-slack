import React, { Component } from 'react'
import {
  Segment,
  Accordion,
  Header,
  Icon,
  Image,
  List
} from 'semantic-ui-react'

class MetaPanel extends Component {
  state = {
    channel: this.props.currentChannel,
    privateChannel: this.props.isPrivateChannel,
    activeIndex: 0
  }

  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index
    this.setState({ activeIndex: newIndex })
  }

  // 顯示留言 user 資料
  displayTopPosters = posts =>
    Object.entries(posts)
      // 排序
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, val], i) => (
        <List.Item key={i}>
          <Image avatar src={val.avatar} />
          <List.Content>
            <List.Header as="a">{key}</List.Header>
            <List.Description>{val.count} 則訊息</List.Description>
          </List.Content>
        </List.Item>
      ))
      // 只顯示前3位
      .slice(0, 3)

  render() {
    const { channel, activeIndex, privateChannel } = this.state
    const { userPosts } = this.props

    // 私人頻道不顯示
    if (privateChannel) return null

    return (
      <Segment loading={!channel}>
        <Header as="h3" attached="top">
          關於 # {channel && channel.name}
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            頻道說明
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {channel && channel.details}
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            話題人物
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <List>{userPosts && this.displayTopPosters(userPosts)}</List>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            創建者
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Header as="h4">
              <Image circular src={channel && channel.createdBy.avatar} />
              {channel && channel.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    )
  }
}

export default MetaPanel

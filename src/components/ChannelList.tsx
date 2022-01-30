import { Dialog } from "@mui/material";
import React, { FocusEvent } from "react";

import channelListStyles from './ChannelList.module.scss'
import './ChannelList.css'

export interface Channels {
  Categories: {
    Name: string,
    Hidden: boolean,
    Channels: {
      Name: string,
      Vid: string
    }[]
  }[]
}

interface FineChannel {
  id: number,
  inCategoryID: number,
  categoryName: string,
  name: string,
  vid: string
}

interface FineCategory {
  name: string,
  channels: FineChannel[]
}

class FineCategories {
  categories: FineCategory[] = [];
  channels: FineChannel[] = [];
  columns: number = parseInt(channelListStyles.columns);

  constructor(rawChannels: Channels) {
    // categories
    for (let i = 0; i < rawChannels.Categories.length; i++) {
      const rawCategory = rawChannels.Categories[i];
      if (!rawCategory.Hidden) {
        let newChannels: FineChannel[] = [];
        for (let j = 0; j < rawCategory.Channels.length; j++) {
          const rawChannel = rawCategory.Channels[j];
          const newChannel = {
            id: this.channels.length,
            inCategoryID: j,
            categoryName: rawCategory.Name,
            name: rawChannel.Name,
            vid: rawChannel.Vid
          };
          newChannels.push(newChannel);
          this.channels.push(newChannel);
        }
        this.categories.push({
          name: rawCategory.Name,
          channels: newChannels
        })
      }
    }
  }

  arrowEvent(id: number, action: 'up' | 'down' | 'left' | 'right'): number {
    // position of current `id`
    const curChannel = this.channels[id];
    const column = curChannel.inCategoryID % this.columns;
    const row = Math.floor(curChannel.inCategoryID / this.columns);
    // shape of current category
    const curCategoryIndex = this.categories.findIndex(c => c.name === curChannel.categoryName);
    const curCategory = this.categories[curCategoryIndex];
    const curCategorySize = curCategory.channels.length;
    const lastRowLastItem = (curCategorySize - 1) % this.columns;
    const lastRow = Math.floor((curCategorySize - 1) / this.columns);
    const lastItemID = curCategory.channels[curCategorySize - 1].id;

    switch (action) {
      case 'up':
        // if already the top, goto the last item of the upper category
        if (row === 0) {
          const firstIndex = curCategory.channels[0].id;
          if (firstIndex === 0) return id;
          return firstIndex - 1;
        }
        return id - this.columns;
      case 'down':
        // if already the bottom
        if (row === lastRow) {
          // if already the last category
          if (curCategoryIndex === this.categories.length - 1)
            return id;
          // if has next category, goto the first item
          return lastItemID + 1;
        }
        return Math.min(id + this.columns, lastItemID);
      case 'left':
        return Math.max(0, id - 1);
      case 'right':
        return Math.min(this.channels.length, id + 1);
    }
  }

}

type Prop = {
  open: boolean,
  channels: Channels,
  onClose: () => void,
  onSwitch: (vid: string) => void,
  vid?: string
}

type State = {
  firstSinceShow: boolean
}

class ChannelList extends React.Component<Prop, State> {

  state: State = {
    firstSinceShow: false
  };

  fineChannels: FineCategories

  constructor(props: Prop) {
    super(props);
    this.fineChannels = new FineCategories(props.channels);

  }

  handleClick = (vid: string) => {
    if (this.state.firstSinceShow) {
      this.setState({ firstSinceShow: false });
      return;
    }
    this.props.onClose();
    this.props.onSwitch(vid);
  }

  handleMove = (e: FocusEvent) => {
    const focused = e.target as Element;
    focused.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }

  componentDidMount() {
    this.fineChannels = new FineCategories(this.props.channels);
  }
  componentDidUpdate(prevProps: Prop) {
    if (prevProps.channels !== this.props.channels)
      this.fineChannels = new FineCategories(this.props.channels);
    if (prevProps.open === false && this.props.open === true)
      this.setState({ firstSinceShow: true });
  }
  componentWillUnmount() {
  }

  // componentDidMount() {
  //   if (this.props.vid) {
  //     // Toast.show({text: this.props.vid});
  //     const cur = document.getElementById(this.props.vid);
  //     if (cur) cur.focus();
  //     else Toast.show({ text: 'asd' });
  //   }
  // }

  // const clickArrow = (e: string) => {
  //   switch (e) {
  //     case 'ArrowLeft':
  //       setSelectedID(pre => fineChannels.arrowEvent(pre, 'left'));
  //       break;
  //     case 'ArrowRight':
  //       setSelectedID(pre => fineChannels.arrowEvent(pre, 'right'));
  //       break;
  //     case 'ArrowDown':
  //       setSelectedID(pre => fineChannels.arrowEvent(pre, 'down'));
  //       break;
  //     case 'ArrowUp':
  //       setSelectedID(pre => fineChannels.arrowEvent(pre, 'up'));
  //       break;
  //   }
  // }

  // useEffect(() => {
  //   if (selectedChannel.current === null)
  //     Toast.show({ text: 'nullref' })
  //   else
  //     selectedChannel.current.scrollIntoView({
  //       behavior: 'smooth',
  //       block: 'nearest'
  //     });
  // }, [selectedID])

  // useEffect(() => {
  //   const handleKeyClick = (e: KeyboardEvent) => {
  //     switch (e.code) {
  //       case 'ArrowLeft':
  //         setSelectedID(pre => fineChannels.arrowEvent(pre, 'left'));
  //         break;
  //       case 'ArrowRight':
  //         setSelectedID(pre => fineChannels.arrowEvent(pre, 'right'));
  //         break;
  //       case 'ArrowDown':
  //         setSelectedID(pre => fineChannels.arrowEvent(pre, 'down'));
  //         break;
  //       case 'ArrowUp':
  //         setSelectedID(pre => fineChannels.arrowEvent(pre, 'up'));
  //         break;
  //       case 'Enter':
  //         document.getElementById('channel-sel')?.click();
  //         break;
  //     }
  //   }
  //   document.addEventListener('keydown', handleKeyClick)
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyClick)
  //   }
  // }, [fineChannels])
  render() {
    return (
      <Dialog
        fullScreen
        open={this.props.open}
        onClose={this.props.onClose}
        style={{ zIndex: 10 }}
        className="channel-list"
      >
        {this.fineChannels.categories.map(category =>
          <div key={category.name} className={channelListStyles.category}>
            <h4>{category.name}</h4>
            <div className={channelListStyles.channels}>
              {category.channels.map(channel =>
                <button className={channelListStyles.channel}
                  autoFocus={channel.vid === this.props.vid}
                  id={channel.vid}
                  key={channel.vid}
                  onClick={() => this.handleClick(channel.vid)}
                  onFocus={this.handleMove}>
                  {channel.name}
                </button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    )
  }
}

export default ChannelList;
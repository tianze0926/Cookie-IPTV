import React from 'react';
import { Http } from '@capacitor-community/http';
import { AlertColor, Dialog } from '@mui/material';

import authenticate from './Authentication';
import ChannelList, { Channels } from './ChannelList';
import Snackbar, { MessageInfo } from './SnackBar';
import Player from './Player';

export type ShowSnack = (message: string, severity?: AlertColor) => void;

type State = {
  src: string;
  showChannelList: boolean;
  channels: Channels;
  messageInfo: MessageInfo;
  auth: {
    valid: boolean;
    unAuthTimes: number;
    unAuthExcessive: boolean;
  };
  log: string;
}

class App extends React.Component<{}, State> {

  state: State = {
    src: '',
    showChannelList: false,
    channels: { Categories: [] },
    messageInfo: {
      message: '',
      timestamp: new Date().getTime()
    },
    auth: {
      valid: true,
      unAuthTimes: 0,
      unAuthExcessive: false
    },
    log: ''
  }

  private playerRef = React.createRef<HTMLVideoElement>();

  showSnack: ShowSnack = (message, severity) => {
    this.setState({
      messageInfo: {
        timestamp: new Date().getTime(),
        message: message,
        severity: severity
      }
    });
  }

  addLog = (message: string) => {
    this.setState(logState => {
      return { log: logState.log + '\n' + message }
    });
  }



  handleExpired = () => {
    this.setState((preState) => {
      // when too many unauth times
      if (!preState.auth.valid && preState.auth.unAuthTimes > 10) {
        return {
          auth: {
            valid: false,
            unAuthTimes: preState.auth.unAuthTimes,
            unAuthExcessive: true
          }
        }
      }
      // when valid || (!valid && unAuthTimes <= 10)
      return {
        auth: {
          valid: false,
          unAuthTimes: preState.auth.unAuthTimes + 1,
          unAuthExcessive: false
        }
      }
    });
  }

  componentDidUpdate(_: any, prevState: State) {
    if (prevState.auth.valid === true && this.state.auth.valid === false) {
      authenticate(this.showSnack, this.handleAuthSuccess, this.addLog);
    }
  }

  handleAuthSuccess = () => {
    this.setState({
      auth: {
        valid: true,
        unAuthTimes: 0,
        unAuthExcessive: false
      }
    });
  }

  getChannels = () => {
    const channelsUrl = 'https://iptv.tsinghua.edu.cn/channels_tsinghua.json'
    Http.get({ url: channelsUrl }).then(response => {
      const message: Channels = response.data;
      this.setState({ channels: message });
    }).catch(error => this.showSnack(error.toString(), 'error'));
  }

  play = () => {
    this.setState({
      src: 'https://iptv.tsinghua.edu.cn/hls/cctv1hd.m3u8'
    });
  }

  render() {
    return (
      <>
        {this.state.showChannelList && <ChannelList channels={this.state.channels} />}
        {/* <Dialog
          open={this.state.auth.unAuthExcessive}
          onClose={}
        >

        </Dialog> */}
        <button onClick={this.getChannels}>channels</button>
        <button onClick={this.play}>play</button>
        <button onClick={() => { this.playerRef.current?.play() }}>start</button>
        <button onClick={() => { this.showSnack('asd', 'success') }}>asd</button>
        <Player
          playerRef={this.playerRef}
          src={this.state.src}
          onExpired={this.handleExpired}
        />
        <div>{this.state.log}</div>
        <Snackbar messageInfo={this.state.messageInfo} />
      </>
    );
  }
}

export default App;

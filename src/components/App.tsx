import React from 'react';
import { Http } from '@capacitor-community/http';
import { AlertColor, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import authenticate from './Authentication';
import ChannelList, { Channels } from './ChannelList';
import Snackbar, { MessageInfo } from './SnackBar';
import Player from './Player';

export type ShowSnack = (message: string, severity?: AlertColor) => void;

type State = {
  vid?: string;
  showChannelList: boolean;
  channels: Channels;
  messageInfo: MessageInfo;
  auth: {
    valid: boolean;
    unAuthTimes: number;
    unAuthExcessive: boolean;
  };
  log: string;
  showEmptyChannelAlert: boolean;
  showUnauthExcessiveAlert: boolean;
}

class App extends React.Component<{}, State> {

  state: State = {
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
    log: '',
    showEmptyChannelAlert: false,
    showUnauthExcessiveAlert: false
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

  handleKeyClick = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'Enter':
        // this.setState({ showChannelList: true });
        if (this.state.channels.Categories.length === 0) {
          this.setState({ showEmptyChannelAlert: true });
        } else {
          this.setState({ showChannelList: true });
        }
        break;
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyClick);
    this.setState({
      vid: 'cctv1hd'
    });
    this.getChannels();
  }

  componentDidUpdate(_: any, prevState: State) {
    if (prevState.auth.valid === true && this.state.auth.valid === false) {
      authenticate(this.showSnack, this.handleAuthSuccess, this.addLog);
    }
    if (prevState.auth.unAuthExcessive === false && this.state.auth.unAuthExcessive === true) {
      this.setState({
        showUnauthExcessiveAlert: true,
        vid: ''
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyClick);
  }

  handleAuthSuccess = () => {
    this.setState({
      auth: {
        valid: true,
        unAuthTimes: 0,
        unAuthExcessive: false
      }
    });
    this.getChannels();
  }

  getChannels = () => {
    const channelsUrl = 'https://iptv.tsinghua.edu.cn/channels_tsinghua.json'
    Http.get({ url: channelsUrl }).then(response => {
      if (response.status !== 200) {
        if (response.status === 401)
          this.handleExpired();
        else
          this.showSnack(`Get channels error ${response.status}. ${response.data}`);
        return;
      }
      const message: Channels = response.data;
      this.setState({ channels: message });
    }).catch(error => this.showSnack(error.toString(), 'error'));
  }

  handleSwitch = (vid: string) => {
    this.setState({
      vid: vid
    });
  }

  render() {
    return (
      <>
        <ChannelList
          open={this.state.showChannelList}
          channels={this.state.channels}
          onClose={() => { this.setState({ showChannelList: false }) }}
          onSwitch={this.handleSwitch}
          vid={this.state.vid}
        />

        <Dialog
          open={this.state.showEmptyChannelAlert}
          onClose={() => this.setState({ showEmptyChannelAlert: false })}
          aria-labelledby="empty-channel-alert-dialog-title"
          aria-describedby="empty-channel-alert-dialog-description"
        >
          <DialogTitle id="empty-channel-alert-dialog-title">
            {'当前节目列表为空'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="empty-channel-alert-dialog-description">
              {'是否重新获取？'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ showEmptyChannelAlert: false })}>
              取消
            </Button>
            <Button onClick={this.getChannels} autoFocus>
              重新获取
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={this.state.showUnauthExcessiveAlert}
          onClose={() => this.setState({ showUnauthExcessiveAlert: false })}
          aria-labelledby="unauth-alert-dialog-title"
          aria-describedby="unauth-alert-dialog-description"
        >
          <DialogTitle id="unauth-alert-dialog-title">
            {'授权失败'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="unauth-alert-dialog-description">
              {'是否重新请求？'}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ showUnauthExcessiveAlert: false })}>
              取消
            </Button>
            <Button onClick={() => authenticate(this.showSnack, this.handleAuthSuccess, this.addLog)} autoFocus>
              重新请求
            </Button>
          </DialogActions>
        </Dialog>

        <Player
          playerRef={this.playerRef}
          src={this.state.vid ? `https://iptv.tsinghua.edu.cn/hls/${this.state.vid}.m3u8` : ''}
          onExpired={this.handleExpired}
          showSnack={this.showSnack}
        />

        <div>{this.state.log}</div>
        <Snackbar messageInfo={this.state.messageInfo} />
      </>
    );
  }
}

export default App;

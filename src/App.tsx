import { Http } from '@capacitor-community/http';
import { Toast } from '@capacitor/toast';
import Hls, { LoaderCallbacks, LoaderConfiguration, LoaderContext } from 'hls.js';
import JSEncrypt from 'jsencrypt';
import React, { useEffect, useState } from 'react';
import ReactHlsPlayer from 'react-hls-player/dist';

import config from './config.json'

function App() {
  const playerID = 'player';

  const [src, setSrc] = useState('');
  const [expired, setExpired] = useState(false);

  const playerRef = React.useRef() as React.RefObject<HTMLVideoElement>;

  const showToast = function (text: string) {
    Toast.show({ text: text })
  }
  const reportError = function (error: any){
    showToast(error.toString())
  }
  const setCookie = function () {
    const idInitUrl = 'https://id.tsinghua.edu.cn/do/off/ui/auth/login/form/03a68a36239ff85fe2b1007aeb322549/0'
    const idCheckUrl = 'https://id.tsinghua.edu.cn/do/off/ui/auth/login/check'
    const iptvTicketUrl = 'https://iptv.tsinghua.edu.cn/thauth/roam.php'
    // get password
    Http.get({ url: config.passwordCipherUrl })
      .then(response => {
        const passwordCipher: string = response.data
        const decrypt = new JSEncrypt();
        decrypt.setPrivateKey(config.privateKey);  // base64 private key
        const password = decrypt.decrypt(passwordCipher);  // RSA/ECB/PKCS1Padding
        if (password === false) {
          showToast('Password cipher not valid');
          return;
        }
        // acquire session cookie of id.tsinghua.edu.cn
        Http.get({ url: idInitUrl })
          .then(response => {
            // get ticket
            Http.post({
              url: idCheckUrl,
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              data: {
                i_user: config.userID,
                i_pass: password,
                i_captcha: ''
              }
            }).then(response => {
              const message: string = response.data;
              const match = message.match(/ticket=(.*?)"/);
              if(!match){
                showToast('Ticket not found');
                return;
              }
              const ticket = match[1];
              // acquire cookie of iptv.tsinghua.edu.cn
              Http.get({
                url: iptvTicketUrl,
                params: {ticket: ticket}
              }).then(response => {
                const message: string = response.data;
                if(message.search('失败') !== -1){
                  showToast('Ticket not valid: ' + message);
                }
                // succeeded
                setExpired(false);
                showToast('Authentication succeeded')
              }).catch(reportError)
            }).catch(reportError)
          }).catch(reportError)
      }).catch(reportError)
  };
  const play = function () {
    setSrc('https://iptv.tsinghua.edu.cn/hls/cctv1hd.m3u8')
    playerRef.current?.play()
  }

  // unauthorize error handling
  class MyLoader extends Hls.DefaultConfig.loader {
    load(context: LoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<LoaderContext>): void {
      const onError = callbacks.onError;
      callbacks.onError = function (error, context, networkDetails) {
        if (error.code === 401) {
          // showToast('Cookie expired');
          if(!expired){
            setExpired(true);
            setCookie();
          }
        }
        onError(error, context, networkDetails);
      };
      super.load(context, config, callbacks);
    }
  }

  return (
    <div>
      <button onClick={play}>play</button>
      <div>{expired ? 'expired' : 'not expired'}</div>
      <div id={playerID}></div>
      <ReactHlsPlayer
        playerRef={playerRef}
        src={src}
        autoPlay={false}
        controls={true}
        width="100%"
        height="auto"
        hlsConfig={{
          loader: MyLoader,
          xhrSetup: function (xhr: XMLHttpRequest) {
            xhr.withCredentials = true; // do send cookies
          },
        }}
      />

    </div>
  );
}

export default App;

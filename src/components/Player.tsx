import React from 'react';
import ReactHlsPlayer from 'react-hls-player/dist';
import Hls, { LoaderCallbacks, LoaderConfiguration, LoaderContext } from 'hls.js';

import { ShowSnack } from './App';

import './Player.css'

function Player(props: {
  playerRef: React.RefObject<HTMLVideoElement>
  src: string
  onExpired: () => void
  showSnack: ShowSnack
}) {

  // unauthorize error handling
  class MyLoader extends Hls.DefaultConfig.loader {
    load(context: LoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<LoaderContext>): void {
      const onError = callbacks.onError;
      callbacks.onError = function (error, context, networkDetails) {
        if (error.code === 401) {
          // showToast('Cookie expired');
          props.onExpired();
        }
        onError(error, context, networkDetails);
      };
      super.load(context, config, callbacks);
    }
  }

  React.useEffect(()=>{
    function fireOnVideoStart(){
      props.showSnack('started', 'info')
    }
    props.playerRef.current?.addEventListener('play', fireOnVideoStart);
    return () => props.playerRef.current?.removeEventListener('play', fireOnVideoStart)
  }, [])

  return (
    <ReactHlsPlayer
      playerRef={props.playerRef}
      src={props.src}
      autoPlay={true} controls={false}
      hlsConfig={{
        loader: MyLoader,
        xhrSetup: (xhr: XMLHttpRequest) => { xhr.withCredentials = true; }  // do send cookies
      }} />
  )
}

export default React.memo(Player);
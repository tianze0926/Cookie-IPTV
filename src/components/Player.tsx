import React from 'react';
import ReactHlsPlayer from 'react-hls-player/dist';
import Hls, { LoaderCallbacks, LoaderConfiguration, LoaderContext } from 'hls.js';

function Player(props: {
  playerRef: React.RefObject<HTMLVideoElement>
  src: string
  onExpired: () => void
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

  return (
    <ReactHlsPlayer
      playerRef={props.playerRef}
      src={props.src}
      autoPlay={false} controls={true}
      width="100%" height="auto"
      hlsConfig={{
        loader: MyLoader,
        xhrSetup: (xhr: XMLHttpRequest) => { xhr.withCredentials = true; }  // do send cookies
      }} />
  )
}

export default React.memo(Player);
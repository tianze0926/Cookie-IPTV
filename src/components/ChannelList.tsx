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

function ChannelList(props: {
  channels: Channels
}) {

  return (
    <div style={{
      position: 'fixed', width: "100%", height: "100%",
      backgroundColor: 'white', zIndex: 1
    }}>

    </div>
  )
}

export default ChannelList;
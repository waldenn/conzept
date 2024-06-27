import React, {useMemo} from "react";
import { useSearchParams } from "react-router-dom";
import useAppWide from "../providers/appWide/hook";
import Wrapper from "../components/Wrapper";
import VideoJS from "../components/VideoJS";

const Player = () => {
    const {state: {channels}} = useAppWide();
    let [searchParams] = useSearchParams();
    const playerRef = React.useRef(null);
    
    const handlePlayerReady = (player) => {
        playerRef.current = player;
    
        // You can handle player events here, for example:
        player.on('waiting', () => {
            console.log('player is waiting');
        });
    
        player.on('dispose', () => {
            console.log('player will dispose');
        });

        //player.on('ready', () => {
        //    console.log('player ready');
        //});
    };

    let channel = useMemo(() => {
        const channelId = searchParams.get('channelId');
        return channels.filter((eachChannel) => '' + eachChannel.id === channelId)[0]
    }, [channels, searchParams])

    // see: https://videojs.com/guides/options/
    return ( 
        <Wrapper>
            <span class="my-ui-back"><a href="#" onclick="window.history.back(); return false;">&larr;</a></span>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} >
                <div title="FooBar" style={{width: '90vw', maxWidth: '860px', marginTop: '30px'}} >
                    <VideoJS options={{
                        autoplay: true,
                        controls: true,
                        responsive: true,
                        fluid: true,
                        playsinline: true,
                        sources: [{
                        src: channel.url,
                        type: 'application/x-mpegURL'
                        }]
                    }} onReady={handlePlayerReady} />
                </div>
                <div style={{
                    width: '100%',
                    minHeight: '50px',
                    maxHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    marginTop: '20px',
                    }} >
                    <img loading="lazy" style={{maxWidth: 150, maxHeight: 80}} src={channel.logo} alt={channel.name} />
                    <div>{channel.name}</div>
                </div>
            </div>
        </Wrapper>
    )
}

export default Player;

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
    };

    let channel = useMemo(() => {
        const channelId = searchParams.get('channelId');
        return channels.filter((eachChannel) => '' + eachChannel.id === channelId)[0]
    }, [channels, searchParams])

    console.log( channel );

    return (
        <Wrapper>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} >
                <div style={{width: '80vw', maxWidth: '860px', marginTop: '30px'}} >
                    <VideoJS options={{
                        autoplay: false,
                        controls: true,
                        responsive: true,
                        fluid: true,
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

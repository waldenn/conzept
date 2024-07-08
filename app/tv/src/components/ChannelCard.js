import React from "react";
import { useNavigate } from "react-router-dom";
import {capitalizeFirstLetter} from "../helpers";

const ChannelCard = ({channel}) => {
    const navigate = useNavigate();
    
    const gotoPlayer = (id) => {
        navigate(`/tvplayer?channelId=${id}`)
    }

    return (
        <div style={{
            width: '250px',
            height: '100px',
            display: 'flex', 
            flexDirection: 'row',
            boxShadow: '0px 0px 6px 0px lightgray',
            borderRadius: '4px',
            margin: '10px',
            cursor: 'pointer',
        }} onClick={() => gotoPlayer(channel.id)} >
            <div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex'}}>
                <img style={{maxWidth: 80, maxHeight: 80}} src={channel.logo} alt={channel.name} />
            </div>
            <div style={{flex: 1, padding: '5px', fontSize: '0.8rem'}} >
                <div style={{}}>{channel.name}</div>
                <div style={{fontWeight: 600, marginTop: '5px'}} >Genre:</div>
                <div>{channel.group.map(capitalizeFirstLetter).join(', ')}</div>
            </div>
        </div>
    )
}

export default ChannelCard;
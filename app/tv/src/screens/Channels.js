import React, {useState, useEffect} from "react";
import Wrapper from "../components/Wrapper";
import { useSearchParams } from "react-router-dom";
import useAppWide from "../providers/appWide/hook";
import ChannelCard from "../components/ChannelCard";

const Channels = () => {
    const {state: {channels: channelData}} = useAppWide();
    let [searchParams] = useSearchParams();
    const [channels, setChannels] = useState([]);

    const getChannelsForCountry = (data, filter)  => {
        return data.filter((eachChannel) => eachChannel?.country?.code === filter);
    }

    const getChannelsForCategory = (data, filter) => {
        return data.filter((eachChannel) => eachChannel?.group.includes(filter));
    }

    const getChannels = () => {
        const country = searchParams.get('country');
        const category = searchParams.get('category');
        if(country && !category) {
            setChannels(getChannelsForCountry(channelData, country));
        }
        if(category && !country) {
            setChannels(getChannelsForCategory(channelData, category));
        }
    }

    useEffect(() => {
        if(channels.length < 1) {
            getChannels();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    return(
        <Wrapper>
            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '20px',}} >
            {
                channels.map((eachChannel, idx) => (
                        <ChannelCard key={idx} channel={eachChannel} />
                    )
                )
            }
            </div>
        </Wrapper>
    )
}

export default Channels;
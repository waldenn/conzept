const {writeFile} = require('fs');
const {getName} = require('country-list');

const DEFAULT_PLAYLIST = 'https://iptv-org.github.io/iptv/index.nsfw.m3u';

const getCountryName = (data) => {
    try {
        if(!data) {
            return ''
        }
        const index = data.indexOf('.')
        let countryCode = data.slice(index + 1, index + 3).toUpperCase().replaceAll('"', '');
        if(countryCode === 'UK') {
            countryCode = 'GB'
        }
        return {code: countryCode};
    }catch (e) {
        console.debug(e)
        return ''
    }
    
}

const getLogo = (data) => {
    try {
        return data.replaceAll('"', '');
    }catch (e) {
        console.debug(e)
        return ''
    }
}

const getChannelName = (data) => {
    try {
        const namePreProcessed = data.split(',')
        return namePreProcessed[namePreProcessed.length - 1]
    }catch (e) {
        console.debug(e)
        return ''
    }
    
}

const getChannelCategories = (data) => {
    try {
        let preprocessedGroup = data.split(',')[0];
        preprocessedGroup = preprocessedGroup.split("user-agent")[0];
        preprocessedGroup = preprocessedGroup.replaceAll('"', '')
        preprocessedGroup = preprocessedGroup.replaceAll(' ', '')
        preprocessedGroup = preprocessedGroup.split(';')
        return preprocessedGroup
    }catch (e) {
        console.debug(e)
        return ''
    }
}


const playlistParser = async (url=DEFAULT_PLAYLIST) => {
    const rawData = await fetch(DEFAULT_PLAYLIST);
    let rawPlaylist = await rawData.text();
    rawPlaylist = rawPlaylist.replace('#EXTM3U\n', '')
    rawPlaylist = rawPlaylist.split('#EXTINF:-1 ')
    const channels = []
    rawPlaylist.forEach((element, idx) => {
        if(!element) {
            return
        }
        const splitData = element.split('\n');
        const url = splitData.filter((eachStr) => {
            let isUrl = false;
            try {
                new URL(eachStr);
                isUrl = true;
            } catch (_) {
                isUrl = false;
            }
            return isUrl
        })[0]
        const channelData = splitData[0]
        const preprocessedChannelData = channelData.replace('tvg-id=', '@').replace(' tvg-logo=', '@').replace(' group-title=', '@').split('@');
        const country = getCountryName(preprocessedChannelData[1])
        const logo = getLogo(preprocessedChannelData[2])
        const name = getChannelName(preprocessedChannelData[3])
        const categories = getChannelCategories(preprocessedChannelData[3])
        
        channels.push({id: idx, url, country, logo, name, group: categories})
    });
    return channels;
}

const getCategories = (channels) => {
    let group = [];
    channels.forEach((eachChannel) => {
        eachChannel.group.forEach((eachGroup) => {
            if(!group.includes(eachGroup) && eachGroup !== "") {
                group.push(eachGroup)
            }
        })
    })
    return group.sort();
}

const getCountries = (channels) => {
    let countries = [];
    channels.forEach((eachChannel) => {
        const index = countries.findIndex((eachCountry) => eachCountry.code === eachChannel.country.code)
        
        if(index < 0 && eachChannel.country.code !== "") {
            let countryName =  getName(eachChannel.country.code)
            let country = {...eachChannel.country, name: countryName};
            countries.push(country);
        }
    })
    return countries.sort((a, b) => {
        if ( a.name < b.name ){
            return -1;
        }
        if ( a.name > b.name ){
        return 1;
        }
        return 0;
    });
}

playlistParser().then((playlist) => {
    // get countries.
    const countries = getCountries(playlist);
    // get categories.
    const categories = getCategories(playlist);
    const toWrite = {channels: playlist, countries, categories}
    writeFile('./playlist.json', JSON.stringify(toWrite, null, 2), (error) => {
        if (error) {
          console.log('An error has occurred ', error);
          return;
        }
        console.log('Data written successfully to disk');
      });
});

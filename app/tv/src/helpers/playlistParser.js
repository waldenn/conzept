const URL = '../playlist.json'; // 'https://raw.githubusercontent.com/shriram-k/iptv-viewer/master/playlist.json';

const getDataFromGithub = async () => {
    const data = await fetch(URL);
    if(data.status !== 200) {
        throw Error();
    }
    return await data.json();
}

const playlistParser = async () => {
    let rawData = {};
    try {
        const resp = await getDataFromGithub();
        return resp;
    }catch(e) {
        console.error(e)
    }
    return rawData;
}

export default playlistParser

import React, { useState, useEffect } from 'react';
import Aside from './components/Aside';
import Player from './components/Player';
import Popup from './components/Popup';
import { isBrowser, isMobile } from 'react-device-detect';

const App = () => {
  const [show, setShow] = useState(false);
  const [channel, setChannel] = useState({
    url: null,
    urls: [],
    keyword: '',
    toggle: false,
  });
  const { keyword, url, toggle, urls } = channel;

  // CONZEPT PATCH
	function getParameterByName( name, url ) {

		if ( !url ){
			url = window.location.href;
		}

		const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
		const results = regex.exec( url );

		if (!results) return undefined;
		if (!results[2]) return '';

		return decodeURIComponent( results[2].replace(/\+/g, " ") );

	}

  const handlePlay = (currentUrl) => {
    if (isBrowser) {
      setChannel({
        ...channel,
        url: `${currentUrl}`,
        //url: `https://cors-unlimited.herokuapp.com/${currentUrl}`,
        keyword: '',
      });
    }
    if (isMobile) {
      window.open(currentUrl, '_blank');
    }
  };
  // END CONZEPT PATCH

  useEffect(() => {

    /*
    const mainUrls = [
      //`https://cors-unlimited.herokuapp.com/https://raw.githubusercontent.com/iptv-org/iptv/master/index.m3u`,
      //`https://cors-unlimited.herokuapp.com/https://iptv-org.github.io/iptv/categories/xxx.m3u`,
    ];
    const mainPromises = mainUrls.map(
      async (url) => await fetch(url).then(async (y) => await y.text())
    );
    Promise.all(mainPromises)
      .then((results) => {
        const [primary, secondary] = results;
        let codes = primary
          .split('#')
          .map((i) => i.replace(/\n/gi, ''))
          .filter((i) => i !== '')
          .filter((i) => (i.includes('EXTM3U') ? null : i))
          .map((i) => i.split('channels'))
          .map((i) => i[0])
          .map((i) => i.split(','))
          .map((i) => i[1]);
        let badLinks = secondary
          .split('#')
          .map((i) => i.replace(/\n/gi, ''))
          .filter((i) => i !== '')
          .filter((i) => (i.includes('EXTM3U') ? null : i))
          .map((i) => i.split('group-title')[1])
          .map((i) => {
            const currentIndex = i.indexOf('http');
            const currentUrl = i.slice(currentIndex);
            return currentUrl;
          });
        codes.unshift('Universal');
        const urls = primary
          .split('#')
          .map((i) => i.replace(/\n/gi, ''))
          .map((i) => i.replace(/EXTINF:-1,/gi, ''))
          .filter((i) => i !== '')
          .filter((i) => (i.includes('EXTM3U') ? null : i))
          .map((i) => i.split('/'))
          .map((i) => i[1])
          .map((i) => i.split('.'))
          .map((i) => i[0])
          .map(
            (i) =>
              `https://cors-unlimited.herokuapp.com/https://raw.githubusercontent.com/iptv-org/iptv/master/channels/${i}.m3u`
          );
        urls.unshift(
          'https://cors-unlimited.herokuapp.com/https://raw.githubusercontent.com/iptv-org/iptv/master/channels/unsorted.m3u'
        );
        const promises = urls.map((url) => fetch(url).then((y) => y.text()));
        Promise.all(promises).then((results) => {
          const data = results
            .map((i) => i.split('#'))
            .map((i) => i.filter((j) => j !== ''))
            .map((i) => i.filter((j) => (j.includes('EXTM3U') ? null : j)))
            .map((i) => i.map((j) => j.split(',')))
            .map((i) => i.map((j) => j[1]))
            .map((i) => i.filter((j) => (typeof j === undefined ? null : j)))
            .map((i) => i.map((j) => j.split('\n')))
            .map((i, index) =>
              i.map((j) => ({ title: j[0], url: j[1], country: codes[index] }))
            )
            .filter((i) => i.length !== 0)
            .map((i) =>
              i.sort((a, b) =>
                a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1
              )
            )
            .map((i) =>
              i.filter((j) => (badLinks.indexOf(j.url) === -1 ? j : false))
            )
            .map((i) => i.filter((j) => (j.title.includes('XXX') ? false : j)));
          // .map((i) =>
          //   i.map((j) => {
          //     console.log(badLinks.some((k) => k === j.url));
          //     return j;
          //   })
          // );
          setChannel({
            ...channel,
            urls: data,
          });

        });

      })
      .catch((e) => console.log(e));

      */

      // CONZEPT PATCH
      const url_param = getParameterByName( 'url' );
      handlePlay( url_param );

    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Aside
        keyword={keyword}
        toggle={toggle}
        channel={channel}
        setShow={setShow}
        setChannel={setChannel}
      />
      <Player url={url} />
      <Popup
        urls={urls}
        show={show}
        setShow={setShow}
        channel={channel}
        setChannel={setChannel}
      />
    </>
  );
};

export default App;

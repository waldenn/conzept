import React from 'react';
import ReactPlayer from 'react-player';
import { FaListUl } from 'react-icons/fa';
import { BsArrowsFullscreen } from 'react-icons/bs';

const Player = ({ url }) => {
  return (
    <>
      {url === null ? (
        <div className='banner vh-100 vw-100 d-flex flex-column justify-content-center align-items-center text-white'>
          <div className='banner__text mx-3 text-center w-75'>
            <h1 className='m-0 mb-3'>
              <strong>Jackal</strong> brings you IPTV for Web!
            </h1>
            <p>
              Enter M3U8 URL <em className='mx-1'>or</em> See available channels
              by pressing{' '}
              <span className='mx-1'>
                <FaListUl />
              </span>{' '}
              button
            </p>
            <p>
              Watch TV channel in theatre mode by pressing{' '}
              <span className='mx-1'>
                <BsArrowsFullscreen />
              </span>{' '}
              button
            </p>
            <p>If you are using a phone, Stream will open in a new tab.</p>
            <p>
              This application endorse general content only. The database comes
              from{' '}
              <a
                href='https://github.com/iptv-org/iptv'
                target='_blank'
                rel='noopener noreferrer'
              >
                <strong>IPTV</strong>
              </a>
              's repository. If a user notice any unwanted stream listed here,
              please report the stream &nbsp;
              <a
                href='https://github.com/tpkahlon/javascript/pulls'
                target='_blank'
                rel='noopener noreferrer'
              >
                <strong>here</strong>
              </a>
              . Such stream will be taken down immediately.
            </p>
          </div>
        </div>
      ) : (
        <ReactPlayer className='app' playing controls url={url} />
      )}
    </>
  );
};

export default Player;

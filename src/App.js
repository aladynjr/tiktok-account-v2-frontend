import './App.scss';
import React, { useEffect, useState, useRef } from 'react';
//import Tooltip from '@mui/material/Tooltip';
import { BiError } from 'react-icons/bi';
import io from 'socket.io-client';
import Tooltip from './components/Tooltip';
import { AiFillCheckCircle } from 'react-icons/ai';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import { BiMessageError } from 'react-icons/bi';
import axios from 'axios';
import { FaFileCsv } from 'react-icons/fa';
import { FaLink } from 'react-icons/fa';

import { MdOutlineError } from 'react-icons/md';

var SERVER_HOST = 'http://147.182.131.203:5001';
//var SERVER_HOST = 'http://localhost:8080';

const socket = io(SERVER_HOST);

function App() {
  //http://localhost:8080


  const JoinRoom = (roomCode) => {
    socket.emit('join_room', { roomCode });

  }


  //receive socket messages 
  const [fetchingMessage, setFetchingMessage] = useState(null);
  useEffect(() => {

    //recieve messages
    var pastMessage1;
    socket.on('scrapingUpdate', data => {
      if (pastMessage1 !== data) {
        //  console.log('someone sent a message')
        // console.log(data)
        setFetchingMessage(data)
        pastMessage1 = data;

      }
    })


  }, [socket])

  //input
  const [videoLink, setVideoLink] = useState('')

  //loading
  const [loadingAccountVideos, setLoadingAccountVideos] = useState(false);

  //results
  /*const [accountVideos, setAccountVideos] = useState([
    'https://www.tiktok.com/@tunisian_series3/video/7160405297272507653',
    'https://www.tiktok.com/@tunisian_series3/video/7160362907492961541',
    'https://www.tiktok.com/@tunisian_series3/video/7160077387735043334',
  ]);*/
  const [accountVideos, setAccountVideos] = useState(null)

  //send username to backend, route to /scrape/:username
  const [scrapingAccountVideosErrorMessage, setScrapingAccountVideosErrorMessage] = useState('');

  /* const [scrapingResult, setScrapingResult] = useState(
     {
       allDownloadLink: "localhost:8080/redirect/zip/saba._.tabaza",
       newDownloadLink: "localhost:8080/redirect/zip/saba._.tabaza-new",
       profileVideosCount: 7,
       profileUsername: "saba._.tabaza",
       allDownloadedVideosCount: 6,
       newDownloadedVideosCount: 1
     })*/

  const [scrapingResult, setScrapingResult] = useState(null)

  const GetAccountVideos = async () => {
    setScrapingAccountVideosErrorMessage('');
    setLoadingAccountVideos(true);
    setScrapingResult(null);


    var videoId = videoLink /*videoLink.substring(videoLink.indexOf('/video/') + 7, videoLink.indexOf('/video/') + 7 + 19)*/;
    

    //join socket room
    JoinRoom(videoId)

    try {
      const response = await fetch(`${SERVER_HOST}/api/${videoId}`, { //it's not videoId but username 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        }
      });
      const data = await response.json();
      console.log(data)
      setScrapingResult(data)

    } catch (error) {
      setScrapingAccountVideosErrorMessage(error.message);
      setLoadingAccountVideos(false);
    }
    finally {
      setLoadingAccountVideos(false);
    }
  }


  //show tooltip after whenever we get a new message from socket 
  const [showFetchingTooltip, setShowFetchingTooltip] = useState(false);
  useEffect(() => {
    if (fetchingMessage) {
      setShowFetchingTooltip(true);

    }
  }, [fetchingMessage])

  useEffect(() => {
    if (!loadingAccountVideos) {
      setTimeout(() => {
        setShowFetchingTooltip(false);
      }, 4000);
    }
  }, [loadingAccountVideos])


  return (
    <div className="App" style={{ paddingTop: '100px', paddingBottom: '350px' }} >

      <div style={{ width: '90%', maxWidth: '500px', margin: "auto" }} >
        <h1 style={{ textAlign: 'left' }} className='text-3xl mb-4 font-semibold' >TikTok Account Videos Downloader</h1>
        <h3 style={{ marginTop: '-10px', opacity: '0.9', fontWeight: '200', textAlign: 'left' }} className='text-lg' >
        Please enter the Account Username below</h3>

   
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '40px' }} >
          <p style={{ opacity: '0.5', fontSize: '20px', marginRight: '7px' }} >@</p>
          <input type="text" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder="username" data-e2e="common-StringInput-TUXTextInput" className="css-5g0doo eyio37s1 snipcss-woI25" />


        </div>
        <Tooltip show={showFetchingTooltip} tooltip={fetchingMessage} loading={loadingAccountVideos} >

          <button type="button"
            style={{ opacity: (loadingAccountVideos) && '0.5', pointerEvents: (loadingAccountVideos) && 'none' }}
            onClick={() => { GetAccountVideos() }}
            className="inline-block mt-9 px-7 py-3 bg-rose-500 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-rose-600 hover:shadow-lg  focus:shadow-lg focus:outline-none focus:ring-0  focus:shadow-lg transition duration-150 ease-in-out ">
            Start

          </button>
        </Tooltip>

        <div className="lds-ripple" style={{ display: !loadingAccountVideos && 'none', opacity: loadingAccountVideos ? '1' : '0', marginBottom: '-30px' }}><div></div><div></div></div>
        {scrapingResult && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: 'auto', width: 'fit-content', marginTop: '40px' }} >

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (scrapingResult) ? '1' : '0.5' }} >
            <AiFillCheckCircle className='StepsNumber' style={{ backgroundColor: scrapingResult && 'limegreen' }} />

            {scrapingResult?.profileUsername && <p className='StepsLabel' ><b>{scrapingResult.profileUsername}</b> profile scraped !   &nbsp;
              {accountVideos &&
                <b>({accountVideos?.length} video)
                </b>
              }
            </p>}

          </div>
          {scrapingAccountVideosErrorMessage && <div style={{ color: 'red', fontWeight: '400' }} ><BiError /> {scrapingAccountVideosErrorMessage}</div>}

          <div className='FirstStepContent' style={{ borderLeft: '1px solid lightgrey', paddingLeft: '30px', marginLeft: '20px', marginTop: '30px' }} >

            <div className="text-green-500 mt-0 mb-4 hover:text-green-600 text-sm transition duration-300 ease-in-out mb-4 bg:black py-2 px-4 bg-slate-100 rounded-md w-full 	 "   >
              <p className={clsx('ml-2  font-sm text-left  font-normal text-gray-600')} >  Total profile videos : <b> {scrapingResult?.profileVideosCount}</b> videos  </p>
            </div>
            
            {scrapingResult?.newDownloadedVideosCount && <div className="text-green-500 mt-0 mb-4 hover:text-green-600 text-sm transition duration-300 ease-in-out mb-4 bg:black py-2 px-4 bg-slate-100 rounded-md w-full flex	 "   >
              {<p className='ml-2 text-green-400 font-sm text-right  text-md' ><AiFillCheckCircle style={{ marginLeft: '3px', marginTop: '3px' }} /></p>}
              <div >
                <p className={clsx('ml-2  font-sm text-left  font-normal text-green-600')} >  Videos scraped now : <b> {scrapingResult?.newDownloadedVideosCount}</b> videos  </p>
                <a href={scrapingResult?.newDownloadLink} target={'_blank'} className={'ml-2  font-sm text-left  font-semibold text-blue-500 underline'} > Download new videos </a>
              </div>

            </div>}
            <div className="text-green-500 mt-0 mb-4 hover:text-green-600 text-sm transition duration-300 ease-in-out mb-4 bg:black py-2 px-4 bg-slate-100 rounded-md w-full flex	 "   >
              {<p className='ml-2 text-green-400 font-sm text-right  text-md' ><AiFillCheckCircle style={{ marginLeft: '3px', marginTop: '3px' }} /></p>}
              <div >
                <p className={'ml-2  font-sm text-left  font-normal text-green-600'} >  Total scraped videos : <b> {scrapingResult?.allDownloadedVideosCount}</b> videos  </p>
                <a href={scrapingResult?.allDownloadLink} target={'_blank'} className={'ml-2  font-sm text-left  font-semibold text-blue-500 underline'} > Download all videos </a>
              </div>
            </div>

            {((scrapingResult?.profileVideosCount - scrapingResult?.allDownloadedVideosCount) > 0) && <div className="text-green-500 mt-0 mb-4 hover:text-green-600 text-sm transition duration-300 ease-in-out mb-4 bg:black py-2 px-4 bg-slate-100 rounded-md w-full flex	 "   >
              {<p className='ml-2 text-red-400 font-sm text-right  text-md' ><MdOutlineError style={{ marginLeft: '3px', marginTop: '3px' }} /></p>}
              <div >
                <p className={'ml-2  font-sm text-left  font-normal text-red-500'} >  Videos failed to be scraped : <b> {scrapingResult?.profileVideosCount - scrapingResult?.allDownloadedVideosCount}</b> video{(scrapingResult?.profileVideosCount - scrapingResult?.allDownloadedVideosCount) > 1 && 's'}  </p>
              </div>
            </div>}

          </div>



        </div>}
      </div>

    </div>
  );
}

export default App;

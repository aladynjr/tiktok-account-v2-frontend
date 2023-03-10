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

var SERVER_HOST = 'https://myviraltok.com';
//var SERVER_HOST = 'http://165.22.70.193:8080';
//var SERVER_HOST = 'http://147.182.131.203:5001';
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
  const [usernameInput, setUsernameInput] = useState('')

  //loading
  const [loadingAccountVideos, setLoadingAccountVideos] = useState(false);

  //send username to backend, route to /scrape/:username
  const [scrapingAccountVideosErrorMessage, setScrapingAccountVideosErrorMessage] = useState('');



  const [usernames, setUsernames] = useState(null)
  var counter = 0;

  const GetAllUsernames = async () => {
    setLoadingAccountVideos(true);
    counter = 0;

    try {
      const response = await fetch(`${SERVER_HOST}/api/spreadsheet/all`, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        }
      });
      const data = await response.json();
      console.log(data)
      setUsernames(data)
      console.log(usernames)


    } catch (error) {
      setScrapingAccountVideosErrorMessage(error.message);
      setLoadingAccountVideos(false);
    }
    finally {
      setLoadingAccountVideos(false);
    }
  }



  const [scrapingResults, setScrapingResults] = useState([])

  const GetAccountVideos = async (bulk) => {
    setScrapingAccountVideosErrorMessage('');
    setLoadingAccountVideos(true);


    var username = usernameInput; /*videoLink.substring(videoLink.indexOf('/video/') + 7, videoLink.indexOf('/video/') + 7 + 19)*/;
    if (bulk) {
      console.log('using bulk usernames ! current username : ' + usernames[counter] + '    counter : ' + (counter) + ' / ' + (usernames?.length - 1))
      username = usernames[counter]
      setLoadingAccountVideos(true);

    }

    //join socket room
    JoinRoom(username)

    try {
      const response = await fetch(`${SERVER_HOST}/api/user/${username}`, { //it's not videoId but username 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        }
      });
      const data = await response.json();

      var newItem = data?.error ? { ...data, error: data?.message } : data;
      console.log(data)


      setScrapingResults(scrapingResults => [newItem, ...scrapingResults])

      if (bulk && (counter != (usernames?.length - 1))) {
        counter += 1;
        console.log('counter : ' + (counter) + ' / ' + (usernames?.length - 1) + '  started scraping username ' + usernames[counter] + '')

        GetAccountVideos(bulk)
      } else {
        setLoadingAccountVideos(false);
      }



    } catch (error) {
      setScrapingAccountVideosErrorMessage(error.message);
      if (!bulk) setLoadingAccountVideos(false);

    }
    finally {
      if (!bulk) setLoadingAccountVideos(false);
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
          <p style={{ opacity: (usernameInput == 'all') ? '0' : '0.5', fontSize: '20px', marginRight: '7px' }} >@</p>
          <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="username" data-e2e="common-StringInput-TUXTextInput" className="css-5g0doo eyio37s1 snipcss-woI25" />


        </div>
        <Tooltip show={showFetchingTooltip} tooltip={fetchingMessage} loading={loadingAccountVideos} >

          <button type="button"
            style={{ opacity: (loadingAccountVideos) && '0.5', pointerEvents: (loadingAccountVideos) && 'none' }}
            onClick={() => {
              if ((usernameInput == 'all') && !usernames) {
                GetAllUsernames()
              } else if ((usernameInput == 'all') && usernames) {

                GetAccountVideos(true)
              } else {
                GetAccountVideos()
              }
            }}
            className={clsx("inline-block mt-9 px-7 py-3 bg-rose-500 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-rose-600 hover:shadow-lg  focus:shadow-lg focus:outline-none focus:ring-0  focus:shadow-lg transition duration-150 ease-in-out ", ((usernameInput == 'all') && usernames) && 'bg-orange-500')}>
            {((usernameInput == 'all') && usernames) ? 'Start Bulk' : 'Start'}

          </button>
        </Tooltip>

        <div className="lds-ripple" style={{ display: !loadingAccountVideos && 'none', opacity: loadingAccountVideos ? '1' : '0', marginBottom: '-30px' }}><div></div><div></div></div>
        {scrapingAccountVideosErrorMessage && <div style={{ color: 'red', fontWeight: '400' }} ><BiError /> {scrapingAccountVideosErrorMessage}</div>}


        {scrapingResults && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: 'auto', width: 'fit-content', marginTop: '40px' }} >

          {scrapingResults.map((scrapingResult, i) => {
            return (
              <div key={i} style={{ marginBottom: '30px', marginTop: '20px' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', opacity: (scrapingResult) ? '1' : '0.5' }} >
                  {scrapingResult.allDownloadLink ? <AiFillCheckCircle className='StepsNumber' style={{ backgroundColor: scrapingResult && 'limegreen' }} /> : <BiError className='StepsNumber' style={{ color: 'red', background: 'none' }} />}

                  {scrapingResult?.allDownloadLink ? <p className='StepsLabel' ><b>{scrapingResult.profileUsername}</b> profile scraped !   &nbsp;
                  </p> : <p className='StepsLabel' style={{ color: 'red', textAlign: 'left' }}><b>{scrapingResult?.profileUsername} </b> Something went wrong, couldn't scrape profile !</p>}


                </div>

                <div className='FirstStepContent' style={{ borderLeft: '1px solid lightgrey', paddingLeft: '30px', marginLeft: '20px', marginTop: '30px' }} >
                  {scrapingResult?.error && <div style={{ color: 'red', fontWeight: '400', fontSize: '10px', marginBlock: '10px' }} > {scrapingResult?.error}</div>}

                  <div className="text-green-500 mt-0 mb-4 hover:text-green-600 text-sm transition duration-300 ease-in-out mb-4 bg:black py-2 px-4 bg-slate-100 rounded-md w-full 	 "   >
                    <p className={clsx('ml-2  font-sm text-left  font-normal text-gray-600')} >  Total profile videos : <b> {scrapingResult?.profileVideosCount || 0}</b> videos  </p>
                  </div>

                  {scrapingResult?.newDownloadedVideosCount && <div className="text-green-500 mt-0 mb-4 hover:text-green-600 text-sm transition duration-300 ease-in-out mb-4 bg:black py-2 px-4 bg-slate-100 rounded-md w-full flex	 "   >
                    {<p className='ml-2 text-green-400 font-sm text-right  text-md' ><AiFillCheckCircle style={{ marginLeft: '3px', marginTop: '3px' }} /></p>}
                    <div >
                      <p className={clsx('ml-2  font-sm text-left  font-normal text-green-600')} >  Videos scraped now : <b> {scrapingResult?.newDownloadedVideosCount || 0}</b> videos  </p>
                      <a href={scrapingResult?.newDownloadLink} target={'_blank'} className={'ml-2  font-sm text-left  font-semibold text-blue-500 underline'} > Download new videos </a>
                    </div>

                  </div>}
                  <div className="text-green-500 mt-0 mb-4 hover:text-green-600 text-sm transition duration-300 ease-in-out mb-4 bg:black py-2 px-4 bg-slate-100 rounded-md w-full flex	 "   >
                    {<p className='ml-2 text-green-400 font-sm text-right  text-md' ><AiFillCheckCircle style={{ marginLeft: '3px', marginTop: '3px' }} /></p>}
                    <div >
                      <p className={'ml-2  font-sm text-left  font-normal text-green-600'} >  Total scraped videos : <b> {scrapingResult?.allDownloadedVideosCount || 0}</b> videos  </p>
                      {scrapingResult?.allDownloadLink && <a href={scrapingResult?.allDownloadLink} target={'_blank'} className={'ml-2  font-sm text-left  font-semibold text-blue-500 underline'} > Download all videos </a>}
                    </div>
                  </div>

                  {((scrapingResult?.profileVideosCount - scrapingResult?.allDownloadedVideosCount) > 0) && <div className="text-green-500 mt-0 mb-4 hover:text-green-600 text-sm transition duration-300 ease-in-out mb-4 bg:black py-2 px-4 bg-slate-100 rounded-md w-full flex	 "   >
                    {<p className='ml-2 text-red-400 font-sm text-right  text-md' ><MdOutlineError style={{ marginLeft: '3px', marginTop: '3px' }} /></p>}
                    <div >
                      <p className={'ml-2  font-sm text-left  font-normal text-red-500'} >  Videos failed to be scraped : <b> {scrapingResult?.profileVideosCount - scrapingResult?.allDownloadedVideosCount}</b> video{(scrapingResult?.profileVideosCount - scrapingResult?.allDownloadedVideosCount) > 1 && 's'}  </p>
                    </div>
                  </div>}

                </div>
              </div>


            )
          })}


        </div>}
      </div>

    </div>
  );
}

export default App;

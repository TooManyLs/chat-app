import React, { useState } from 'react';
import './StartScreen.css';

const StartScreen = ({isLogged, send_msg, setShowModal}) => {

  let [reason, setReason] = useState("Please enter channel name.");

  const connect = () => {
    let input = document.querySelector("#channel-input");

    let inv = input.classList[2];
    if (!inv) {
      input.className += " is-invalid";
    }

    if (!input.value) {
      setReason("Please enter channel name.");
      return;
    }
    setReason("There is no channel with that name.");

    send_msg({type: "connect", channelName: input.value})
  }

  return(
    <div className="StartScreen">
      {!isLogged 
      ? <h1 className='huge-text'>Log in to start chatting</h1> 
      : <div>
          <p className='fs-5 pb-3'>Connect to an existing channel:</p>
          <input className='form-control mb-3' id="channel-input" type="text" />
          <label className='invalid-feedback small inv-field' htmlFor="channel-input">
            {reason}
          </label>
          <button onClick={connect} className='btn btn-dark'>Connect</button>
          <p className='fs-5 pt-3'>
            or
            <button onClick={() => setShowModal(true)} className='btn btn-outline-dark new-chat mx-3'>Create</button>
            your own
          </p>          
        </div>
      }
    </div>
  );
};


export default StartScreen;

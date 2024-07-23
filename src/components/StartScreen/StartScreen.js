import React, { useState } from 'react';
import './StartScreen.css';

const StartScreen = ({isLogged, send_msg}) => {

  const [empty, setEmpty] = useState(true)

  const connect = () => {
    let input = document.querySelector("#channel-input");
    let inv = input.classList[2];
    if (inv) {
      input.classList.remove(inv);
    }
    if (!input.value) {
      setEmpty(true)
      input.className += " is-invalid";
      return;
    }
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
                   {empty ? "Please enter channel name." : "There is no channel with that name."}
          </label>
          <button onClick={connect} className='btn btn-dark'>Connect</button>
          <p className='fs-5 pt-3'>
            or
            <button className='btn btn-outline-dark new-chat mx-3'>Create</button>
            your own
          </p>          
        </div>
      }
    </div>
  );
};


export default StartScreen;

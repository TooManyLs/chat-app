import React, { useEffect } from 'react';
import './ChatboxHeader.css';
import leaveImg from '../../media/leave.png';
import searchImg from '../../media/search.png';
import usersImg from '../../media/users.png';
import data from '../../users.json';

const ChatboxHeader = ({channel, send_msg, showMemberList, setShowMemberList, users, name}) => {

  const leaveChannel = () => {
    send_msg({type: "leave-channel"});
  }

  const toggleMemberList = () => {
    setShowMemberList(!showMemberList);
  }

  return (
    <div className="ChatboxHeader">
      {channel 
      ? <button 
          onClick={leaveChannel}
          className='btn btn-outline-dark'
        >
          <img src={leaveImg} alt="" />
        </button> 
      : null}

      <div className='d-flex align-items-center m-auto'>
        <input type="text" className="form-control" list="datalistOptions" placeholder='Search for users'/>
        <button className="btn btn-outline-dark"><img src={searchImg} alt="" /></button>
        <datalist id="datalistOptions">
          {users.map((user, i) => 
            (user !== name ? <option key={i} value={user}></option> : null)
          )}
        </datalist>
      </div>

      {channel 
      ? <button onClick={toggleMemberList} className='btn btn-outline-dark'>
          <img src={usersImg} alt="" />
        </button> 
      : null}
    </div>
  );
};


export default ChatboxHeader;

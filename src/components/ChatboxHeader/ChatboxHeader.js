import React from 'react';
import './ChatboxHeader.css';
import leaveImg from '../../media/leave.png'
import searchImg from '../../media/search.png'
import usersImg from '../../media/users.png'

const ChatboxHeader = ({channel, send_msg, showMemberList, setShowMemberList}) => {

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
        <input type="text" className="form-control" placeholder='Search for users'/>
        <button className="btn btn-outline-dark"><img src={searchImg} alt="" /></button>
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

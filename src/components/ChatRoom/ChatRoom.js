import React from 'react';
import './ChatRoom.css';
import MessageItem from '../MessageItem/MessageItem';
import { v4 } from 'uuid';


const ChatRoom = ({messages, name}) => {

  return(
    <div className="ChatRoom">
      {messages.slice(0).reverse().map((msg, _) => 
        <MessageItem
          key={v4()}
          author={msg.author}
          msgContent={msg.content}
          owner={msg.author === name ? 'from-me' : 'from-them'}
        />
      )}
    </div>
  );
};


export default ChatRoom;

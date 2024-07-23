import React from 'react';
import './MessageItem.css';

const MessageItem = ({author, msgContent, owner}) => (
  <div className={"MessageItem " + owner}>
    {owner == "from-them" ? <button className='msg-title'>{author}</button>: null}
    <pre className='msg-content'>{msgContent}</pre>
  </div>
);

export default MessageItem;

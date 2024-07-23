import React, { useEffect } from 'react';
import './ChatInputBox.css';

const ChatInputBox = ({displayMessage, send_msg, name, channel}) => {

  useEffect(() => {
    let input = document.querySelector(".input-box");

    function handleEnter(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        document.querySelector(".send-btn").click();
        autoResize(event);
      }
    }

    input.addEventListener('keypress', handleEnter);

    return () => {
      input.removeEventListener('keypress', handleEnter);
    };
  }, [])
  
  const autoResize = (event) => {
    event.target.style.height = "45px";
    event.target.style.height = Math.min(event.target.scrollHeight, 200) + "px";
    
    // keep send button at the bottom
    event.target.nextSibling.style.marginTop = Math.min(event.target.scrollHeight, 200) - 43 + "px";
  }
  
  const send = () => {
    let input = document.querySelector(".input-box");
    let msg = input.value.trim();
    if (!msg) {
      input.value = "";
      return;
    }
    displayMessage({author: name, content: msg});
    send_msg({type: "msg", author: name, content: msg});
    input.value = "";
  }

  return (
  <div className="ChatInputBox">
    <textarea onInput={autoResize} className='input-box' id="h" type="text" placeholder={'Type in ' + channel}/>
    <button onClick={send} className='send-btn'></button>
  </div>
)};

export default ChatInputBox;

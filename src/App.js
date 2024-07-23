import './App.css';
import {useState, useEffect} from 'react';
import ChatRoom from './components/ChatRoom/ChatRoom';
import ChatInputBox from './components/ChatInputBox/ChatInputBox';
import Header from './components/Header/Header';
import StartScreen from './components/StartScreen/StartScreen';
import ChatboxHeader from './components/ChatboxHeader/ChatboxHeader';
import MemberList from './components/MemberList/MemberList';



function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [channel, setChannel] = useState(null);
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);
  const [showMemberList, setShowMemberList] = useState(false);
  const [members, setMembers] = useState([]);
  
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    
    socket.addEventListener('open', (event) => {
      console.log(event);
    });

    socket.addEventListener('message', (event) => {
      let data;
      try {
        data = JSON.parse(event.data)
      } catch (error) {
        console.error('Invalid JSON: ', error)
        return;
      }
        
        command[data.type](data);
      });
      
      setSocket(socket);
      
      return function cleanup() {
        socket.close();
      };
    }, []);
    
    
    // List of actions for each type of message 
    // received from the server
    const command = {
      "login": (data) => {
        if (data.success) {
          setIsLogged(true);
          setName(data.name);
        } else {
          let input = document.querySelector("#username-input");
          input.style.border = "1px solid red";
          input.value = "";
          input.className += " is-invalid";
          console.log('Login failed');
        }
      },
      "channel-enter": (data) => {
        if (!data.success) {
          console.log(data.reason);
        }
        setChannel(data.channelName);
      },
      "channel-leave": (data) => {
        setChannel(null);
        setShowMemberList(false);
        setMembers([]);
        setMessages([]);
        console.log(data.reason ? data.reason : "You left the channel.")
      },
      "get-members": (data) => {
        setMembers(data.members);
      },
      "msg": (data) => {
        displayMessage({author: data.author, content: data.content});
      }
    }
    
    const displayMessage = (msg) => {
      setMessages(oldMessages => [...oldMessages, msg]);
    };

    const send_msg = (obj) => {
      socket.send(JSON.stringify(obj));
    }
    
    return(
      <div className='container'>
      <Header
        isLogged={isLogged}
        setIsLogged={setIsLogged}
        name={name}
        setName={setName}
        setChannel={setChannel}
        setMessages={setMessages}
        setShowMemberList={setShowMemberList}
        setMembers={setMembers}
        send_msg={send_msg}
        />
      <div className='chat-box'>
        {isLogged 
        ? <ChatboxHeader 
            channel={channel} 
            send_msg={send_msg}
            showMemberList={showMemberList}
            setShowMemberList={setShowMemberList}
            members={members}
            name={name}
          /> 
        : null}
        {channel && isLogged
         ?<>
            <div className='hybrid'>
              <ChatRoom
                messages={messages}
                name = {name}
              />       
              {showMemberList 
              ? <MemberList 
                  members={members}
                  name={name}
                  channel={channel}
                  send_msg={send_msg}
                /> 
              : null}
            </div>
            <ChatInputBox
              displayMessage={displayMessage}
              send_msg={send_msg}
              name={name}
              channel={channel}
            />
          </>
         :<StartScreen
            isLogged={isLogged}
            send_msg={send_msg}
          />
        }
      </div>
    </div>
  );
};

export default App;

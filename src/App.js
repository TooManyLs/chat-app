import './App.css';
import {useState, useEffect} from 'react';
import ChatRoom from './components/ChatRoom/ChatRoom';
import ChatInputBox from './components/ChatInputBox/ChatInputBox';
import Header from './components/Header/Header';
import StartScreen from './components/StartScreen/StartScreen';
import ChatboxHeader from './components/ChatboxHeader/ChatboxHeader';
import MemberList from './components/MemberList/MemberList';
import CreateModal from './components/CreateModal/CreateModal';
import dataset from './users.json';


function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [channel, setChannel] = useState(null);
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);
  const [showMemberList, setShowMemberList] = useState(false);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  
  const [socket, setSocket] = useState(null);
  

  // Connecting to websocket server.
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
        
      // Calls function depending on type property of data object
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
        setShowModal(false);
      },
      "channel-leave": (data) => {
        setChannel(null);
        setShowMemberList(false);
        setMembers([]);
        setMessages([]);
        console.log(data.reason ? data.reason : "You left the channel.")
      },
      "creation-failed": (_) => {
        console.log("Channel creation failed.");
      },
      "get-members": (data) => {
        setMembers(data.members);
      },
      "get-users": (data) => {
        let testUsers = [...data.users];
        for (let usr of dataset) {
          testUsers.push(usr.name);
        }
        setUsers(testUsers);
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
      <>
        {showModal && isLogged 
        ? <CreateModal 
            setShowModal={setShowModal} 
            send_msg={send_msg}
          /> 
        : null}
        <div className='container'>
          <Header
            isLogged={isLogged}
            setIsLogged={setIsLogged}
            name={name}
            setName={setName}
            send_msg={send_msg}
          />
          <div className='chat-box'>
            {isLogged 
            ? <ChatboxHeader 
                channel={channel} 
                send_msg={send_msg}
                showMemberList={showMemberList}
                setShowMemberList={setShowMemberList}
                users={users}
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
                setShowModal={setShowModal}
              />
            }
          </div>
        </div>
      </>
  );
};

export default App;

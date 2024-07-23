import React from 'react';
import './Header.css';

const Header = ({
  isLogged, setIsLogged, name, setName, setChannel, 
  setMessages, setShowMemberList, setMembers, send_msg}) => {

  const logIn = () => {
    let input = document.querySelector("#username-input");
    let username = input.value.trim();
    if (username == "") {
      return;
    }
    send_msg({type: "auth", name: username});
  }

  const logOut = () => {
    send_msg({type: "logout"});
    setIsLogged(false);
    setName("");
    setChannel(null);
    setMessages([]);
    setShowMemberList(false);
    setMembers([]);
  }

  return (
    <div className="Header">
      <header className='header'>
          <div>
            <h1 className='title mt-3 me-3'>:Chat</h1>
            {isLogged
            ? <button className='btn btn-dark new-chat'> New chat</button>
            : null}
          </div>
          {isLogged ? 
            <div>
              <p className='me-4 username'>{name}</p>
              <button
                onClick={logOut}
                className='btn btn-outline-dark px-4'>Log out
              </button>
            </div>
            :
            <div>
              <div className='me-3'>
                <input 
                  className="form-control"
                  placeholder="Username"
                  id="username-input"
                />
                <label className='invalid-feedback small inv-field' htmlFor="username-input">
                  This username is already in use.
                </label>
              </div>
              <button onClick={logIn} className='btn btn-dark px-4'>Log in</button>
            </div>
          }
        </header>
    </div>
  );
};

export default Header;

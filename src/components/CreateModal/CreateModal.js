import React from 'react';
import './CreateModal.css';
import { v4 } from 'uuid';

const CreateModal = ({setShowModal, send_msg}) => {

  const createChannel = () => {
    let input = document.querySelector("#creation-input");
    let inv = input.classList[2];
    if (!inv) {
      input.className += " is-invalid";
    }
    let name = input.value ? input.value : v4();
    send_msg({type: "create-channel", channelName: name});
  }
  
  return (
    <div className="CreateModal">
      <div className='modal-window'>
        <p className='fs-5 mb-3'>
          Choose a nice name for your channel or leave 
          input field empty to get random one:
        </p>
        <input 
          type="text" 
          className="form-control mb-3" 
          id="creation-input" 
        />
        <label className='invalid-feedback small inv-field' htmlFor="creation-input">
          Channel with that name already exists.
        </label>
        <div className='button-group'>
          <button onClick={() => setShowModal(false)} className="btn btn-outline-dark">Cancel</button>
          <button onClick={createChannel} className="btn btn-dark">Create channel</button>
        </div>
      </div>
    </div>
  );
};


export default CreateModal;

import React, { useEffect } from 'react';
import './MemberList.css';
import { v4 } from 'uuid';
import userImg from '../../media/user.png'
import adminImg from '../../media/crown.png'

const MemberList = ({members, name, channel, send_msg}) => {
  let ami_admin = false;
  members.sort((a, b) => a.name.localeCompare(b.name))

  // put admin at the top of the list 
  // and check whether current user is admin
  members.forEach((m, i) => {
    if (m.is_admin) {
      members.splice(i, 1);
      members.unshift(m);
      ami_admin = m.name == name;
    }
  });

  const kick = (event) => {
    let user = event.target.parentElement.textContent;
    send_msg({type: "kick", channelName: channel, username: user});
  }

  return (
    <div className="MemberList">
      {members.map((member, _) => 
        <p key={v4()} className={'member' + (member.name == name ? ' highlight' : '')}>
          <img src={member.is_admin ? adminImg : userImg} alt="" />
          {member.name}
          {ami_admin 
          ?
          (member.name != name
          ? <button onClick={kick} className="kick">
            </button>
          : null)
          : null
          }
        </p>
      )}
    </div>
  );
};


export default MemberList;

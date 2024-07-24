const http = require('http');
const WebSocketServer = require('ws').Server;

class Channel {
    constructor(name, admin, members = {}) {
        this.name = name;
        this.admin = admin;
        this.members = members;
        
        // this.members structure:
        // {
        //     "username": {
        //         sock: WebSocket Object,
        //         is_admin: Boolean
        //     }
        // }
    }

    kick(username) {
        // Deletes user from members and returns its socket
        // to kick them from chatroom interface on the client-side

        let sock = this.members[username].sock;
        delete this.members[username];
        return sock;
    }

    get_members() {
        let memberList = [];
        for (let key in this.members) {
            let member = {
                name: key,
                is_admin: this.members[key].is_admin
            };
            memberList.push(member);
        }
        return memberList;
    }

    get_sockets() {
        let socketList = [];
        for (let key in this.members) {
            socketList.push(this.members[key].sock);
        }
        return socketList;
    }
}



// Setting up WebSocket server
const server = http.createServer((req, res) => {});

server.listen(8080, () => {
    console.log('listening on port 8080.');
});

const wss = new WebSocketServer({server});


// Handling incoming connections
wss.on('connection', (ws, req) => {
    const addr = req.socket.remoteAddress;
    console.log(`${addr} connected.`);
    
    ws.on('message', (msg) => {
        let data;
        try {
            data = JSON.parse(msg)
        } catch (error) {
            console.error('Invalid JSON: ', error)
            return;
        }
        
        // Depending on the type property of message's data object sent by client
        // calls corresponding function in command object 
        command[data.type](ws, addr, data);
    });
    
    ws.on('close', () => {
        console.log(`Connection from ${addr} closed`);
        if (! clients.get(ws)) {
            return
        }
        command["leave-channel"](ws, null, null);
        clients.delete(ws);
    });
});

//Map object containing clients' websockets as keys
// and objects with name and channel properties as values
let clients = new Map();
// Ojbect containing channel names as keys and Channel objects as values
let channels = {};

// List of actions for each type of message 
// sent by the client
const command = {
    "connect": (ws, _, data) => {
        let chan = channels[data.channelName];
        if (!chan) {
            send_msg(ws, {
                type: "channel-enter", 
                success: false, 
                reason: `Channel with the name "${data.channelName}" doesn't exist.`
            }
        );
        return;
    }
    send_msg(ws, {type: "channel-enter", success: true, channelName: data.channelName});
    let username = clients.get(ws).name;
    chan.members[username] = {sock: ws, is_admin: chan.admin == username};

        sendMemberList(chan);

        clients.get(ws).channel = chan.name;
    },
    "logout": (ws, _, _1) => {
        let user = clients.get(ws);
        if (user.channel) {
            command["leave-channel"](ws, null, null);
        }
        clients.delete(ws);
    },
    "auth": (ws, addr, data) => {
        if (mapContainsValue(clients, "name", data.name)) {
            send_msg(ws, {type: "login", success: false});
            return;
        }
        clients.set(ws, {"name": data.name, "channel": null});
        send_msg(ws, {type: "login", success: true, name: data.name});
        console.log(`${addr} authenticated as ${data.name}`);
    },
    "leave-channel": (ws, _, _1) => {
        let user = clients.get(ws);
        let chan = channels[user.channel];
        if (!chan) {
            return;
        }

        // If user leaving is not an admin of a channel just kick
        if (user.name !== chan.admin) {
            send_msg(ws, {type: "channel-leave"})
            chan.kick(user.name);
            user.channel = null;
            
            // Upadate clients' member lists
            sendMemberList(chan);
            return;
        }

        // Else kick everyone and delete the channel
        let members = Object.keys(chan.members);
        let channelName = user.channel;
        members.forEach((member, _) => {
            command["kick"](ws, null, 
                {type: "kick", 
                    channelName: chan.name, 
                    username: member
                }
            )
        });

        delete channels[channelName];
    },
    "create-channel": (ws, _, data) => {
        let name = data.channelName;
        let admin = clients.get(ws).name;
        if (channels[name]) {
            send_msg(ws, {type: "creation-failed"});
            return;
        }
        channels[name] = new Channel(name, admin);

        // Connects creator to a channel right away
        command["connect"](ws, _, {type: "connect", channelName: name});
    },
    "kick": (ws, _, data) => {
        let chan = channels[data.channelName]

        // if (chan.admin !== clients.get(ws).name) {
        //     return;
        // }
        let kicked_user = chan.kick(data.username);
        send_msg(kicked_user, {type: "channel-leave", 
            reason: `You've been kicked from "${data.channelName}" channel.`})
        clients.get(kicked_user).channel = null;

        sendMemberList(chan);
    },
    "msg": (ws, _, data) => {
        // Get sockets of members from the channel the sender is in
        let sockets = channels[clients.get(ws).channel].get_sockets();

        // Resend the message to members excluding the sender
        for (let sock of sockets) {
            if (sock !== ws) {
                send_msg(sock, data);
            }
        }
    }
}

const send_msg = (recipient, obj) => {
    recipient.send(JSON.stringify(obj));
};

const mapContainsValue = (map, subkey, value) => {
    // Checks if a specific value exists for a given subkey
    // in any of the values (objects) in the Map.

    for (let val of map.values()) {
        if (val[subkey] === value) {
            return true;
        }
    }
    return false;
};

const sendMemberList = (channel) => {
    let sockets = channel.get_sockets();
    let memberList = channel.get_members();
    for (let sock of sockets) {
        send_msg(sock, {type: "get-members", members: memberList});
    }
}
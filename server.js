const { error } = require('console');
const { channel } = require('diagnostics_channel');
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

let mchan = new Channel("hello", "me");
let nchan = new Channel("byebye", "tmls");

let clients = new Map();
let channels = {
    "hello": mchan,
    "byebye": nchan,
};

const server = http.createServer((req, res) => {
    
});

server.listen(8080, () => {
    console.log('listening on port 8080.');
});

const wss = new WebSocketServer({server});


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
        console.log(chan.members);
    },
    "logout": (ws, _, _1) => {
        let user = clients.get(ws);
        if (user.channel) {
            channels[user.channel].kick(user.name);
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
        send_msg(ws, {type: "channel-leave"})
        let user = clients.get(ws);
        let chan = channels[user.channel];
        chan.kick(user.name);

        sendMemberList(chan);
        
        user.channel = null;
    },
    "kick": (ws, _, data) => {
        let chan = channels[data.channelName]
        if (chan.admin !== clients.get(ws).name) {
            return;
        }
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

wss.on('connection', (ws, req) => {
    console.log('Client connected.');
    const addr = req.socket.remoteAddress;

    ws.on('message', (msg) => {
        console.log(msg)
        let data;
        try {
            data = JSON.parse(msg)
        } catch (error) {
            console.error('Invalid JSON: ', error)
            return;
        }

        command[data.type](ws, addr, data);
    });

    ws.on('close', () => {
        console.log(`Connection from ${addr} closed`);
        if (clients.get(ws)) {
            if (clients.get(ws).channel) {
                command["leave-channel"](ws, null, null);
            }
        }
        clients.delete(ws);
        console.log(mchan.members)
      });
});
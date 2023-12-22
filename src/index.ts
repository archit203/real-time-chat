
import {server as WebSocketServer, connection} from 'websocket';
import http from 'http';
import { UserManager } from './UserManager';
import { IncomingMessage, SUPPORTED_MESSAGE_TYPES} from './messages/incomingMessages';
import { Store } from './store/Store';
import { InMemoryStore } from './store/InMemoryStore';
import { OutgoingMessage, SUPPORTED_MESSAGE_TYPES as OutgoingSupportedMessages } from './messages/outgoingMessages';

const Server = http.createServer(function(request: any, response: any) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

const userManager = new UserManager();
const store = new InMemoryStore();
Server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: Server,
   
    autoAcceptConnections: false
});

function originIsAllowed(origin: string) {
  
  return true;
}

wsServer.on('request', function(request) {
    console.log("inside connect")
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        // todo add rate limitting logic here 
        if (message.type === 'utf8') {

            try{
                
                messageHandler(connection, JSON.parse(message.utf8Data));
            } catch(e){

            }

        }
    });

});

// type matching i.e join room message should have a payload of type InitMessageType

function messageHandler(ws: connection, message: IncomingMessage){
    console.log("incoming message" + JSON.stringify(message));
    if (message.type === SUPPORTED_MESSAGE_TYPES.JOIN_ROOM){
        const payload = message.payload;
        userManager.addUSer(payload.name, payload.userId, payload.roomId, ws);
    }
    if (message.type === SUPPORTED_MESSAGE_TYPES.SEND_MESSAGE){
        const payload = message.payload;
        const user = userManager.getUser(payload.roomId, payload.userId);
        if(!user){
            console.log('user not found');
            return;
        }
        let chat = store.addChat(payload.userId, user.name, payload.roomId, payload.message);
        if(!chat){
            return;
        }
        // Todo add logic to broadcast message to all users in the room

        const outgoingPayload : OutgoingMessage= {
            type: OutgoingSupportedMessages.ADD_CHAT,
            payload: {
                chatId: chat.id,
                roomId: payload.roomId,
                message: payload.message,
                name: user.name,
                upvotes: 0,
            }
        }
        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }
    if(message.type === SUPPORTED_MESSAGE_TYPES.UPVOTE_MESSAGE){
        const payload = message.payload;
        const chat = store.upVote(payload.userId, payload.roomId, payload.chatId);
        console.log("inside upvote");
        if(!chat){
            return;
        }
        console.log("inside upvote 2");
        const outgoingPayload : OutgoingMessage= {
            type: OutgoingSupportedMessages.UPDATE_CHAT,
            payload: {
                chatId: payload.chatId,
                roomId: payload.roomId,
                upvotes: chat.upvotes.length,
            }
        }
        console.log("inside upvote 3");
        userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
    }
}
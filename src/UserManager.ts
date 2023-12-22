import { connection } from "websocket";
import { OutgoingMessage } from "./messages/outgoingMessages";

interface User {
    id: string;
    name: string;
    conn: connection;
}

interface Room {
    users : User[];
}
export class UserManager {
    private rooms:Map<string, Room>;
    constructor () {
        this.rooms = new Map<string, Room>();
    }

    addUSer(name: string,userId: string, roomId: string, socket: connection){
        if(!this.rooms.has(roomId)){
            this.rooms.set(roomId, {
                users: []
            });
        }
        this.rooms.get(roomId)?.users.push({
            id: userId,
            name: name,
            conn: socket,
        });
        socket.on('close', (reasonCode, description) => {
            this.removeUser(userId, roomId);
        });
    }

    removeUser(userId: string, roomId: string){
        console.log("removed user");
        const users = this.rooms.get(roomId)?.users;
        if(users){
            users.filter(({id}) => id !== userId)
        }

    }

    getUser(roomId: string, userId : string): User | null{
        const user = this.rooms.get(roomId)?.users.find(({id}) => id === userId);
        return user ?? null;
    }

    broadcast(roomId: string, userId: string ,message: OutgoingMessage){
        const user = this.getUser(roomId, userId);
        if(!user){
            console.error('user not found');
            return;
        }
        const room =  this.rooms.get(roomId)
        if(!room){
            console.error('room not found');
            return;
        }

        room.users.forEach(({conn, id}) => {
            if(id === userId){
                return;
            }
            console.log("outgoing message" + JSON.stringify(message));
            conn.sendUTF(JSON.stringify(message));
        })
    }
}
import { Socket } from "socket.io";

export default class SocketPlayer {

    private player_id:       string; // socket id
    private player_username: string;
    private player_room:     string;
    private player_socket:   Socket;

    constructor(player_id: string, player_username: string, player_socket: Socket) {
        this.player_id       = player_id;
        this.player_username = player_username;
        this.player_room     = "";
        this.player_socket   = player_socket;
    }
    
    public id_get(): string {
        return this.player_id;
    }

    public username_get(): string {
        return this.player_username;
    }

    public room_set(room_id: string): void {
        this.player_room = room_id;
        this.player_socket.join(room_id);
    }

    public room_get(): string {
        return this.player_room;
    }

}
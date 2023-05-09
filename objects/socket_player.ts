import { Socket } from "socket.io";
import { room_manager } from "../tankon_server";
import SocketRoom from "./socket_room";

export default class SocketPlayer {

    private player_id:       string; // socket id
    private player_username: string;
    private player_room:     SocketRoom | undefined;
    private player_socket:   Socket;

    constructor(player_id: string, player_username: string, player_socket: Socket) {
        this.player_id       = player_id;
        this.player_username = player_username;
        this.player_room     = undefined;
        this.player_socket   = player_socket;
    }
    
    public id_get(): string {
        return this.player_id;
    }

    public username_get(): string {
        return this.player_username;
    }

    public room_set(room_id: string): void {
        this.player_room = room_manager.room_get(room_id);
        this.player_room?.players_add(this);
    }

    public room_remove(): void {
        this.player_room?.players_remove(this.player_id);
    }

    public room_get(): SocketRoom | undefined {
        return this.player_room;
    }

    public socket_get(): Socket {
        return this.player_socket;
    }

    public profile_get(): SocketPlayerProfile {
        return {
            player_id:       this.player_id,
            player_username: this.player_username
        }
    }

}

export interface SocketPlayerProfile {
    player_id:       string,
    player_username: string
}
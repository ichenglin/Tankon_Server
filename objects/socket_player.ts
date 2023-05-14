import { Socket } from "socket.io";
import { room_manager } from "../tankon_server";
import SocketRoom from "./socket_room";
import Vector2D from "./vector_2d";

export default class SocketPlayer {

    private player_id:       string; // socket id
    private player_username: string;
    private player_movement: PlayerMovement;
    private player_room:     SocketRoom | undefined;
    private player_socket:   Socket;

    constructor(player_id: string, player_username: string, player_socket: Socket) {
        this.player_id       = player_id;
        this.player_username = player_username;
        this.player_movement = {
            movement_origin:    new Vector2D(0, 0, 0, 0),
            movement_proceed:   false,
            movement_lifespan:  null,
            movement_timestamp: Date.now()
        };
        this.player_room     = undefined;
        this.player_socket   = player_socket;
    }
    
    public id_get(): string {
        return this.player_id;
    }

    public username_get(): string {
        return this.player_username;
    }

    public movement_set(movement_new: PlayerMovement): void {
        this.player_movement = movement_new;
    }

    public movement_get(): PlayerMovement {
        return this.player_movement;
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

    public profile_get(): PlayerProfile {
        return {
            player_id:       this.player_id,
            player_username: this.player_username
        }
    }

}

export interface PlayerProfile {
    player_id:       string,
    player_username: string
}

export interface PlayerMovement {
    movement_origin:    Vector2D,
    movement_proceed:   boolean,
    movement_lifespan:  number | null,
    movement_timestamp: number
}
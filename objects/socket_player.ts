import { Socket } from "socket.io";
import { room_manager, socket_server } from "../tankon_server";
import SocketRoom from "./socket_room";
import Vector2D from "./vector_2d";

export default class SocketPlayer {

    private player_id:       string; // socket id
    private player_username: string;
    private player_team:     PlayerTeam;
    private player_shield:   PlayerShield;
    private player_movement: PlayerMovement;
    private player_latency:  PlayerLatency;
    private player_room:     SocketRoom | undefined;
    private player_socket:   Socket;

    constructor(player_id: string, player_username: string, player_socket: Socket) {
        this.player_id       = player_id;
        this.player_username = player_username;
        this.player_team     = PlayerTeam.TEAM_LOBBY;
        this.player_shield   = {
            shield_timestamp: Date.now(),
            shield_lifespan:  0
        };
        this.player_movement = {
            movement_origin:    new Vector2D(0, 0, 0, 0),
            movement_proceed:   false,
            movement_lifespan:  null,
            movement_timestamp: Date.now()
        };
        this.player_latency = {
            client_send:    0,
            client_receive: 0
        };
        this.player_room     = undefined;
        this.player_socket   = player_socket;
    }
    
    public player_teleport(player_coordinates: Vector2D): void {
        this.player_socket.emit("player_teleport", player_coordinates);
        this.player_socket.broadcast.to(this.player_room?.id_get() as string).emit("player_move", this.player_id, {
            movement_origin:    player_coordinates,
            movement_proceed:   false,
            movement_lifespan:  null,
            movement_timestamp: Date.now()
        } as PlayerMovement);
    }

    public player_respawn(): void {
        const team_spawnpoints = [
            {team_id: PlayerTeam.TEAM_RED,   team_spawnpoints: [new Vector2D(-2400, 0, 0, 0), new Vector2D(-2400, 250, 0, 0), new Vector2D(-2400, -250, 0, 0)]},
            {team_id: PlayerTeam.TEAM_BLUE,  team_spawnpoints: [new Vector2D( 2400, 0, 0, 0), new Vector2D( 2400, 250, 0, 0), new Vector2D( 2400, -250, 0, 0)]},
            {team_id: PlayerTeam.TEAM_LOBBY, team_spawnpoints: [new Vector2D(0, 0, 0, 0)]}
        ];
        const player_spawnpoints = team_spawnpoints.find(loop_spawnpoints => loop_spawnpoints.team_id === this.player_team)?.team_spawnpoints as Vector2D[];
        this.player_teleport(player_spawnpoints[Math.floor(Math.random() * player_spawnpoints.length)]);
    }

    public player_invincible(shield_lifespan: number): void {
        this.player_shield = {
            shield_timestamp: Date.now(),
            shield_lifespan:  shield_lifespan
        };
        socket_server.to(this.player_room?.id_get() as string).emit("player_shield", this.player_id, this.player_shield);
    }

    public async player_ping(ping_timeout: number): Promise<PlayerLatency> {
        const timestamp_send    = Date.now();
        const timestamp_receive = await new Promise<number | null>((resolve) => {
            this.player_socket.once("client_pong", (pong_timestamp) => resolve(pong_timestamp));
            this.player_socket.emit("server_ping");
            // timeout
            setTimeout(() => {
                this.player_socket.removeAllListeners("client_pong");
                resolve(null);
            }, ping_timeout);
        });
        if (timestamp_receive === null) return {
            client_send:    0,
            client_receive: 0
        };
        const timestamp_return  = Date.now();
        const player_latency: PlayerLatency = {
            client_send:    (timestamp_return  - timestamp_receive),
            client_receive: (timestamp_receive - timestamp_send)
        };
        this.player_latency = player_latency;
        return player_latency;
    }

    public id_get(): string {
        return this.player_id;
    }

    public username_get(): string {
        return this.player_username;
    }

    public team_set(player_team: PlayerTeam): void {
        this.player_team = player_team;
    }

    public team_get(): PlayerTeam {
        return this.player_team;
    }

    public shield_get(): PlayerShield {
        return this.player_shield
    }

    public movement_set(movement_new: PlayerMovement): void {
        this.player_movement = movement_new;
    }

    public movement_get(): PlayerMovement {
        return this.player_movement;
    }

    public latency_get(): PlayerLatency {
        return this.player_latency;
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

    public data_get(): PlayerData {
        return {
            player_id:       this.player_id,
            player_username: this.player_username,
            player_team:     this.player_team,
            player_kills:    0,
            player_deaths:   0,
            player_latency:  this.player_latency
        };
    }

}

export interface PlayerData {
    player_id:       string,
    player_username: string,
    player_team:     PlayerTeam,
    player_kills:    number,
    player_deaths:   number,
    player_latency:  PlayerLatency
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

export interface PlayerLatency {
    client_send:    number, // client to server
    client_receive: number  // server to client
}

export enum PlayerTeam {
    TEAM_RED,
    TEAM_BLUE,
    TEAM_LOBBY
}

export interface PlayerShield {
    shield_timestamp: number,
    shield_lifespan:  number
}
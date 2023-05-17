import { PlayerTeam } from "../objects/socket_player";
import SocketRoom from "../objects/socket_room";
import Logger from "./logger";

export default class RoomManager {

    private socket_rooms:  Map<string, SocketRoom>;
    private room_capacity: number;

    constructor(room_capacity: number) {
        this.socket_rooms  = new Map<string, SocketRoom>();
        this.room_capacity = room_capacity;
        setInterval(() => this.room_all().forEach(loop_room => {
            const room_scoreboard = loop_room.scoreboard_get();
            const round_age       = Date.now() - room_scoreboard.round_birthday;
            const round_lifetime  = room_scoreboard.round_lifespan - round_age;
            if (round_lifetime <= 0) loop_room.round_restart();
        }), 1000);
    }

    public room_queue(room_digits: number = 8): SocketRoom {
        const room_available = Array.from(this.socket_rooms.values()).filter(loop_room => loop_room.players_get().length < this.room_capacity);
        // if there's a room available to join
        if (room_available.length > 0) return room_available[0];
        // generate a unique room id
        let room_id: string | null = null;
        while (room_id === null || this.room_get(room_id) !== undefined) {
            const room_number = Math.floor(Math.random() * (Math.pow(10, room_digits)-Math.pow(10, room_digits-1)) + Math.pow(10, room_digits-1));
            room_id           = `PUBLIC_${room_number}`;
        }
        // create the room
        return this.room_new(room_id);
    }

    public room_new(room_id: string): SocketRoom {
        const room_new = new SocketRoom(room_id);
        this.socket_rooms.set(room_id, room_new);
        Logger.log_send(`Room created: ${room_id}`);
        return room_new;
    }

    public room_get(room_id: string): SocketRoom | undefined {
        return this.socket_rooms.get(room_id);
    }

    public room_delete(room_id: string): void {
        this.socket_rooms.delete(room_id);
    }

    public room_all(): SocketRoom[] {
        return Array.from(this.socket_rooms.values());
    }

}
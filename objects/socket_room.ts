import { socket_server } from "../tankon_server";
import SocketPlayer from "./socket_player";

export default class SocketRoom {

    private room_id:      string;
    private room_players: SocketPlayer[];

    constructor(room_id: string) {
        this.room_id      = room_id;
        this.room_players = [];
    }

    public id_get() {
        return this.room_id;
    }

    public players_add(player_object: SocketPlayer): void {
        this.room_players.push(player_object);
        socket_server.to(this.room_id).emit("player_join", player_object.profile_get());
        player_object.socket_get().join(this.room_id);
        this.room_players.filter((room_player) => room_player.id_get() !== player_object?.id_get()).forEach((room_player) => {
            player_object.socket_get().emit("player_join", room_player.profile_get());
            player_object.socket_get().emit("player_move", room_player.id_get(), room_player.movement_get());
        });
    }

    public players_remove(player_id: string): void {
        this.room_players = this.room_players.filter((room_player) => room_player.id_get() !== player_id);
        socket_server.to(this.room_id).emit("player_quit", player_id);
    }

    public players_get(): SocketPlayer[] {
        /*const player_sockets = await socket_server.in(this.room_id).fetchSockets();
        return player_sockets.map(loop_socket => player_manager.player_get(loop_socket.id) as SocketPlayer);*/
        return this.room_players;
    }

}
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

    public players_get(): SocketPlayer[] {
        /*const player_sockets = await socket_server.in(this.room_id).fetchSockets();
        return player_sockets.map(loop_socket => player_manager.player_get(loop_socket.id) as SocketPlayer);*/
        return this.room_players;
    }

}
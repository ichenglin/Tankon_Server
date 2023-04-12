import { Socket } from "socket.io";
import SocketPlayer from "../objects/socket_player";

export default class PlayerManager {

    private socket_players:  Map<string, SocketPlayer>;

    constructor() {
        this.socket_players = new Map<string, SocketPlayer>();
    }

    public player_add(player_id: string, player_username: string, player_socket: Socket): SocketPlayer {
        const player_new = new SocketPlayer(player_id, player_username, player_socket);
        this.socket_players.set(player_id, player_new);
        return player_new;
    }

    public player_get(player_id: string): SocketPlayer | undefined {
        return this.socket_players.get(player_id);
    }

}
import { socket_server } from "../tankon_server";
import SocketPlayer, { PlayerLatency, PlayerTeam } from "./socket_player";

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

    public team_available(): PlayerTeam {
        const team_players_red  = this.players_get(PlayerTeam.TEAM_RED);
        const team_players_blue = this.players_get(PlayerTeam.TEAM_BLUE);
        return (team_players_blue < team_players_red) ? PlayerTeam.TEAM_BLUE : PlayerTeam.TEAM_RED;
    }

    public players_update(): void {
        const room_leaderboard = this.room_players.map(loop_player => loop_player.data_get());
        socket_server.to(this.room_id).emit("player_data", room_leaderboard);
    }

    public players_add(player_object: SocketPlayer): void {
        this.room_players.push(player_object);
        socket_server.to(this.room_id).emit("player_join", player_object.data_get());
        player_object.socket_get().join(this.room_id);
        this.room_players.filter((room_player) => room_player.id_get() !== player_object?.id_get()).forEach((room_player) => {
            player_object.socket_get().emit("player_join", room_player.data_get());
            player_object.socket_get().emit("player_move", room_player.id_get(), room_player.movement_get());
        });
    }

    public players_remove(player_id: string): void {
        this.room_players = this.room_players.filter((room_player) => room_player.id_get() !== player_id);
        socket_server.to(this.room_id).emit("player_quit", player_id);
    }

    public players_get(team_filter: PlayerTeam | null = null): SocketPlayer[] {
        // no team filter
        if (team_filter === null) return this.room_players;
        // yes team filter
        return this.room_players.filter(loop_player => loop_player.team_get() === team_filter);
    }

}
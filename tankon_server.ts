import { Server } from "socket.io";
import * as dotenv from "dotenv";
import Logger from "./managers/logger";
import PlayerManager from "./managers/player_manager";
import RoomManager from "./managers/room_manager";
import SocketPlayer, { PlayerMovement } from "./objects/socket_player";
import Vector2D from "./objects/vector_2d";

dotenv.config();

export const socket_server  = new Server(parseInt(process.env.SERVER_PORT as string), {
    path: process.env.SERVER_PATH,
    cors: {origin: process.env.CLIENT_ORIGIN,
    methods: ["GET", "POST"]}
});
export const room_manager   = new RoomManager(10);
export const player_manager = new PlayerManager();

socket_server.on("connection", (socket_player) => {
    let player_data: SocketPlayer | null = null;
    Logger.log_send(`Socket connection: ${socket_player.id}`);
    // events
    socket_player.on("disconnect", () => {
        Logger.log_send(`Socket disconnection: ${socket_player.id}`);
        player_data?.room_remove();
        socket_player.disconnect(true);
    });
    socket_player.on("room_join", (player_username: string, player_room: string | null, callback_status: Function) => {
        if (player_data !== null) return;
        // event parameter type check
        if (typeof callback_status !== "function")                       return;
        if (typeof player_username !== "string")                         callback_status({success: false});
        if (typeof player_room     !== "string" && player_room !== null) callback_status({success: false});
        // check room exist and assign room
        if (player_room !== null && room_manager.room_get(player_room) === undefined) callback_status({success: false});
        const player_room_validated = (player_room !== null) ? player_room : room_manager.room_queue().id_get();
        // join the room
        Logger.log_send(`Room join: ${socket_player.id} joined ${player_room_validated}`);
        player_data = player_manager.player_add(socket_player.id, player_username, socket_player);
        player_data.room_set(player_room_validated);
        callback_status({success: true, player_room: player_room_validated});
    });
    socket_player.on("player_move", (movement_data: PlayerMovement) => {
        if (player_data === null) return;
        // record movement
        const player_id = player_data.id_get();
        player_manager.player_get(player_id)?.movement_set(movement_data);
        // pass down the coordinates to the rest of the players
        socket_player.to(player_data.room_get()?.id_get() as string).emit("player_move", player_id, movement_data);
    });
    socket_player.on("player_projectile", (player_projectile: any) => {
        if (player_data === null) return;
        // pass down the coordinates to the rest of the players
        socket_player.to(player_data.room_get()?.id_get() as string).emit("player_projectile", player_projectile);
    });
    socket_player.on("player_kill", (victim_ids: string[]) => {
        if (player_data === null) return;
        const victim_players = victim_ids.map(loop_victim_id => player_manager.player_get(loop_victim_id));
        victim_players.forEach(loop_victim => loop_victim?.player_teleport(new Vector2D(0, 0, 0, 0)));
    });
});

setInterval(async () => {
    await Promise.all(player_manager.player_all().map(loop_player => loop_player.player_ping(5000)));
    room_manager.room_all().forEach(loop_room => loop_room.players_update());
}, 10000);
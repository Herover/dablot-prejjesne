import { Namespace } from "socket.io";
import { Game, GameClientToServerEvents, GameInterServerEvents, GameServerToClientEvents, GameSocketData, Player } from "../../../shared/io/io";
import { getGame, joinGame, leaveGame } from "./game";

export default (io: Namespace<GameClientToServerEvents, GameServerToClientEvents, GameInterServerEvents, GameSocketData>) => {
    io.on("connection", socket => {
      console.log(`ns connect ${socket.id}`);

      let gameId: string | null = null;
      let game: Game | null = null;
      const player: Player = {
        name: "",
        color: -1,
      }
    
      socket.on("disconnect", (reason) => {
        leaveGame(gameId, player);
        console.log(`ns disconnect ${socket.id} due to ${reason}`);
      });

      socket.on("join", ({ gameId: gid }) => {
        if (typeof gid != "string") {
          return;
        }
        
        try {
          joinGame(gid, player);
        } catch(e) {
          console.error(e);
          return;
        };

        socket.join(gid);
        gameId = gid;
        game = getGame(gid);

        console.log("player", player);
        socket.emit("player", player);
        io.to(gid).emit("game", game);
      });

      socket.on("move", ({ key, x, y, type, id, attackX, attackY }) => {
        console.log(`${key} to ${x},${y}`)

        socket.to(gameId).emit("move", { key, x, y, type, id, attackX, attackY })
      })
    });

    console.log("namespace ready")
};

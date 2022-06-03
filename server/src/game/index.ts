import { Namespace } from "socket.io";

export default (io: Namespace) => {
    io.on("connection", socket => {
      console.log(`ns connect ${socket.id}`);

      let gameId: string | null = null;
    
      socket.on("disconnect", (reason) => {
        console.log(`ns disconnect ${socket.id} due to ${reason}`);
      });

      socket.on("join", ({ gameId: gid }) => {
        if (typeof gid != "string") {
          return;
        }
        
        socket.join(gid);
        gameId = gid
      });

      socket.on("move", ({ id, x, y }) => {
        console.log(`${id} to ${x},${y}`)

        socket.to(gameId).emit("move", { id, x, y })
      })
    });

    console.log("namespace ready")
};

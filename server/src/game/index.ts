import { Namespace } from "socket.io";

export default (io: Namespace) => {
    io.on("connection", socket => {
      console.log(`ns connect ${socket.id}`);
    
      socket.on("disconnect", (reason) => {
        console.log(`ns disconnect ${socket.id} due to ${reason}`);
      });

      socket.on("join", ({ gameId }) => {
        if (typeof gameId != "string") {
          return;
        }
        
        socket.join(gameId);
      });
    });

    console.log("namespace ready")
};

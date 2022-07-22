import { createServer } from "http";
import { Server } from "socket.io";
import { ORIGIN, PORT } from "./config";
import game from "./game/index";

const httpServer = createServer();
const io = new Server(httpServer, {
  serveClient: false,
  cors: {
    origin: ORIGIN
  },
});

io.on("connection", socket => {
  console.log(`connect ${socket.id}`);

  socket.on("disconnect", (reason) => {
    console.log(`disconnect ${socket.id} due to ${reason}`);
  });
});

game(io.of("/game"));

console.log(`starting on port ${PORT}`);
io.listen(PORT);

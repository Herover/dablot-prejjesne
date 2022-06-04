interface GameServerToClientEvents {
    move: (data: { id: number, x: number, y: number }) => void;
  }
  
  interface GameClientToServerEvents {
    join: (data: { gameId: string }) => void;
    move: (data: { id: number, x: number, y: number }) => void;
  }
  
  interface GameInterServerEvents {
    ping: () => void;
  }
  
  interface GameSocketData {
    name: string;
  }
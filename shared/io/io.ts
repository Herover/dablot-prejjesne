export interface GameServerToClientEvents {
  move: (data: Move) => void;
  game: (data: Game) => void;
  player: (data: Player) => void;
}

export interface GameClientToServerEvents {
  join: (data: { gameId: string }) => void;
  move: (data: Move) => void;
}

export interface GameInterServerEvents {
  ping: () => void;
}

export interface GameSocketData {
  name: string;
}

export interface Player {
  color: number;
  name: string;
}

export interface Game {
  id: string;
  player0?: Player;
  player1?: Player;
  //spectators: Player[];
}

export enum MoveType {
  MOVE = 1,
  ATTACK = 2,
}

export interface Move {
  type: MoveType;
  id: number,
  x: number;
  y: number;
  key: string;
  attackX?: number;
  attackY?: number;
}

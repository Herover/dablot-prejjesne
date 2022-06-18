import { Game, Player } from "../../../shared/io/io";

const games: {[key in string]: Game} = {};

export function joinGame(gameId: string, player: Player) {
  if (games[gameId]) {
    const game = games[gameId];
    if (!game.player0) {
      game.player0 = player;
      player.color = 0;
    } else if (!game.player1) {
      game.player1 = player;
      player.color = 1;
    } else {
      //game.spectators.push(player);
      throw new Error("Game is full");
    }
  } else {
    const game: Game = {
      id: gameId,
      player0: player,

      //spectators: [],
    };
    player.color = 0;
    games[gameId] = game;
  }
}

export function leaveGame(gameId: string, player: Player) {
  if (games[gameId]) {
    const game = games[gameId];
    if (game.player0 == player) {
      game.player0 = undefined;
    } else if (game.player1 == player) {
      game.player1 = undefined;
    } else {
      // game.spectators = game.spectators.filter(e => e != player);
      console.warn(`Player is not in game ${gameId}, but tried to leave it`);
    }
  } else {
    console.warn(`Tried to disconnect player ${player} from non-existing game ${gameId}`);
  }
}

export function getGame(gameId: string) {
  return games[gameId];
}

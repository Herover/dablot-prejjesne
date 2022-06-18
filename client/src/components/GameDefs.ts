/**
 * PieceType maps to the official piece kinds, eg. for Sami player warrior=1, prince=2, king=3 and
 * for Finn farmer=1, landlords son=2, landlord=3.
 * The names are changed to be neutral and not confuse players "team".
 */
export enum PieceType {
  // Warrior/farmer
  LOW = 1,

  // Prince/landlord son
  MEDIUM = 2,

  // King/landlord
  HIGH = 3,
}

export interface Piece {
  // Unique piece identifier
  id: number;

  // Position on board, might be a half
  x: number;
  y: number;

  // Position on SVG board
  rawX: number;
  rawY: number;

  // Aka. team, real color may depend on client theme
  color: number;

  // Kind of piece
  type: PieceType;
}

/* export interface Player {
  color: number;
} */

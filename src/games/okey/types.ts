export type TileColor = 'red' | 'yellow' | 'blue' | 'black' | 'fake';

export interface Tile {
  id: string;
  color: TileColor;
  number: number; // 1 to 13, or 0 for fake okey
  isFakeOkey: boolean;
}

export type OkeyVariant = 'classic' | '101';
export type OkeyPlayerCount = 2 | 4;
export type OkeyMode = 'vs_ai' | 'online';

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  tiles: (Tile | null)[]; // 30 slots (0-14 upper row, 15-29 lower row)
  hasOpened: boolean;     // 101 mode: whether player has opened hand
  openScore: number;      // 101 mode: sum of opened melds
  penaltyScore: number;   // 101 mode: penalty points
}

export interface OpenedMeld {
  playerId: string;
  playerName: string;
  tiles: Tile[];
  type: 'run' | 'group' | 'pair';
}

export interface OkeyGameState {
  variant: OkeyVariant;
  playerCount: OkeyPlayerCount;
  mode: OkeyMode;
  roomCode?: string;
  deck: Tile[];
  indicator: Tile;
  okeyTile: { color: TileColor; number: number };
  players: Player[];
  currentTurn: number; // index 0 to playerCount - 1
  turnPhase: 'draw' | 'discard'; // player must draw, then discard
  discardPiles: Record<number, Tile[]>; // playerIndex -> array of discarded tiles
  openedSets: OpenedMeld[]; // for 101 Okey
  lastDrawnFrom: 'deck' | 'discard' | null;
  winner: {
    playerId: string;
    playerName: string;
    reason: string;
    isOkeyFinish: boolean;
  } | null;
}

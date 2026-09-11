export type PlayerColor = 'white' | 'black';

export interface BoardPoint {
  index: number; // 1 to 24
  color: PlayerColor | null;
  count: number;
}

export interface DiceState {
  dice: [number, number];
  remainingMoves: number[];
  isRolling: boolean;
  rollCallout: string;
  rolledBy: PlayerColor | null;
}

export interface TavlaMove {
  from: number | 'bar';
  to: number | 'off';
  diceUsed: number;
  isHit?: boolean;
}

export type WinType = 'normal' | 'mars' | 'katmerli_mars';

export type TurnPhase = 'need_roll' | 'rolling' | 'moving' | 'turn_ended' | 'game_over';

export interface TavlaHint {
  from: number | 'bar';
  to: number | 'off';
  diceUsed: number;
  reason: string;
}

export interface TavlaGameState {
  points: BoardPoint[]; // Array of 24 points (indices 1 to 24)
  bar: Record<PlayerColor, number>;
  borneOff: Record<PlayerColor, number>;
  currentTurn: PlayerColor;
  turnPhase: TurnPhase;
  gameMode: 'vs_ai' | 'vs_player';
  diceState: DiceState;
  selectedPoint: number | 'bar' | null;
  validDestinations: Array<number | 'off'>;
  activeHint: TavlaHint | null;
  moveHistory: TavlaMove[];
  winner: PlayerColor | null;
  winType: WinType | null;
  statusMessage: string;
  isAiThinking: boolean;
}

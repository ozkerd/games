export type ActiveView =
  | 'hub'
  | 'game_hangman'
  | 'game_connect4'
  | 'game_memory'
  | 'game_tictactoe';

export type GameStage = 'setup' | 'playing' | 'gameover';

export type GameMode = 'vs_player' | 'vs_ai';

export interface PlayerScore {
  player1: number;
  player2: number;
}

export interface DualHangmanState {
  stage: GameStage;
  gameMode: GameMode;
  secretWord: string;
  category: string;
  hint: string;
  maxMistakes: number;
  player1Guesses: Set<string>;
  player2Guesses: Set<string>;
  currentTurn: 1 | 2; // 1 = Player 1, 2 = Player 2 (AI in vs_ai mode)
  winner: 'player1' | 'player2' | 'tie' | null;
  player1Name: string;
  player2Name: string;
}

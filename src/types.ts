export type ActiveView = 'hub' | 'game_hangman';

export type GameStage = 'setup' | 'playing' | 'gameover';

export interface PlayerScore {
  player1: number;
  player2: number;
}

export interface DualHangmanState {
  stage: GameStage;
  secretWord: string;
  category: string;
  hint: string;
  maxMistakes: number;
  player1Guesses: Set<string>;
  player2Guesses: Set<string>;
  currentTurn: 1 | 2; // 1 = Player 1, 2 = Player 2
  winner: 'player1' | 'player2' | 'tie' | null;
  player1Name: string;
  player2Name: string;
}

export type GameStage = 'setup' | 'playing' | 'gameover';

export interface PlayerScore {
  player1: number; // Words successfully set & defended
  player2: number; // Words successfully guessed
}

export interface GameState {
  stage: GameStage;
  secretWord: string;
  category: string;
  guessedLetters: Set<string>;
  maxMistakes: number;
  winner: 'player1' | 'player2' | null;
  player1Name: string;
  player2Name: string;
  activeGuesser: 1 | 2; // Which player is currently guessing
}

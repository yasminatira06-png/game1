export type Screen = 'splash' | 'menu' | 'levels' | 'game' | 'result' | 'guide' | 'about';

export interface Question {
  id: number;
  correctWords: string[];
  scrambledWords: string[];
  meaningOrHint?: string;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  wordCountDesc: string;
  themeColor: {
    gradient: string;
    border: string;
    shadow: string;
    bgAccent: string;
    badge: string;
    icon: string;
  };
  questions: Question[];
}

export interface PlayerStats {
  totalScore: number;
  unlockedLevels: number[];
  levelBestScores: Record<number, number>;
  levelStars: Record<number, number>;
  soundEnabled: boolean;
}

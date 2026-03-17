
export interface Hexagram {
  id: number;
  name: string;
  binary: string; // 6 bits, bottom to top. e.g. "111111" is Qian
  meaning: string;
  upperTrigram: string;
  lowerTrigram: string;
  guaci: string;
  tuanzhuan: string;
  sequence: number;
  palace: string;
  nature: string; // e.g. "天", "地"
}

export type MasteryLevel = 'UNTOUCHED' | 'WEAK' | 'UNSTABLE' | 'MASTERED';

export interface UserProgress {
  hexagramId: number;
  mastery: MasteryLevel;
  lastCorrectTime: number;
  errorCount: number;
  responseTimeMs: number;
}

export interface QuizQuestion {
  type: 'VISUAL' | 'STRUCTURE' | 'LOGIC' | 'TEXT';
  question: string;
  options: string[];
  answerIndex: number;
  hexagramId: number;
  explanation: string;
  hint?: string;
}

export enum UserTitle {
  TONG_SHENG = '童生',
  XIU_CAI = '秀才',
  JU_REN = '举人',
  JIN_SHI = '进士',
  HAN_LIN = '翰林',
  ZONG_SHI = '宗师',
  YI_SHENG = '易圣'
}

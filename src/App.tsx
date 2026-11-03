/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Trophy,
  BookOpen,
  Info,
  Play,
  Star,
  HelpCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Ear,
} from 'lucide-react';
import { Screen, Question, LevelData, PlayerStats } from './types';
import { GAME_LEVELS } from './data/questions';
import { sound } from './utils/sound';
import { BubuOwl, OwlMood } from './components/BubuOwl';
import { fireCelebrationConfetti, fireGrandCelebration } from './utils/confetti';

const STORAGE_KEY = 'tekakata_player_stats_v1';

export default function App() {
  // Navigation & Game State
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [questionIdx, setQuestionIdx] = useState<number>(0);

  // Player Stats (Persisted locally in localStorage for child's convenience)
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      totalScore: 0,
      unlockedLevels: [1],
      levelBestScores: {},
      levelStars: {},
      soundEnabled: true,
    };
  });

  // Sound sync
  useEffect(() => {
    sound.soundEnabled = stats.soundEnabled;
  }, [stats.soundEnabled]);

  const toggleSound = () => {
    setStats((prev) => {
      const nextSound = !prev.soundEnabled;
      sound.soundEnabled = nextSound;
      const updated = { ...prev, soundEnabled: nextSound };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Question Interaction State
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [poolWords, setPoolWords] = useState<string[]>([]);
  const [isFirstAttempt, setIsFirstAttempt] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [correctAnswersInLevel, setCorrectAnswersInLevel] = useState<number>(0);
  const [levelEarnedScore, setLevelEarnedScore] = useState<number>(0);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState<number>(0);

  // Drag and Drop support
  const [draggedWordIdx, setDraggedWordIdx] = useState<number | null>(null);

  // Active level & question
  const activeLevel: LevelData =
    GAME_LEVELS.find((lvl) => lvl.id === selectedLevelId) || GAME_LEVELS[0];
  const currentQuestion: Question =
    activeLevel.questions[questionIdx] || activeLevel.questions[0];

  // Auto transition for Splash Screen
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('menu');
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Prepare words whenever level or question changes
  useEffect(() => {
    if (currentScreen === 'game' && currentQuestion) {
      setPoolWords([...currentQuestion.scrambledWords]);
      setSelectedWords([]);
      setIsFirstAttempt(true);
      setFeedback('none');
    }
  }, [currentScreen, questionIdx, selectedLevelId]);

  // Save stats helper
  const updateStats = (modifier: (prev: PlayerStats) => PlayerStats) => {
    setStats((prev) => {
      const next = modifier(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Word Selection: from pool into answer slots
  const handleSelectWord = (word: string, indexInPool: number) => {
    sound.playPop();
    const nextPool = [...poolWords];
    nextPool.splice(indexInPool, 1);
    setPoolWords(nextPool);
    setSelectedWords((prev) => [...prev, word]);
  };

  // Word Removal: from answer slots back to pool
  const handleRemoveWord = (word: string, indexInAnswer: number) => {
    sound.playRemove();
    const nextSelected = [...selectedWords];
    nextSelected.splice(indexInAnswer, 1);
    setSelectedWords(nextSelected);
    setPoolWords((prev) => [...prev, word]);
  };

  // Move Word Left or Right in Answer slots
  const handleMoveWord = (index: number, direction: 'left' | 'right') => {
    sound.playPop();
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= selectedWords.length) return;
    const nextSelected = [...selectedWords];
    const temp = nextSelected[index];
    nextSelected[index] = nextSelected[targetIdx];
    nextSelected[targetIdx] = temp;
    setSelectedWords(nextSelected);
  };

  // Drag and drop reordering inside answer container
  const handleDragStart = (index: number) => {
    setDraggedWordIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedWordIdx === null || draggedWordIdx === targetIndex) return;
    const nextSelected = [...selectedWords];
    const draggedItem = nextSelected[draggedWordIdx];
    nextSelected.splice(draggedWordIdx, 1);
    nextSelected.splice(targetIndex, 0, draggedItem);
    setDraggedWordIdx(targetIndex);
    setSelectedWords(nextSelected);
  };

  const handleDragEnd = () => {
    setDraggedWordIdx(null);
  };

  // Reset current question
  const handleResetCurrent = () => {
    sound.playPop();
    setPoolWords([...currentQuestion.scrambledWords]);
    setSelectedWords([]);
    setFeedback('none');
  };

  // Start selected level
  const handleStartLevel = (lvlId: number) => {
    sound.playPop();
    setSelectedLevelId(lvlId);
    setQuestionIdx(0);
    setCorrectAnswersInLevel(0);
    setFirstTryCorrectCount(0);
    setLevelEarnedScore(0);
    setCurrentScreen('game');
  };

  // Check Answer
  const handleCheckAnswer = () => {
    const isCorrect =
      selectedWords.length === currentQuestion.correctWords.length &&
      selectedWords.every((w, idx) => w === currentQuestion.correctWords[idx]);

    if (isCorrect) {
      sound.playCorrect();
      fireCelebrationConfetti();
      setFeedback('correct');

      const earned = isFirstAttempt ? 100 : 50;
      setLevelEarnedScore((prev) => prev + earned);
      setCorrectAnswersInLevel((prev) => prev + 1);
      if (isFirstAttempt) {
        setFirstTryCorrectCount((prev) => prev + 1);
      }

      updateStats((prev) => ({
        ...prev,
        totalScore: prev.totalScore + earned,
      }));

      // Speak the completed sentence automatically for listening practice
      const fullSentence = currentQuestion.correctWords.join(' ');
      setTimeout(() => {
        sound.speakIndonesian(fullSentence);
      }, 400);
    } else {
      sound.playWrong();
      setFeedback('wrong');
      setIsFirstAttempt(false);
    }
  };

  // Next Question / Complete Level
  const handleNextQuestion = () => {
    sound.playPop();
    if (questionIdx < activeLevel.questions.length - 1) {
      setQuestionIdx((prev) => prev + 1);
    } else {
      // Completed all 5 questions: Award 100 bonus points!
      sound.playVictory();
      fireGrandCelebration();
      const bonus = 100;
      const finalLevelScore = levelEarnedScore + bonus;
      setLevelEarnedScore(finalLevelScore);

      // Calculate Stars (1-3 stars)
      // 3 stars: 4-5 first-try correct
      // 2 stars: 2-3 first-try correct
      // 1 star: completed
      let stars = 1;
      if (firstTryCorrectCount >= 4) {
        stars = 3;
      } else if (firstTryCorrectCount >= 2) {
        stars = 2;
      }

      updateStats((prev) => {
        const nextUnlocked = [...prev.unlockedLevels];
        if (selectedLevelId < 3 && !nextUnlocked.includes(selectedLevelId + 1)) {
          nextUnlocked.push(selectedLevelId + 1);
        }

        const bestScore = Math.max(
          prev.levelBestScores[selectedLevelId] || 0,
          finalLevelScore
        );
        const bestStars = Math.max(prev.levelStars[selectedLevelId] || 0, stars);

        return {
          ...prev,
          totalScore: prev.totalScore + bonus,
          unlockedLevels: nextUnlocked,
          levelBestScores: { ...prev.levelBestScores, [selectedLevelId]: bestScore },
          levelStars: { ...prev.levelStars, [selectedLevelId]: bestStars },
        };
      });

      setCurrentScreen('result');
    }
  };

  // Speak Current Sentence (Text to speech for kids)
  const handlePronounce = (text?: string) => {
    sound.playPop();
    const sentenceToRead = text || currentQuestion.correctWords.join(' ');
    sound.speakIndonesian(sentenceToRead);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-50 text-slate-800 flex flex-col justify-between select-none relative overflow-x-hidden">
      {/* Top Floating Controls (Sound & Home) */}
      <div className="absolute top-4 right-4 z-40 flex items-center space-x-2">
        <button
          onClick={toggleSound}
          className="bg-white/90 backdrop-blur border-2 border-amber-200 text-slate-700 hover:text-amber-600 p-2.5 rounded-2xl shadow-sm hover:scale-105 active:scale-95 transition-all"
          title={stats.soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          aria-label="Toggle sound"
        >
          {stats.soundEnabled ? (
            <Volume2 className="w-5 h-5 text-amber-600" />
          ) : (
            <VolumeX className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {currentScreen !== 'menu' && currentScreen !== 'splash' && (
          <button
            onClick={() => {
              sound.playPop();
              setCurrentScreen('menu');
            }}
            className="bg-white/90 backdrop-blur border-2 border-slate-200 text-slate-700 hover:text-sky-600 px-3 py-2 rounded-2xl shadow-sm font-bold text-xs flex items-center space-x-1 hover:scale-105 active:scale-95 transition-all font-fredoka"
          >
            <span>🏠 Menu</span>
          </button>
        )}
      </div>

      {/* ========================================================
          A. SPLASH SCREEN
          ======================================================== */}
      {currentScreen === 'splash' && (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in relative z-10">
          <div className="animate-float">
            <BubuOwl mood="celebrate" className="w-48 h-48 md:w-56 md:h-56" />
          </div>

          <div className="mt-6 flex items-center justify-center space-x-2">
            <span className="text-3xl animate-bounce">✨</span>
            <h1 className="font-fredoka text-5xl md:text-6xl text-sky-600 font-bold tracking-wide drop-shadow-sm">
              Teka<span className="text-amber-500">Kata</span>
            </h1>
            <span className="text-3xl animate-bounce delay-150">✨</span>
          </div>

          <p className="text-lg md:text-xl text-slate-600 font-bold mt-2">
            Game Edukasi Susun Kalimat Anak Cerdas
          </p>

          <div className="mt-8 flex items-center space-x-3 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-sm border border-amber-200">
            <div className="w-3.5 h-3.5 bg-amber-400 rounded-full animate-ping" />
            <span className="text-sm font-bold text-amber-900">
              Menyiapkan petualangan kata...
            </span>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              setCurrentScreen('menu');
            }}
            className="mt-6 text-sky-700 hover:text-sky-900 underline font-bold text-sm bg-white/70 px-4 py-1.5 rounded-full"
          >
            Lewati Menuju Menu Utama &rarr;
          </button>
        </main>
      )}

      {/* ========================================================
          B. MENU UTAMA
          ======================================================== */}
      {currentScreen === 'menu' && (
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 max-w-md mx-auto w-full relative z-10">
          {/* Header & Logo */}
          <div className="text-center mb-5">
            <div className="transform hover:scale-105 transition-transform inline-block">
              <BubuOwl
                mood="happy"
                className="w-36 h-36 md:w-44 md:h-44"
                interactive
                onClick={() => {
                  sound.playPop();
                }}
              />
            </div>
            <h1 className="font-fredoka text-5xl md:text-6xl text-sky-600 font-bold tracking-wide mt-2">
              Teka<span className="text-amber-500">Kata</span>
            </h1>
            <p className="text-slate-600 font-bold text-sm md:text-base mt-1">
              Petualangan Kalimat Bahasa Indonesia SD
            </p>
          </div>

          {/* Bar Total Skor */}
          <div className="w-full bg-white/90 backdrop-blur border-2 border-amber-300 rounded-3xl p-3.5 mb-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-xl">
                ⭐
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Total Bintang & Skor
                </span>
                <span className="font-fredoka font-bold text-slate-700 text-sm">
                  Skor Petualang
                </span>
              </div>
            </div>
            <span className="font-fredoka font-bold text-3xl text-amber-500">
              {stats.totalScore}
            </span>
          </div>

          {/* Menu Action Buttons */}
          <div className="w-full flex flex-col space-y-3.5">
            <button
              onClick={() => {
                sound.playPop();
                setCurrentScreen('levels');
              }}
              className="w-full font-fredoka text-2xl py-4 px-6 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white rounded-3xl shadow-[0_6px_0_#15803d] active:shadow-[0_2px_0_#15803d] active:translate-y-1 transition-all flex items-center justify-center space-x-3 group"
            >
              <Play className="w-7 h-7 fill-white group-hover:scale-110 transition-transform" />
              <span>Mulai Bermain</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setCurrentScreen('guide');
              }}
              className="w-full font-fredoka text-xl py-3.5 px-6 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-3xl shadow-[0_5px_0_#1d4ed8] active:shadow-[0_2px_0_#1d4ed8] active:translate-y-1 transition-all flex items-center justify-center space-x-3 group"
            >
              <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>Panduan Bermain</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setCurrentScreen('about');
              }}
              className="w-full font-fredoka text-lg py-3 px-6 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 rounded-3xl shadow-[0_4px_0_#cbd5e1] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center space-x-2"
            >
              <Info className="w-5 h-5 text-slate-500" />
              <span>Tentang Aplikasi</span>
            </button>
          </div>

          {/* Friendly prompt */}
          <div className="mt-6 flex items-center space-x-2 text-xs font-bold text-slate-500 bg-white/60 px-4 py-2 rounded-full border border-slate-200">
            <span>💡</span>
            <span>Sentuh Bubu burung hantu untuk menyapanya!</span>
          </div>
        </main>
      )}

      {/* ========================================================
          C. PILIH LEVEL
          ======================================================== */}
      {currentScreen === 'levels' && (
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 flex flex-col justify-between relative z-10">
          <div>
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => {
                  sound.playPop();
                  setCurrentScreen('menu');
                }}
                className="font-fredoka bg-white border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-2xl shadow-sm hover:bg-slate-100 flex items-center space-x-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <div className="bg-amber-100/90 border-2 border-amber-300 px-3.5 py-1.5 rounded-2xl flex items-center space-x-1.5 shadow-sm">
                <span className="text-lg">⭐</span>
                <span className="font-fredoka text-amber-900 font-bold text-sm">
                  {stats.totalScore} Poin
                </span>
              </div>
            </div>

            {/* Level Title */}
            <div className="text-center mb-6">
              <h2 className="font-fredoka text-3xl md:text-4xl text-slate-800 font-bold">
                Pilih Level Permainan
              </h2>
              <p className="text-slate-600 font-bold mt-1 text-sm md:text-base">
                Selesaikan tiap level untuk membuka tantangan berikutnya!
              </p>
            </div>

            {/* Level Cards */}
            <div className="flex flex-col space-y-4">
              {GAME_LEVELS.map((lvl) => {
                const isUnlocked = stats.unlockedLevels.includes(lvl.id);
                const bestScore = stats.levelBestScores[lvl.id] || 0;
                const starsCount = stats.levelStars[lvl.id] || 0;

                return (
                  <div
                    key={lvl.id}
                    onClick={() => isUnlocked && handleStartLevel(lvl.id)}
                    className={`relative p-5 rounded-3xl border-3 transition-all ${
                      isUnlocked
                        ? `bg-gradient-to-r ${lvl.themeColor.gradient} ${lvl.themeColor.border} cursor-pointer hover:scale-[1.01] shadow-[0_6px_0_rgba(0,0,0,0.06)]`
                        : 'bg-slate-100/90 border-slate-300 text-slate-400 opacity-80 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center font-fredoka text-2xl font-bold shadow-sm ${
                            isUnlocked
                              ? 'bg-white text-slate-800 border-2 border-black/5'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isUnlocked ? lvl.themeColor.icon : '🔒'}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-fredoka text-xl md:text-2xl font-bold text-slate-800">
                              {lvl.title}
                            </h3>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs ${lvl.themeColor.badge}`}
                            >
                              {lvl.wordCountDesc}
                            </span>
                          </div>

                          <p className="text-xs md:text-sm font-semibold text-slate-600 mt-0.5">
                            {lvl.subtitle} • 5 Soal
                          </p>

                          {/* Star badges earned */}
                          {isUnlocked && (
                            <div className="flex items-center space-x-1 mt-1.5">
                              {[1, 2, 3].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  className={`w-4 h-4 ${
                                    starIdx <= starsCount
                                      ? 'text-amber-500 fill-amber-400'
                                      : 'text-slate-300 fill-slate-200'
                                  }`}
                                />
                              ))}
                              {bestScore > 0 && (
                                <span className="text-xs font-bold text-slate-500 ml-2">
                                  Terbaik: {bestScore}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        {isUnlocked ? (
                          <button className="font-fredoka bg-white hover:bg-slate-50 text-slate-800 px-5 py-2.5 rounded-2xl font-bold shadow-sm text-sm border-2 border-slate-200 flex items-center space-x-1.5">
                            <span>Main</span>
                            <Play className="w-4 h-4 fill-slate-700" />
                          </button>
                        ) : (
                          <div className="bg-slate-200 px-3 py-1.5 rounded-xl font-bold text-xs text-slate-500 flex items-center space-x-1">
                            <span>Terkunci</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Friendly footer info */}
          <div className="mt-6 text-center text-xs font-bold text-slate-500">
            Dapatkan skor sempurna pada percobaan pertama untuk meraih 3 Bintang emas! ⭐
          </div>
        </main>
      )}

      {/* ========================================================
          D. HALAMAN PERMAINAN (GAME)
          ======================================================== */}
      {currentScreen === 'game' && (
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 flex flex-col justify-between relative z-10">
          <div>
            {/* Game Header Bar */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => {
                  sound.playPop();
                  setCurrentScreen('levels');
                }}
                className="bg-white px-3.5 py-1.5 rounded-2xl text-slate-700 font-bold border-2 border-slate-200 shadow-sm text-sm flex items-center space-x-1 hover:bg-slate-50 font-fredoka"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Level</span>
              </button>

              <div className="flex items-center space-x-2.5">
                <span className="font-fredoka text-xs md:text-sm font-bold bg-white px-3 py-1.5 rounded-2xl border-2 border-amber-200 text-amber-800 shadow-sm">
                  Soal {questionIdx + 1} / {activeLevel.questions.length}
                </span>

                <div className="font-fredoka text-xs md:text-sm font-bold bg-amber-400 text-amber-950 px-3.5 py-1.5 rounded-2xl shadow-sm flex items-center space-x-1">
                  <span>⭐</span>
                  <span>{stats.totalScore}</span>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden mb-5 p-0.5 border border-slate-300/40">
              <div
                className="bg-gradient-to-r from-amber-400 via-emerald-400 to-green-500 h-full rounded-full transition-all duration-400 shadow-xs"
                style={{
                  width: `${((questionIdx + 1) / activeLevel.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Mascot Banner & Instructions */}
            <div className="flex items-center bg-white/90 backdrop-blur rounded-3xl p-3.5 md:p-4 border-2 border-amber-200 shadow-sm mb-5">
              <BubuOwl
                mood={
                  feedback === 'correct'
                    ? 'celebrate'
                    : feedback === 'wrong'
                    ? 'oops'
                    : 'thinking'
                }
                className="w-16 h-16 md:w-20 md:h-20 shrink-0 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Petunjuk Bubu • {activeLevel.title}
                  </span>
                  <button
                    onClick={() => handlePronounce()}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 px-2 py-1 rounded-xl border border-sky-200 flex items-center space-x-1"
                    title="Dengarkan bantuan suara kalimat"
                  >
                    <Ear className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dengarkan</span>
                  </button>
                </div>
                <h2 className="font-fredoka text-lg md:text-xl text-slate-800 font-bold leading-snug mt-0.5">
                  Susun kata-kata acak berikut agar menjadi kalimat yang benar!
                </h2>
                {currentQuestion.meaningOrHint && (
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Petunjuk arti: "{currentQuestion.meaningOrHint}"
                  </p>
                )}
              </div>
            </div>

            {/* Area Jawaban (Word Slot Area) */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Area Jawaban Kalimat:
                </span>
                {selectedWords.length > 0 && (
                  <span className="text-xs text-sky-600 font-bold">
                    Tip: Ketuk kata untuk menghapus atau gunakan panah (◀ ▶)
                  </span>
                )}
              </div>

              <div className="min-h-[110px] md:min-h-[130px] p-3 md:p-4 bg-sky-50/90 border-3 border-dashed border-sky-300 rounded-3xl flex flex-wrap gap-2.5 items-center justify-center transition-all shadow-inner">
                {selectedWords.length === 0 ? (
                  <div className="text-sky-400 font-bold text-sm md:text-base flex items-center space-x-2 text-center py-4">
                    <Sparkles className="w-5 h-5 animate-pulse text-amber-400" />
                    <span>Kotak masih kosong. Pilih kartu kata di bawah ya!</span>
                  </div>
                ) : (
                  selectedWords.map((word, idx) => (
                    <div
                      key={`ans-${word}-${idx}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`group relative flex items-center bg-white border-2 border-sky-400 shadow-[0_4px_0_#38bdf8] px-3 py-2 rounded-2xl transition-all cursor-move ${
                        draggedWordIdx === idx ? 'opacity-50 scale-95' : 'hover:scale-105'
                      }`}
                    >
                      {/* Geser Kiri Button */}
                      {idx > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveWord(idx, 'left');
                          }}
                          className="text-xs text-slate-400 hover:text-sky-600 mr-1 p-0.5 rounded hover:bg-slate-100"
                          title="Pindah ke kiri"
                          aria-label="Pindah ke kiri"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      )}

                      {/* Click word text to remove it */}
                      <span
                        onClick={() => handleRemoveWord(word, idx)}
                        className="font-fredoka text-lg md:text-xl font-bold text-slate-800 cursor-pointer hover:text-rose-500 transition-colors mx-1"
                        title="Klik untuk menghapus kata"
                      >
                        {word}
                      </span>

                      {/* Geser Kanan Button */}
                      {idx < selectedWords.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveWord(idx, 'right');
                          }}
                          className="text-xs text-slate-400 hover:text-sky-600 ml-1 p-0.5 rounded hover:bg-slate-100"
                          title="Pindah ke kanan"
                          aria-label="Pindah ke kanan"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Kumpulan Kartu Kata Acak (Word Pool) */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 px-1">
                Pilihan Kartu Kata Acak:
              </span>
              <div className="flex flex-wrap gap-2.5 md:gap-3 justify-center min-h-[75px] p-4 bg-amber-100/60 rounded-3xl border-2 border-amber-200 shadow-sm">
                {poolWords.length === 0 ? (
                  <span className="text-xs md:text-sm font-bold text-slate-400 self-center py-2">
                    ✅ Semua kata telah dimasukkan ke dalam susunan!
                  </span>
                ) : (
                  poolWords.map((word, idx) => (
                    <button
                      key={`pool-${word}-${idx}`}
                      onClick={() => handleSelectWord(word, idx)}
                      className="font-fredoka text-lg md:text-xl font-bold bg-white hover:bg-amber-100 text-slate-800 px-4 md:px-5 py-2.5 rounded-2xl border-2 border-amber-300 shadow-[0_5px_0_#fcd34d] active:shadow-[0_1px_0_#fcd34d] active:translate-y-1 transition-all"
                    >
                      {word}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons (Ulangi & Periksa Jawaban) */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleResetCurrent}
              className="w-full sm:w-auto font-fredoka px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-2xl border-2 border-slate-200 shadow-[0_4px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-2 text-base"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi</span>
            </button>

            <button
              disabled={selectedWords.length === 0}
              onClick={handleCheckAnswer}
              className={`w-full sm:flex-1 font-fredoka text-xl py-3.5 px-6 rounded-2xl shadow-[0_5px_0_#059669] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-2 ${
                selectedWords.length > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 shadow-[0_4px_0_#cbd5e1] cursor-not-allowed border-2 border-slate-300/40'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Periksa Jawaban</span>
            </button>
          </div>

          {/* ========================================================
              E. FEEDBACK MODAL (BENAR / SALAH)
              ======================================================== */}
          {feedback !== 'none' && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div
                className={`bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border-4 transform transition-all animate-bounce-subtle ${
                  feedback === 'correct' ? 'border-emerald-400' : 'border-rose-400'
                }`}
              >
                <div className="mb-3">
                  <BubuOwl
                    mood={feedback === 'correct' ? 'celebrate' : 'oops'}
                    className="w-28 h-28 mx-auto"
                  />
                </div>

                {feedback === 'correct' ? (
                  <>
                    <h3 className="font-fredoka text-2xl md:text-3xl text-emerald-600 font-bold">
                      Hebat! Jawabanmu Benar! 🎉
                    </h3>

                    <div className="my-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 font-medium text-sm flex items-center justify-between">
                      <span className="font-bold text-emerald-950">
                        "{currentQuestion.correctWords.join(' ')}"
                      </span>
                      <button
                        onClick={() => handlePronounce()}
                        className="text-emerald-700 hover:text-emerald-900 p-1.5 bg-emerald-100 rounded-xl"
                        title="Dengarkan lagi"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mb-4 bg-amber-50 border-2 border-amber-300 rounded-2xl py-2 px-4 text-amber-900 font-fredoka text-lg flex items-center justify-center space-x-1.5">
                      <span>⭐</span>
                      <span>
                        +{isFirstAttempt ? 100 : 50} Poin Didapatkan!
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-semibold mb-4">
                      {isFirstAttempt
                        ? 'Luar biasa! Benar pada percobaan pertama (+100 poin)!'
                        : 'Hebat, tidak mudah menyerah dan berhasil (+50 poin)!'}
                    </p>

                    <button
                      onClick={handleNextQuestion}
                      className="w-full font-fredoka text-xl py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl shadow-[0_4px_0_#15803d] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-2"
                    >
                      <span>
                        {questionIdx < activeLevel.questions.length - 1
                          ? 'Soal Berikutnya'
                          : 'Lihat Hasil Level'}
                      </span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="font-fredoka text-2xl md:text-3xl text-rose-500 font-bold">
                      Hampir Benar!
                    </h3>
                    <p className="text-slate-600 font-bold text-sm mt-2">
                      Coba susun kembali, ya! Perhatikan urutan subjek dan kegiatannya.
                    </p>

                    <div className="my-3 text-xs font-semibold text-slate-600 bg-rose-50 p-3 rounded-2xl border border-rose-200">
                      💡 <strong>Tips dari Bubu:</strong> {currentQuestion.meaningOrHint}
                    </div>

                    <button
                      onClick={() => setFeedback('none')}
                      className="w-full font-fredoka text-xl py-3.5 px-6 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-[0_4px_0_#b91c1c] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Coba Lagi 💪</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ========================================================
          F. HALAMAN HASIL (RESULT)
          ======================================================== */}
      {currentScreen === 'result' && (
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 max-w-md mx-auto w-full text-center relative z-10">
          <div className="animate-float">
            <BubuOwl mood="celebrate" className="w-40 h-40" />
          </div>

          <h2 className="font-fredoka text-4xl text-slate-800 font-bold mt-3">
            Level Selesai! 🏆
          </h2>
          <p className="text-slate-600 font-bold text-sm mt-0.5">
            Selamat! Kamu berhasil menuntaskan {activeLevel.title}
          </p>

          {/* Bintang Penghargaan */}
          <div className="flex justify-center space-x-3 my-4">
            {[1, 2, 3].map((starIdx) => {
              const hasStar =
                (stats.levelStars[selectedLevelId] || 1) >= starIdx;
              return (
                <div
                  key={starIdx}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border-2 ${
                    hasStar
                      ? 'bg-amber-100 border-amber-300 text-amber-500'
                      : 'bg-slate-100 border-slate-200 text-slate-300'
                  }`}
                >
                  ⭐
                </div>
              );
            })}
          </div>

          {/* Rangkuman Skor */}
          <div className="w-full bg-white/95 backdrop-blur rounded-3xl p-5 border-2 border-amber-200 shadow-md mb-5 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-slate-600 border-b border-slate-100 pb-2">
              <span>Soal Diselesaikan:</span>
              <span className="text-slate-800 font-fredoka text-base">
                {correctAnswersInLevel} / {activeLevel.questions.length}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-slate-600 border-b border-slate-100 pb-2">
              <span>Tepat Percobaan Pertama:</span>
              <span className="text-sky-600 font-fredoka text-base">
                {firstTryCorrectCount} Soal (100 poin/soal)
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-slate-600 border-b border-slate-100 pb-2">
              <span>Bonus Tuntas Level:</span>
              <span className="text-emerald-600 font-fredoka text-base">
                +100 Poin ⭐
              </span>
            </div>

            <div className="flex justify-between items-center text-base font-bold text-slate-800 pt-1">
              <span>Total Skor Petualang:</span>
              <span className="font-fredoka text-2xl text-amber-500 font-bold">
                ⭐ {stats.totalScore}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            {selectedLevelId < 3 && (
              <button
                onClick={() => handleStartLevel(selectedLevelId + 1)}
                className="w-full font-fredoka text-xl py-3.5 px-6 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 text-white rounded-2xl shadow-[0_5px_0_#15803d] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-2"
              >
                <span>Level Berikutnya ➔</span>
              </button>
            )}

            <button
              onClick={() => handleStartLevel(selectedLevelId)}
              className="w-full font-fredoka text-lg py-3 px-6 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-2xl shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Main Lagi Level Ini</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setCurrentScreen('levels');
              }}
              className="w-full font-fredoka text-base py-3 px-6 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 rounded-2xl shadow-sm transition-all"
            >
              Pilih Level Lain
            </button>
          </div>
        </main>
      )}

      {/* ========================================================
          G. HALAMAN PANDUAN (GUIDE)
          ======================================================== */}
      {currentScreen === 'guide' && (
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 flex flex-col justify-between relative z-10">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => {
                  sound.playPop();
                  setCurrentScreen('menu');
                }}
                className="font-fredoka bg-white border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-2xl shadow-sm hover:bg-slate-100 flex items-center space-x-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <h2 className="font-fredoka text-2xl font-bold text-sky-700 flex items-center space-x-2">
                <BookOpen className="w-6 h-6" />
                <span>Panduan Bermain</span>
              </h2>
            </div>

            {/* Steps Cards */}
            <div className="space-y-3.5">
              <div className="bg-white/95 p-4 rounded-3xl border-2 border-sky-200 shadow-sm flex items-start space-x-3.5">
                <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-2xl shrink-0 font-fredoka text-sky-700 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-fredoka text-lg font-bold text-slate-800">
                    Pilih Kata dari Kotak Acak
                  </h3>
                  <p className="text-slate-600 text-sm font-semibold mt-0.5">
                    Ketuk kata di kotak bawah untuk memindahkannya ke kotak susunan kalimat di atas.
                  </p>
                </div>
              </div>

              <div className="bg-white/95 p-4 rounded-3xl border-2 border-amber-200 shadow-sm flex items-start space-x-3.5">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl shrink-0 font-fredoka text-amber-700 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-fredoka text-lg font-bold text-slate-800">
                    Atur Urutan Kata dengan Mudah
                  </h3>
                  <p className="text-slate-600 text-sm font-semibold mt-0.5">
                    Gunakan tanda panah kecil (◀ ▶) pada kata atau seret kata untuk mengubah posisinya. Ketuk kata untuk mengembalikannya ke bawah.
                  </p>
                </div>
              </div>

              <div className="bg-white/95 p-4 rounded-3xl border-2 border-emerald-200 shadow-sm flex items-start space-x-3.5">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl shrink-0 font-fredoka text-emerald-700 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-fredoka text-lg font-bold text-slate-800">
                    Periksa & Kumpulkan Bintang
                  </h3>
                  <p className="text-slate-600 text-sm font-semibold mt-0.5">
                    • <strong>100 Poin</strong> jika benar pada percobaan pertama.<br />
                    • <strong>50 Poin</strong> jika benar setelah mencoba kembali.<br />
                    • <strong>100 Poin Bonus</strong> setelah menuntaskan seluruh 5 soal!
                  </p>
                </div>
              </div>
            </div>

            {/* Example Box */}
            <div className="mt-5 p-4 bg-amber-100/70 border-2 border-amber-300 rounded-3xl">
              <span className="font-fredoka text-xs uppercase tracking-wider text-amber-900 block font-bold mb-1">
                Contoh Soal:
              </span>
              <div className="text-xs md:text-sm font-bold text-slate-700">
                Kata acak:{' '}
                <span className="bg-white px-2 py-0.5 rounded-lg border border-amber-200 text-amber-900 mx-1">
                  nasi
                </span>
                –
                <span className="bg-white px-2 py-0.5 rounded-lg border border-amber-200 text-amber-900 mx-1">
                  Adik
                </span>
                –
                <span className="bg-white px-2 py-0.5 rounded-lg border border-amber-200 text-amber-900 mx-1">
                  makan
                </span>
              </div>
              <div className="text-xs md:text-sm font-bold text-emerald-700 mt-1">
                Susunan benar: <strong>Adik makan nasi.</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              setCurrentScreen('levels');
            }}
            className="mt-6 w-full font-fredoka text-xl py-3.5 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white rounded-2xl shadow-[0_5px_0_#0369a1] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-2"
          >
            <span>Aku Mengerti, Ayo Bermain! 🚀</span>
          </button>
        </main>
      )}

      {/* ========================================================
          H. HALAMAN TENTANG (ABOUT)
          ======================================================== */}
      {currentScreen === 'about' && (
        <main className="flex-1 max-w-xl mx-auto w-full p-4 md:p-6 flex flex-col justify-between relative z-10">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => {
                  sound.playPop();
                  setCurrentScreen('menu');
                }}
                className="font-fredoka bg-white border-2 border-slate-200 text-slate-700 px-4 py-2 rounded-2xl shadow-sm hover:bg-slate-100 flex items-center space-x-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <h2 className="font-fredoka text-2xl font-bold text-slate-700 flex items-center space-x-2">
                <Info className="w-6 h-6 text-sky-600" />
                <span>Tentang Aplikasi</span>
              </h2>
            </div>

            {/* About Card */}
            <div className="bg-white/95 rounded-3xl p-6 border-2 border-amber-200 shadow-sm text-center">
              <BubuOwl mood="reading" className="w-24 h-24 mx-auto mb-2" />
              <h3 className="font-fredoka text-3xl text-sky-600 font-bold">
                Teka<span className="text-amber-500">Kata</span>
              </h3>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full inline-block mt-1">
                Edisi Edukasi Anak SD v1.0
              </span>

              <p className="text-slate-600 font-semibold text-sm md:text-base mt-4 leading-relaxed text-justify md:text-center">
                <strong>TekaKata</strong> adalah aplikasi permainan edukatif yang dirancang khusus untuk siswa Sekolah Dasar usia 7 hingga 12 tahun. Melalui pendekatan bermain sambil belajar (gamifikasi), anak-anak dilatih untuk:
              </p>

              <div className="text-left mt-3 space-y-1.5 text-xs md:text-sm font-semibold text-slate-700 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">✔</span>
                  <span>Mengenal kosakata bahasa Indonesia baku.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">✔</span>
                  <span>Memahami urutan Subjek – Predikat – Objek – Keterangan (SPOK).</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-500">✔</span>
                  <span>Meningkatkan daya ingat, logika, dan konsentrasi anak.</span>
                </div>
              </div>

              {/* Badges */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-2">
                <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1.5 rounded-full">
                  👶 100% Ramah Anak
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                  🏫 Sesuai Kurikulum SD
                </span>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
                  🇮🇩 Bahasa Indonesia
                </span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 font-bold mt-6">
            Dibuat dengan ❤️ untuk kecerdasan generasi penerus bangsa.
          </div>
        </main>
      )}

      {/* Footer Hak Cipta Ringan */}
      <footer className="text-center py-2 text-xs font-bold text-slate-400 select-none">
        TekaKata © Game Edukasi Bahasa Anak SD
      </footer>
    </div>
  );
}

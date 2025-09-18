import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CricketPlayer, InsertGameScore } from "@shared/schema";

interface GameState {
  currentLevel: number;
  currentQuestionInLevel: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  timeLeft: number;
  isAnswered: boolean;
}

interface QuestionData {
  player: CricketPlayer;
  options: string[];
  correctOptionIndex: number;
}

export default function Game() {
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    currentQuestionInLevel: 1,
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    skippedAnswers: 0,
    timeLeft: 15,
    isAnswered: false,
  });

  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  const { data: players = [] } = useQuery<CricketPlayer[]>({
    queryKey: ["/api/cricket-players"],
  });

  // Mutation for saving game scores
  const saveScoreMutation = useMutation({
    mutationFn: async (scoreData: InsertGameScore) => {
      const response = await apiRequest("POST", "/api/game-scores", scoreData);
      return response.json();
    },
    onSuccess: () => {
      setScoreSaved(true);
      toast({
        title: "🎉 Score Saved!",
        description: "Your score has been saved successfully!",
        className: "bg-green-500 text-white",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/top-scores"] });
    },
    onError: (error) => {
      toast({
        title: "❌ Save Failed",
        description: "Failed to save your score. Please try again.",
        className: "bg-red-500 text-white",
      });
      console.error("Score save error:", error);
    },
  });

  // Initialize game when players are loaded
  useEffect(() => {
    if (players.length > 0 && !currentQuestion) {
      loadQuestion();
    }
  }, [players]);

  // Determine difficulty based on current level
  const getCurrentDifficulty = (level: number): string => {
    if (level <= 5) return "easy";
    if (level <= 12) return "medium";
    if (level <= 18) return "hard";
    return "expert";
  };

  // Load new question
  const loadQuestion = (level?: number) => {
    if (players.length === 0) return;

    // Use passed level or current level from state
    const targetLevel = level ?? gameState.currentLevel;
    
    // Filter players by target difficulty level
    const currentDifficulty = getCurrentDifficulty(targetLevel);
    const difficultyPlayers = players.filter(player => player.difficulty === currentDifficulty);
    
    // Fallback to all players if no players found for difficulty (shouldn't happen)
    const availablePlayers = difficultyPlayers.length > 0 ? difficultyPlayers : players;
    
    const player = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    
    // Generate 4 options (1 correct + 3 wrong)
    const options = [player.name];
    const correctOptionIndex = Math.floor(Math.random() * 4);
    
    // Add 3 random wrong options from the same difficulty pool
    while (options.length < 4) {
      // Try to get from difficulty players first, fall back to all players only if not enough unique names
      const sourcePool = difficultyPlayers.length >= 4 ? difficultyPlayers : players;
      const randomPlayer = sourcePool[Math.floor(Math.random() * sourcePool.length)];
      if (!options.includes(randomPlayer.name)) {
        options.push(randomPlayer.name);
      }
    }
    
    // Shuffle options
    const correctAnswer = options[0];
    const shuffledOptions = shuffle([...options]);
    const finalCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    
    setCurrentQuestion({
      player,
      options: shuffledOptions,
      correctOptionIndex: finalCorrectIndex,
    });

    setGameState(prev => ({ ...prev, isAnswered: false, timeLeft: 15 }));
    startTimer();
  };

  // Shuffle array
  const shuffle = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Timer functions
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!prev.isAnswered) {
            timeUp();
          }
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  // Answer selection
  const selectAnswer = (optionIndex: number) => {
    if (gameState.isAnswered || !currentQuestion) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState(prev => ({ ...prev, isAnswered: true }));
    
    if (optionIndex === currentQuestion.correctOptionIndex) {
      // Correct answer
      setGameState(prev => ({ ...prev, correctAnswers: prev.correctAnswers + 1 }));
      toast({
        title: "✅ Correct!",
        description: "Great job!",
        className: "bg-green-500 text-white",
      });
    } else {
      // Wrong answer
      setGameState(prev => ({ ...prev, wrongAnswers: prev.wrongAnswers + 1 }));
      toast({
        title: "❌ Wrong!",
        description: `Correct answer: ${currentQuestion.options[currentQuestion.correctOptionIndex]}`,
        className: "bg-red-500 text-white",
      });
    }
    
    // Show ad and move to next question after delay
    setTimeout(() => {
      showAd();
      setTimeout(nextQuestion, 2000);
    }, 2000);
  };

  // Skip question
  const skipQuestion = () => {
    if (gameState.isAnswered || !currentQuestion) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState(prev => ({ 
      ...prev, 
      isAnswered: true, 
      skippedAnswers: prev.skippedAnswers + 1 
    }));
    
    toast({
      title: "⚡ Skipped!",
      description: `Correct answer: ${currentQuestion.options[currentQuestion.correctOptionIndex]}`,
      className: "bg-amber-500 text-white",
    });
    
    // Show ad and move to next question after delay
    setTimeout(() => {
      showAd();
      setTimeout(nextQuestion, 2000);
    }, 2000);
  };

  // Time up
  const timeUp = () => {
    if (!currentQuestion) return;
    
    setGameState(prev => ({ 
      ...prev, 
      isAnswered: true, 
      wrongAnswers: prev.wrongAnswers + 1 
    }));
    
    toast({
      title: "⏰ Time Up!",
      description: `Correct answer: ${currentQuestion.options[currentQuestion.correctOptionIndex]}`,
      className: "bg-red-500 text-white",
    });
    
    // Show ad and move to next question after delay
    setTimeout(() => {
      showAd();
      setTimeout(nextQuestion, 2000);
    }, 2000);
  };

  // Next question
  const nextQuestion = () => {
    setGameState(prev => {
      const newQuestionInLevel = prev.currentQuestionInLevel + 1;
      const newTotalQuestions = prev.totalQuestions + 1;
      
      if (newQuestionInLevel > 5) {
        // Level complete
        if (prev.currentLevel >= 20) {
          // Game complete
          setShowGameComplete(true);
        } else {
          setShowLevelComplete(true);
        }
      } else {
        // Load next question
        loadQuestion();
      }
      
      return {
        ...prev,
        totalQuestions: newTotalQuestions,
        currentQuestionInLevel: newQuestionInLevel,
      };
    });
  };

  // Next level
  const nextLevel = () => {
    setGameState(prev => ({
      ...prev,
      currentLevel: prev.currentLevel + 1,
      currentQuestionInLevel: 1,
    }));
    setShowLevelComplete(false);
  };

  // Effect to load question when level changes
  useEffect(() => {
    if (gameState.currentLevel > 1 && !showLevelComplete && !showGameComplete) {
      loadQuestion(gameState.currentLevel);
    }
  }, [gameState.currentLevel, showLevelComplete, showGameComplete]);

  // Save final score
  const saveFinalScore = () => {
    if (!playerName.trim()) {
      setShowNameInput(true);
      return;
    }

    const scoreData: InsertGameScore = {
      playerName: playerName.trim(),
      level: gameState.currentLevel,
      correctAnswers: gameState.correctAnswers,
      wrongAnswers: gameState.wrongAnswers,
      skippedAnswers: gameState.skippedAnswers,
    };

    saveScoreMutation.mutate(scoreData);
  };

  // Restart game
  const restartGame = () => {
    setGameState({
      currentLevel: 1,
      currentQuestionInLevel: 1,
      totalQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      skippedAnswers: 0,
      timeLeft: 15,
      isAnswered: false,
    });
    setShowGameComplete(false);
    setShowLevelComplete(false);
    setScoreSaved(false);
    setShowNameInput(false);
    setPlayerName("");
    loadQuestion();
  };

  // Show ad
  const showAd = () => {
    // Ad integration using provided script
    if (typeof (window as any).show_9872902 !== 'undefined') {
      (window as any).show_9872902();
    }
  };

  // Add ad script to document head
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//libtl.com/sdk.js';
    script.setAttribute('data-zone', '9872902');
    script.setAttribute('data-sdk', 'show_9872902');
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  const totalProgress = ((gameState.currentLevel - 1) * 5 + gameState.currentQuestionInLevel) / 100 * 100;
  const timerProgress = (gameState.timeLeft / 15) * 283;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen font-sans">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">🏏 Jersey Guess</h1>
          <p className="text-muted-foreground">Guess the cricket star!</p>
        </div>

        {/* Game Stats */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">Level</span>
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm font-bold">
                  {gameState.currentLevel}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">Question</span>
                <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm font-bold">
                  {gameState.currentQuestionInLevel}/5
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 timer-circle" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="8"/>
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" 
                strokeDasharray="283" 
                strokeDashoffset={283 - timerProgress}
                className="timer-progress transition-all duration-1000 linear"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{gameState.timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6 shadow-lg bounce-in">
          <CardContent className="pt-6">
            {/* Jersey Display */}
            <div className="text-center mb-6">
              <div className="mx-auto w-32 h-40 bg-gradient-to-b from-blue-500 to-blue-600 rounded-lg shadow-lg relative mb-4 border-4 border-white">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">{currentQuestion.player.jersey}</span>
                </div>
                <div className="absolute top-2 left-2 right-2 h-1 bg-white rounded"></div>
                <div className="absolute bottom-2 left-2 right-2 h-1 bg-white rounded"></div>
              </div>
              
              {/* Hint */}
              <div className="bg-accent rounded-lg p-3">
                <p className="text-sm text-accent-foreground font-medium">💡 Hint:</p>
                <p className="text-accent-foreground mt-1">{currentQuestion.player.hint}</p>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-lg font-bold text-center mb-6 text-foreground">
              Who wore jersey number <span className="text-primary">{currentQuestion.player.jersey}</span>?
            </h2>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full p-4 text-left rounded-xl border-2 hover:border-primary hover:bg-accent transition-all duration-200 font-medium h-auto justify-start"
                  onClick={() => selectAnswer(index)}
                  disabled={gameState.isAnswered}
                  data-testid={`option-button-${index}`}
                >
                  {String.fromCharCode(65 + index)}) {option}
                </Button>
              ))}
            </div>

            {/* Skip Button */}
            <Button
              variant="secondary"
              className="w-full mt-4 p-3 rounded-xl font-medium"
              onClick={skipQuestion}
              disabled={gameState.isAnswered}
              data-testid="skip-button"
            >
              ⚡ Skip Question
            </Button>
          </CardContent>
        </Card>

        {/* Score Display */}
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="correct-count">
                  {gameState.correctAnswers}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600" data-testid="wrong-count">
                  {gameState.wrongAnswers}
                </div>
                <div className="text-sm text-muted-foreground">Wrong</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600" data-testid="skip-count">
                  {gameState.skippedAnswers}
                </div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Complete Modal */}
        {showLevelComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="mx-4 max-w-sm w-full shadow-2xl">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold mb-2">Level Complete!</h3>
                  <p className="text-muted-foreground mb-4">Great job! Ready for the next level?</p>
                  <Button 
                    className="w-full rounded-xl py-3 font-medium"
                    onClick={nextLevel}
                    data-testid="continue-button"
                  >
                    Continue to Level {gameState.currentLevel + 1}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Complete Modal */}
        {showGameComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="mx-4 max-w-sm w-full shadow-2xl">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold mb-2">Game Complete!</h3>
                  <p className="text-muted-foreground mb-4">You've completed all 20 levels!</p>
                  
                  {/* Final Score Display */}
                  <div className="bg-accent rounded-lg p-4 mb-4">
                    <div className="text-sm text-accent-foreground">Final Score:</div>
                    <div className="text-lg font-bold text-primary" data-testid="final-score">
                      {gameState.correctAnswers}/100
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Correct: {gameState.correctAnswers} | Wrong: {gameState.wrongAnswers} | Skipped: {gameState.skippedAnswers}
                    </div>
                  </div>

                  {/* Player Name Input Section */}
                  {showNameInput && !scoreSaved && (
                    <div className="mb-4 text-left">
                      <Label htmlFor="player-name" className="text-sm font-medium">
                        Enter your name to save score (optional):
                      </Label>
                      <Input
                        id="player-name"
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Your name"
                        className="mt-1"
                        data-testid="input-player-name"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && playerName.trim()) {
                            saveFinalScore();
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Score Save Confirmation */}
                  {scoreSaved && (
                    <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 mb-4">
                      <div className="text-green-800 dark:text-green-200 text-sm font-medium">
                        ✅ Score saved successfully!
                      </div>
                      {playerName && (
                        <div className="text-green-600 dark:text-green-300 text-xs mt-1">
                          Saved for: {playerName}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {!scoreSaved && (
                      <>
                        {!showNameInput ? (
                          <Button 
                            className="w-full rounded-xl py-3 font-medium"
                            onClick={saveFinalScore}
                            disabled={saveScoreMutation.isPending}
                            data-testid="button-save-score"
                          >
                            {saveScoreMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              '💾 Save Score'
                            )}
                          </Button>
                        ) : (
                          <div className="flex space-x-2">
                            <Button 
                              className="flex-1 rounded-xl py-3 font-medium"
                              onClick={saveFinalScore}
                              disabled={saveScoreMutation.isPending || !playerName.trim()}
                              data-testid="button-confirm-save"
                            >
                              {saveScoreMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Saving...
                                </>
                              ) : (
                                'Save'
                              )}
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 rounded-xl py-3 font-medium"
                              onClick={() => {
                                setPlayerName("");
                                setShowNameInput(false);
                              }}
                              disabled={saveScoreMutation.isPending}
                              data-testid="button-cancel-save"
                            >
                              Skip
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                    
                    <Button 
                      variant={scoreSaved ? "default" : "secondary"}
                      className="w-full rounded-xl py-3 font-medium"
                      onClick={restartGame}
                      data-testid="play-again-button"
                    >
                      🎮 Play Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

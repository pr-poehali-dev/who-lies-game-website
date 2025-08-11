import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Icon from '@/components/ui/icon';

type GamePhase = 'auth' | 'lobby' | 'question' | 'answers' | 'voting' | 'results';

interface Player {
  id: string;
  name: string;
  avatar: number;
  isReady: boolean;
  isHost: boolean;
  isLiar: boolean;
  answer?: string;
  votes?: number;
}

interface GameQuestion {
  question: string;
  liarHint: string;
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 
  'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
];

const MOCK_QUESTIONS: GameQuestion[] = [
  {
    question: "Кто по твоему самый сексуальный вымышленный персонаж?",
    liarHint: "Вымышленный персонаж"
  },
  {
    question: "Со скольки лет человек должен платить налоги?",
    liarHint: "Любое число от 1 до 100"
  },
  {
    question: "Самый коварный персонаж в истории кино?",
    liarHint: "Любой персонаж из фильма"
  }
];

const MOCK_ANSWERS = [
  "Шрек", "Эльза из Холодного сердца", "Бэтмен", "Гермиона Грейнджер", 
  "Дарт Вейдер", "Гендальф", "Том и Джерри"
];

export default function Index() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('auth');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [isLiar, setIsLiar] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState<string[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<string[]>([]);
  const [gameResults, setGameResults] = useState<any>(null);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && gamePhase === 'question') {
      setGamePhase('answers');
      setCurrentAnswers([...MOCK_ANSWERS.slice(0, 5), userAnswer].sort(() => Math.random() - 0.5));
    } else if (timer === 0 && gamePhase === 'voting') {
      setGamePhase('results');
      setGameResults({
        liarFound: Math.random() > 0.5,
        liar: players.find(p => p.isLiar)?.name || 'Неизвестный',
        votes: selectedVotes.length
      });
    }
  }, [timer, gamePhase, userAnswer, players, selectedVotes]);

  const nextAvatar = () => {
    setSelectedAvatar((prev) => (prev + 1) % AVATAR_COLORS.length);
  };

  const joinGame = () => {
    if (!playerName || !roomCode) return;
    
    const mockPlayers: Player[] = [
      { id: '1', name: playerName, avatar: selectedAvatar, isReady: false, isHost: true, isLiar: false },
      { id: '2', name: 'Алиса', avatar: 1, isReady: true, isHost: false, isLiar: false },
      { id: '3', name: 'Боб', avatar: 2, isReady: false, isHost: false, isLiar: true },
      { id: '4', name: 'Кэрол', avatar: 3, isReady: true, isHost: false, isLiar: false },
      { id: '5', name: 'Дэвид', avatar: 4, isReady: true, isHost: false, isLiar: false },
    ];
    
    setPlayers(mockPlayers);
    setGamePhase('lobby');
  };

  const togglePlayerReady = (playerId: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, isReady: !p.isReady } : p
    ));
  };

  const startGame = () => {
    setCurrentQuestion(MOCK_QUESTIONS[0]);
    setIsLiar(Math.random() < 0.2);
    setTimer(45);
    setGamePhase('question');
  };

  const submitAnswer = () => {
    if (!userAnswer) return;
    setTimer(30);
    setGamePhase('voting');
  };

  const vote = (playerId: string) => {
    if (selectedVotes.includes(playerId)) {
      setSelectedVotes(selectedVotes.filter(id => id !== playerId));
    } else {
      setSelectedVotes([...selectedVotes, playerId]);
    }
  };

  const submitVotes = () => {
    setTimer(5);
  };

  if (gamePhase === 'auth') {
    return (
      <div className="min-h-screen bg-game-darker flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-game-accent rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <h1 className="text-4xl font-bold text-game-text">
              Кто врёт?
            </h1>
            <p className="text-game-muted text-lg">Игра на ложь, смех и интуицию</p>
          </div>

          <Card className="glass-card animate-scale-in">
            <CardHeader className="text-center border-b border-game-border">
              <CardTitle className="text-game-text">Присоединиться к игре</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <label className="text-sm font-medium text-game-muted mb-3 block">
                  Выбери аватар
                </label>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full ${AVATAR_COLORS[selectedAvatar]} flex items-center justify-center text-white font-bold text-xl`}>
                    {selectedAvatar + 1}
                  </div>
                  <Button 
                    onClick={nextAvatar}
                    variant="outline" 
                    size="sm"
                    className="border-game-border text-game-muted hover:text-game-text hover:border-game-accent"
                  >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Сменить
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Твой никнейм"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="glass-input text-game-text placeholder:text-game-muted border-none"
                />
                <Input
                  placeholder="Код комнаты"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="glass-input text-game-text placeholder:text-game-muted border-none"
                />
              </div>

              <Button
                onClick={joinGame}
                disabled={!playerName || !roomCode}
                className="w-full bg-game-accent hover:bg-game-accent/80 text-white font-semibold py-3 transition-all duration-200"
              >
                <Icon name="Users" className="mr-2" size={20} />
                Подключиться
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gamePhase === 'lobby') {
    return (
      <div className="min-h-screen bg-game-darker p-4">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-game-text">Лобби</h2>
            <p className="text-game-muted">
              Код комнаты: <span className="font-mono bg-game-card px-2 py-1 rounded text-game-accent">{roomCode}</span>
            </p>
          </div>

          <Card className="glass-card">
            <CardHeader className="border-b border-game-border">
              <CardTitle className="text-game-text">Игроки ({players.length}/8)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {players.map((player, idx) => (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between p-3 rounded-lg bg-game-card/50 border border-game-border/30 animate-scale-in delay-${idx * 100}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[player.avatar]} flex items-center justify-center text-white font-bold`}>
                        {player.avatar + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-game-text font-medium">{player.name}</span>
                          {player.isHost && (
                            <Badge variant="secondary" className="bg-game-accent/20 text-game-accent border-game-accent/30">
                              <Icon name="Crown" size={10} className="mr-1" />
                              Хост
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={player.isReady ? "default" : "outline"}
                        className={player.isReady 
                          ? "bg-green-500/20 text-green-400 border-green-500/30" 
                          : "border-game-border text-game-muted"
                        }
                      >
                        {player.isReady ? (
                          <><Icon name="Check" size={12} className="mr-1" />Готов</>
                        ) : (
                          <><Icon name="Clock" size={12} className="mr-1" />Не готов</>
                        )}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePlayerReady(player.id)}
                        className="text-game-muted hover:text-game-text"
                      >
                        <Icon name="MoreHorizontal" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => togglePlayerReady('1')}
              variant="outline"
              className="border-game-border text-game-muted hover:text-game-text hover:border-game-accent"
            >
              <Icon name={players[0]?.isReady ? "X" : "Check"} className="mr-2" size={16} />
              {players[0]?.isReady ? 'Не готов' : 'Готов'}
            </Button>
            
            {players[0]?.isHost && (
              <Button
                onClick={startGame}
                disabled={!players.every(p => p.isReady)}
                className="bg-game-accent hover:bg-game-accent/80 text-white font-semibold transition-all duration-200"
              >
                <Icon name="Play" className="mr-2" size={16} />
                Начать игру
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'question') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-game-dark via-purple-900 to-indigo-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl glass-dark border-game-accent/20 animate-scale-in">
          <CardHeader className="text-center space-y-4 border-b border-game-border">
            <div className="flex items-center justify-center gap-2 text-game-muted">
              <Icon name="Timer" size={20} />
              <span className="text-2xl font-bold text-game-text">{timer}с</span>
            </div>
            <Progress value={(45 - timer) / 45 * 100} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="text-center space-y-4">
              <Badge className={`px-4 py-2 text-lg ${
                isLiar 
                  ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                  : 'bg-game-accent/20 text-game-accent border-game-accent/30'
              }`}>
                {isLiar ? '🎭 Ты лжец!' : '🤔 Ты знаешь вопрос'}
              </Badge>
              
              <div className="p-6 rounded-lg bg-game-card/30 border border-game-border">
                <h3 className="text-xl font-bold text-game-text mb-4">
                  {isLiar ? 'Твоя подсказка:' : 'Вопрос:'}
                </h3>
                <p className="text-lg text-game-muted">
                  {isLiar ? currentQuestion?.liarHint : currentQuestion?.question}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                placeholder={isLiar ? "Придумай правдоподобный ответ..." : "Твой честный ответ..."}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="glass-input text-game-text placeholder:text-game-muted text-lg p-4 border-none"
              />
              
              <Button
                onClick={submitAnswer}
                disabled={!userAnswer}
                className="w-full bg-game-accent hover:bg-game-accent/80 text-white font-semibold py-3 transition-all duration-200"
              >
                <Icon name="Send" className="mr-2" size={16} />
                Отправить ответ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gamePhase === 'answers') {
    return (
      <div className="min-h-screen bg-game-darker p-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-game-text">Все ответы получены!</h2>
            <p className="text-game-muted">Время обсуждения: 30 секунд</p>
            <div className="p-4 rounded-lg bg-game-card/30 border border-game-border">
              <p className="text-lg text-game-text font-semibold">{currentQuestion?.question}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentAnswers.map((answer, idx) => (
              <Card key={idx} className={`glass-card animate-scale-in delay-${idx * 100}`}>
                <CardContent className="p-4 text-center">
                  <p className="text-game-text text-lg">{answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => setGamePhase('voting')}
              className="bg-game-accent hover:bg-game-accent/80 text-white font-semibold px-8 py-3 transition-all duration-200"
            >
              <Icon name="Vote" className="mr-2" size={16} />
              Перейти к голосованию
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'voting') {
    return (
      <div className="min-h-screen bg-game-darker p-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-game-text">Время голосовать!</h2>
            <p className="text-game-muted">Выбери того, кто по твоему мнению лжец</p>
            {timer > 0 && (
              <div className="flex items-center justify-center gap-2">
                <Icon name="Timer" size={20} className="text-game-muted" />
                <span className="text-2xl font-bold text-game-text">{timer}с</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player, idx) => (
              <Card 
                key={player.id} 
                className={`glass-card cursor-pointer transition-all duration-200 hover:border-game-accent animate-scale-in delay-${idx * 100} ${
                  selectedVotes.includes(player.id) ? 'ring-2 ring-game-accent bg-game-accent/10' : ''
                }`}
                onClick={() => vote(player.id)}
              >
                <CardContent className="p-4 text-center space-y-3">
                  <div className={`w-12 h-12 mx-auto rounded-full ${AVATAR_COLORS[player.avatar]} flex items-center justify-center text-white font-bold`}>
                    {player.avatar + 1}
                  </div>
                  <h3 className="text-game-text font-semibold">{player.name}</h3>
                  {selectedVotes.includes(player.id) && (
                    <Badge className="bg-game-accent/20 text-game-accent border-game-accent/30">
                      <Icon name="Check" size={12} className="mr-1" />
                      Выбран
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={submitVotes}
              disabled={selectedVotes.length === 0}
              className="bg-game-accent hover:bg-game-accent/80 text-white font-semibold px-8 py-3 transition-all duration-200"
            >
              <Icon name="Send" className="mr-2" size={16} />
              Подтвердить голос ({selectedVotes.length})
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'results') {
    return (
      <div className="min-h-screen bg-game-darker p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl glass-card animate-scale-in">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-6xl mb-4">
              {gameResults?.liarFound ? '🎉' : '😈'}
            </div>
            
            <h2 className="text-3xl font-bold text-game-text">
              {gameResults?.liarFound ? 'Лжец найден!' : 'Лжец остался незамеченным!'}
            </h2>
            
            <div className="p-4 rounded-lg bg-game-card/30 border border-game-border">
              <p className="text-game-muted mb-2">Лжецом был:</p>
              <p className="text-2xl font-bold text-game-accent">{gameResults?.liar}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-game-muted">Голосов получено</p>
                <p className="text-2xl font-bold text-game-text">{gameResults?.votes}</p>
              </div>
              <div>
                <p className="text-game-muted">Игроков всего</p>
                <p className="text-2xl font-bold text-game-text">{players.length}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-game-accent hover:bg-game-accent/80 text-white font-semibold px-6 py-3 transition-all duration-200"
              >
                <Icon name="RotateCcw" className="mr-2" size={16} />
                Играть снова
              </Button>
              
              <Button
                onClick={() => setGamePhase('auth')}
                variant="outline"
                className="border-game-border text-game-muted hover:text-game-text hover:border-game-accent px-6 py-3"
              >
                <Icon name="Home" className="mr-2" size={16} />
                В главное меню
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
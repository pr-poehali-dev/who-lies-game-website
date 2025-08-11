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
  avatar: string;
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

const AVATARS = [
  '🧙‍♂️', '⚔️', '🧝‍♀️', '🏹', '🛡️', '🔮', '🗡️', '🏰'
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
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
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

  const joinGame = () => {
    if (!playerName || !roomCode) return;
    
    const mockPlayers: Player[] = [
      { id: '1', name: playerName, avatar: selectedAvatar, isReady: false, isHost: true, isLiar: false },
      { id: '2', name: 'Алиса', avatar: '🧝‍♀️', isReady: true, isHost: false, isLiar: false },
      { id: '3', name: 'Боб', avatar: '⚔️', isReady: false, isHost: false, isLiar: true },
      { id: '4', name: 'Кэрол', avatar: '🏹', isReady: true, isHost: false, isLiar: false },
      { id: '5', name: 'Дэвид', avatar: '🛡️', isReady: true, isHost: false, isLiar: false },
    ];
    
    setPlayers(mockPlayers);
    setGamePhase('lobby');
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
      <div className="min-h-screen bg-gradient-to-br from-game-dark via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-game-primary to-game-accent bg-clip-text text-transparent">
              Кто врёт?
            </h1>
            <p className="text-gray-300 text-lg">Игра на ложь, смех и интуицию</p>
          </div>

          <Card className="glass-dark border-game-accent/20 animate-scale-in">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Присоединиться к игре</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Выбери аватар
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-12 h-12 rounded-xl text-2xl transition-all duration-200 ${
                        selectedAvatar === avatar
                          ? 'bg-game-primary scale-110 animate-pulse-glow'
                          : 'glass hover:scale-105'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Твой никнейм"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-black/20 border-white/20 text-white placeholder:text-gray-400"
                />
                <Input
                  placeholder="Код комнаты"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="bg-black/20 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <Button
                onClick={joinGame}
                disabled={!playerName || !roomCode}
                className="w-full bg-gradient-to-r from-game-primary to-game-accent hover:scale-105 transition-all duration-200 text-white font-semibold py-3"
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
      <div className="min-h-screen bg-gradient-to-br from-game-dark via-purple-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Лобби</h2>
            <p className="text-gray-300">Код комнаты: <span className="font-mono bg-black/20 px-2 py-1 rounded">{roomCode}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player, idx) => (
              <Card key={player.id} className={`glass-dark animate-scale-in border-game-accent/20 ${
                idx === 0 ? 'delay-0' : `delay-${idx * 100}`
              }`}>
                <CardContent className="p-4 text-center space-y-3">
                  <div className="text-4xl">{player.avatar}</div>
                  <div>
                    <h3 className="text-white font-semibold flex items-center justify-center gap-2">
                      {player.name}
                      {player.isHost && (
                        <Badge variant="secondary" className="bg-game-accent/20 text-game-accent">
                          <Icon name="Crown" size={12} className="mr-1" />
                          Хост
                        </Badge>
                      )}
                    </h3>
                    <Badge
                      variant={player.isReady ? "default" : "outline"}
                      className={player.isReady 
                        ? "bg-green-500/20 text-green-400 border-green-500/20" 
                        : "border-gray-500/20 text-gray-400"
                      }
                    >
                      {player.isReady ? (
                        <><Icon name="Check" size={12} className="mr-1" />Готов</>
                      ) : (
                        <><Icon name="Clock" size={12} className="mr-1" />Не готов</>
                      )}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setPlayers(prev => prev.map((p, i) => i === 0 ? {...p, isReady: !p.isReady} : p))}
              variant="outline"
              className="bg-black/20 border-white/20 text-white hover:bg-white/10"
            >
              <Icon name={players[0]?.isReady ? "X" : "Check"} className="mr-2" size={16} />
              {players[0]?.isReady ? 'Не готов' : 'Готов'}
            </Button>
            
            {players[0]?.isHost && (
              <Button
                onClick={startGame}
                disabled={!players.every(p => p.isReady)}
                className="bg-gradient-to-r from-game-primary to-game-accent hover:scale-105 transition-all duration-200 text-white font-semibold"
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
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <Icon name="Timer" size={20} />
              <span className="text-2xl font-bold text-white">{timer}с</span>
            </div>
            <Progress value={(45 - timer) / 45 * 100} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <Badge className={`px-4 py-2 text-lg ${
                isLiar 
                  ? 'bg-red-500/20 text-red-400 border-red-500/20' 
                  : 'bg-game-primary/20 text-game-primary border-game-primary/20'
              }`}>
                {isLiar ? '🎭 Ты лжец!' : '🤔 Ты знаешь вопрос'}
              </Badge>
              
              <div className="p-6 rounded-lg bg-black/30 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {isLiar ? 'Твоя подсказка:' : 'Вопрос:'}
                </h3>
                <p className="text-xl text-gray-300">
                  {isLiar ? currentQuestion?.liarHint : currentQuestion?.question}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                placeholder={isLiar ? "Придумай правдоподобный ответ..." : "Твой честный ответ..."}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="bg-black/20 border-white/20 text-white placeholder:text-gray-400 text-lg p-4"
              />
              
              <Button
                onClick={submitAnswer}
                disabled={!userAnswer}
                className="w-full bg-gradient-to-r from-game-primary to-game-accent hover:scale-105 transition-all duration-200 text-white font-semibold py-3"
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
      <div className="min-h-screen bg-gradient-to-br from-game-dark via-purple-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">Все ответы получены!</h2>
            <p className="text-gray-300">Время обсуждения: 30 секунд</p>
            <div className="p-4 rounded-lg bg-black/30 border border-white/10">
              <p className="text-lg text-white font-semibold">{currentQuestion?.question}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentAnswers.map((answer, idx) => (
              <Card key={idx} className={`glass-dark border-game-accent/20 animate-scale-in delay-${idx * 100}`}>
                <CardContent className="p-4 text-center">
                  <p className="text-white text-lg">{answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => setGamePhase('voting')}
              className="bg-gradient-to-r from-game-primary to-game-accent hover:scale-105 transition-all duration-200 text-white font-semibold px-8 py-3"
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
      <div className="min-h-screen bg-gradient-to-br from-game-dark via-purple-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">Время голосовать!</h2>
            <p className="text-gray-300">Выбери того, кто по твоему мнению лжец</p>
            {timer > 0 && (
              <div className="flex items-center justify-center gap-2">
                <Icon name="Timer" size={20} className="text-gray-300" />
                <span className="text-2xl font-bold text-white">{timer}с</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player, idx) => (
              <Card 
                key={player.id} 
                className={`glass-dark border-game-accent/20 cursor-pointer transition-all duration-200 hover:scale-105 animate-scale-in delay-${idx * 100} ${
                  selectedVotes.includes(player.id) ? 'ring-2 ring-game-primary bg-game-primary/10' : ''
                }`}
                onClick={() => vote(player.id)}
              >
                <CardContent className="p-4 text-center space-y-3">
                  <div className="text-4xl">{player.avatar}</div>
                  <h3 className="text-white font-semibold">{player.name}</h3>
                  {selectedVotes.includes(player.id) && (
                    <Badge className="bg-game-primary/20 text-game-primary border-game-primary/20">
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
              className="bg-gradient-to-r from-game-primary to-game-accent hover:scale-105 transition-all duration-200 text-white font-semibold px-8 py-3"
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
      <div className="min-h-screen bg-gradient-to-br from-game-dark via-purple-900 to-indigo-900 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl glass-dark border-game-accent/20 animate-scale-in">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-6xl mb-4">
              {gameResults?.liarFound ? '🎉' : '😈'}
            </div>
            
            <h2 className="text-3xl font-bold text-white">
              {gameResults?.liarFound ? 'Лжец найден!' : 'Лжец остался незамеченным!'}
            </h2>
            
            <div className="p-4 rounded-lg bg-black/30 border border-white/10">
              <p className="text-gray-300 mb-2">Лжецом был:</p>
              <p className="text-2xl font-bold text-game-accent">{gameResults?.liar}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-gray-300">Голосов получено</p>
                <p className="text-2xl font-bold text-white">{gameResults?.votes}</p>
              </div>
              <div>
                <p className="text-gray-300">Игроков всего</p>
                <p className="text-2xl font-bold text-white">{players.length}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-game-primary to-game-accent hover:scale-105 transition-all duration-200 text-white font-semibold px-6 py-3"
              >
                <Icon name="RotateCcw" className="mr-2" size={16} />
                Играть снова
              </Button>
              
              <Button
                onClick={() => setGamePhase('auth')}
                variant="outline"
                className="bg-black/20 border-white/20 text-white hover:bg-white/10 px-6 py-3"
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
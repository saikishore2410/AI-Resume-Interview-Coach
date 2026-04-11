import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, RotateCcw, Play, Pause } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('snake-high-score')) || 0);
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(150);

  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const generateFood = (currentSnake: { x: number, y: number }[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  };

  const update = () => {
    if (isGameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setIsGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snake-high-score', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        setSpeed(prev => Math.max(prev - 2, 50));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const cellSize = ctx.canvas.width / GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw grid lines (subtle)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, ctx.canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(ctx.canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.fillStyle = isHead ? '#10b981' : '#34d399';
      
      // Rounded rectangle for snake segments
      const x = segment.x * cellSize + 1;
      const y = segment.y * cellSize + 1;
      const size = cellSize - 2;
      const radius = isHead ? 6 : 4;

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, radius);
      ctx.fill();

      // Eyes for the head
      if (isHead) {
        ctx.fillStyle = 'white';
        const eyeSize = cellSize / 6;
        const eyeOffset = cellSize / 4;
        
        // Left eye
        ctx.beginPath();
        ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(x + size - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  const animate = (time: number) => {
    if (time - lastUpdateTimeRef.current > speed) {
      update();
      lastUpdateTimeRef.current = time;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) draw(ctx);

    gameLoopRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(animate);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [snake, food, isGameOver, isPaused, speed]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood({ x: 5, y: 5 });
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setSpeed(150);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Break Room</h2>
        <p className="text-muted-foreground">Take a quick break and play some Snake!</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Score</div>
            <div className="text-2xl font-bold text-primary">{score}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">High Score</div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <div className="text-2xl font-bold">{highScore}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative aspect-square w-full max-w-[500px] mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full h-full block"
        />

        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
            <div className="text-white text-3xl font-bold">Paused</div>
            <Button size="lg" className="gap-2" onClick={() => setIsPaused(false)}>
              <Play className="w-5 h-5" /> Resume Game
            </Button>
            <p className="text-slate-300 text-sm">Use arrow keys to move, Space to pause</p>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
              <div className="text-red-500 text-4xl font-black uppercase tracking-tighter">Game Over</div>
              <div className="text-white text-xl">Final Score: {score}</div>
            </div>
            <Button size="lg" className="gap-2" onClick={resetGame}>
              <RotateCcw className="w-5 h-5" /> Try Again
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" className="gap-2" onClick={() => setIsPaused(prev => !prev)}>
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button variant="ghost" size="lg" className="gap-2" onClick={resetGame}>
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Controls</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-slate-200 rounded text-slate-700 font-mono">↑↓←→</kbd>
            <span>Move Snake</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-slate-200 rounded text-slate-700 font-mono">Space</kbd>
            <span>Pause / Resume</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

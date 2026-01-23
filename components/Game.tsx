import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Share2, Trophy, HelpCircle, X, Gamepad2, Download, Zap, Gauge, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- Types ---

type GameMode = 'menu' | 'rush' | 'racer';

interface LeaderboardEntry {
    username: string;
    score: number;
    created_at: string;
}

interface UserProfile {
    id: string;
    username: string;
}

// --- Data Services ---

// Get local high score for offline fallback / instant feedback
const getLocalHighScore = (game: string) => {
    return parseInt(localStorage.getItem(`bana_highscore_${game}`) || '0');
};

// --- Sub-Components ---

const InstructionModal: React.FC<{ onClose: () => void; title: string; instructions: string[] }> = ({ onClose, title, instructions }) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
        <div className="bg-bana-dark border border-bana-yellow/30 p-8 rounded-3xl max-w-md w-full relative shadow-[0_0_50px_rgba(243,186,47,0.2)]">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
            <h3 className="font-display text-3xl text-bana-yellow mb-6">{title}</h3>
            <ul className="space-y-4 text-gray-300 font-sans text-lg">
                {instructions.map((inst, i) => (
                    <li key={i} className="flex gap-3">
                        <span className="text-bana-yellow font-bold">{i + 1}.</span>
                        {inst}
                    </li>
                ))}
            </ul>
            <button onClick={onClose} className="w-full mt-8 py-3 bg-white/10 hover:bg-bana-yellow hover:text-bana-dark font-bold rounded-xl transition-all">
                GOT IT
            </button>
        </div>
    </motion.div>
);

const UsernameModal: React.FC<{ onSubmit: (profile: UserProfile) => void; onClose: () => void }> = ({ onSubmit, onClose }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError('');

        let formattedName = name.trim();
        if (!formattedName.startsWith('@')) formattedName = '@' + formattedName;

        try {
            // Check if user exists
            const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('id, username')
                .eq('username', formattedName)
                .single();

            if (existingUser) {
                // User exists, log them in locally
                localStorage.setItem('bana_user_id', existingUser.id);
                localStorage.setItem('bana_username', existingUser.username);
                onSubmit(existingUser);
            } else {
                // Create new user
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([{ username: formattedName }])
                    .select('id, username')
                    .single();

                if (createError) throw createError;

                if (newUser) {
                    localStorage.setItem('bana_user_id', newUser.id);
                    localStorage.setItem('bana_username', newUser.username);
                    onSubmit(newUser);
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-bana-dark border border-bana-yellow/30 p-8 rounded-3xl max-w-md w-full relative shadow-[0_0_50px_rgba(243,186,47,0.2)]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                <h3 className="font-display text-3xl text-bana-yellow mb-2">IDENTIFY YOURSELF</h3>
                <p className="text-gray-400 mb-6">Enter your Telegram handle to sync your high scores globally.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="@username"
                        disabled={loading}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-bana-yellow outline-none transition-colors mb-2 text-lg disabled:opacity-50"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-bana-yellow text-bana-dark font-bold rounded-xl hover:scale-105 transition-all text-lg flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'CONTINUE'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ScoreBoard: React.FC<{ score: number; highScore: number; onReset: () => void; label?: string }> = ({ score, highScore, onReset, label = "Score" }) => (
    <div className="absolute top-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-[150px] shadow-lg">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{label}</span>
                <span className="text-2xl font-bold text-white font-mono">{score}</span>
            </div>
            <div className="w-full h-[1px] bg-white/10 my-1" />
            <div className="flex justify-between items-center">
                <span className="text-xs text-bana-yellow uppercase font-bold tracking-wider">Best</span>
                <span className="text-lg font-bold text-bana-yellow font-mono">{highScore}</span>
            </div>
        </div>
    </div>
);

// --- BANA RUSH GAME ---

const BanaRush: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
    const [showInstructions, setShowInstructions] = useState(false);
    const [score, setScore] = useState(0);
    const [displayScore, setDisplayScore] = useState(0);
    const [highScore, setHighScore] = useState(() => getLocalHighScore('rush'));
    const scoreRef = useRef(0);
    const isSavedRef = useRef(false);
    const PLAYER_SIZE = 50;

    const handleGameOver = useCallback(async () => {
        if (isSavedRef.current) return;
        isSavedRef.current = true;

        setGameState('gameover');
        const finalScore = scoreRef.current;
        setScore(finalScore);

        // Update Local
        if (finalScore > highScore) {
            localStorage.setItem('bana_highscore_rush', finalScore.toString());
            setHighScore(finalScore);
        }

        // Upload to Supabase
        const userId = localStorage.getItem('bana_user_id');
        if (userId) {
            await supabase.from('scores').insert({
                user_id: userId,
                game_mode: 'rush',
                score: finalScore
            });
        }
    }, [highScore]);

    const handleResetScore = () => {
        localStorage.removeItem('bana_highscore_rush');
        setHighScore(0);
    };

    const startGame = () => {
        isSavedRef.current = false;
        setGameState('playing');
        setScore(0);
        setDisplayScore(0);
        scoreRef.current = 0;
    };

    useEffect(() => {
        if (gameState !== 'playing' || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let playerX = canvas.width / 2;
        let items: any[] = [];
        let particles: any[] = [];
        let stars: any[] = [];
        for (let i = 0; i < 100; i++) stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2, speed: Math.random() * 3 + 0.5 });
        let frameId: number;
        let lastSpawn = 0;
        let spawnRate = 60;
        let speedMultiplier = 1;
        let gameActive = true;
        const handleInput = (x: number) => { playerX = x; };
        const mouseMove = (e: MouseEvent) => handleInput(e.clientX);
        const touchMove = (e: TouchEvent) => handleInput(e.touches[0].clientX);
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('touchmove', touchMove);
        const gameLoop = (timestamp: number) => {
            if (!gameActive) return;
            ctx.fillStyle = '#0B0E11';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFFFFF';
            stars.forEach(star => { star.y += star.speed * (speedMultiplier * 0.5); if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; } ctx.globalAlpha = Math.random() * 0.5 + 0.3; ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill(); });
            ctx.globalAlpha = 1;
            if (timestamp - lastSpawn > (1000 / (60 / spawnRate))) { const typeRoll = Math.random(); let type = 'banana'; if (typeRoll > 0.95) type = 'gem'; else if (typeRoll > 0.8) type = 'candle'; else if (typeRoll > 0.75) type = 'rug'; items.push({ x: Math.random() * (canvas.width - 40) + 20, y: -50, type, speed: (Math.random() * 3 + 3) * speedMultiplier, rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.1 }); lastSpawn = timestamp; if (spawnRate > 15) spawnRate -= 0.05; speedMultiplier += 0.0001; }
            const playerY = canvas.height - 100;
            items.forEach((item, index) => { item.y += item.speed; item.rot += item.rotSpeed; ctx.save(); ctx.translate(item.x, item.y); ctx.rotate(item.rot); ctx.font = '32px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; let emoji = '🍌'; if (item.type === 'gem') emoji = '💎'; if (item.type === 'candle') emoji = '📉'; if (item.type === 'rug') emoji = '🧶'; ctx.fillText(emoji, 0, 0); ctx.restore(); const dist = Math.sqrt(Math.pow(item.x - playerX, 2) + Math.pow(item.y - playerY, 2)); if (dist < PLAYER_SIZE) { if (item.type === 'banana') { scoreRef.current += 10; for (let i = 0; i < 5; i++) particles.push({ x: item.x, y: item.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 1, color: '#F3BA2F' }); } else if (item.type === 'gem') { scoreRef.current += 50; for (let i = 0; i < 8; i++) particles.push({ x: item.x, y: item.y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1, color: '#9945FF' }); } else { gameActive = false; handleGameOver(); } items.splice(index, 1); } else if (item.y > canvas.height) { items.splice(index, 1); } });
            particles.forEach((p, i) => { p.x += p.vx; p.y += p.vy; p.life -= 0.03; if (p.life <= 0) { particles.splice(i, 1); return; } ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); const radius = Math.max(0, 4 * p.life); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill(); });
            ctx.globalAlpha = 1;
            ctx.font = '50px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🐵', playerX, playerY); ctx.shadowBlur = 20; ctx.shadowColor = '#F3BA2F'; ctx.beginPath(); ctx.arc(playerX, playerY + 25, 30, 0, Math.PI, false); ctx.lineWidth = 3; ctx.strokeStyle = '#F3BA2F'; ctx.stroke(); ctx.shadowBlur = 0;
            if (gameActive) frameId = requestAnimationFrame(gameLoop);
            if (frameId % 2 === 0) setDisplayScore(scoreRef.current);
        };
        frameId = requestAnimationFrame(gameLoop);
        return () => { cancelAnimationFrame(frameId); window.removeEventListener('mousemove', mouseMove); window.removeEventListener('touchmove', touchMove); };
    }, [gameState, handleGameOver]);

    return (
        <div className="fixed inset-0 bg-bana-dark z-50 overflow-hidden">
            <canvas ref={canvasRef} className="block w-full h-full" />
            <div className="absolute top-4 left-4 z-50"><button onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all"><ArrowLeft size={24} /></button></div>
            <div className="absolute bottom-8 right-8 z-50 pointer-events-auto cursor-pointer"><button onClick={() => setShowInstructions(true)} className="bg-bana-yellow text-bana-dark p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><HelpCircle size={28} /></button></div>
            <ScoreBoard score={gameState === 'playing' ? displayScore : score} highScore={highScore} onReset={handleResetScore} />
            <AnimatePresence>
                {gameState === 'start' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40">
                        <div className="text-center">
                            <h1 className="font-display text-8xl text-bana-yellow drop-shadow-[0_0_20px_rgba(243,186,47,0.5)] mb-2">BANA RUSH</h1>
                            <p className="text-gray-300 text-xl mb-8">Catch the Bananas. Avoid the Rugs.</p>
                            <button onClick={startGame} className="bg-bana-yellow text-bana-dark font-black text-2xl px-12 py-4 rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(243,186,47,0.6)] transition-all">PLAY NOW</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>{gameState === 'gameover' && <GameOverScreen score={score} highScore={highScore} onRestart={startGame} onBack={onBack} gameName="Bana Rush" />}</AnimatePresence>
            <AnimatePresence>{showInstructions && (<InstructionModal title="HOW TO PLAY" instructions={["Move your mouse or drag to control the Ape.", "Catch Bananas (🍌) for 10 points.", "Catch Gems (💎) for 50 points.", "Avoid Candles (📉) and Rugs (🧶) or it's GAME OVER!", "Survive as long as you can to beat the high score."]} onClose={() => setShowInstructions(false)} />)}</AnimatePresence>
        </div>
    );
};

// --- BANA RACER GAME ---

const BanaRacer: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
    const [showInstructions, setShowInstructions] = useState(false);
    const [score, setScore] = useState(0);
    const [displayScore, setDisplayScore] = useState(0);
    const [speedDisplay, setSpeedDisplay] = useState(0);
    const [highScore, setHighScore] = useState(getLocalHighScore('racer'));
    const scoreRef = useRef(0);
    const isSavedRef = useRef(false);

    const handleGameOver = useCallback(async (finalScore: number) => {
        if (isSavedRef.current) return;
        isSavedRef.current = true;

        setGameState('gameover');
        setScore(finalScore);

        // Update Local
        if (finalScore > highScore) {
            localStorage.setItem('bana_highscore_racer', finalScore.toString());
            setHighScore(finalScore);
        }

        // Upload to Supabase
        const userId = localStorage.getItem('bana_user_id');
        if (userId) {
            await supabase.from('scores').insert({
                user_id: userId,
                game_mode: 'racer',
                score: finalScore
            });
        }
    }, [highScore]);

    const startGame = () => {
        isSavedRef.current = false;
        setGameState('playing');
        setScore(0);
        setDisplayScore(0);
        scoreRef.current = 0;
    };

    useEffect(() => {
        if (gameState !== 'playing' || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const FPS = 60; const STEP = 1 / FPS; const ROAD_WIDTH = 2000; const SEGMENT_LENGTH = 200; const RUMBLE_LENGTH = 3; const FIELD_OF_VIEW = 100; const CAMERA_HEIGHT = 1000; const CAMERA_DEPTH = 1 / Math.tan((FIELD_OF_VIEW / 2) * Math.PI / 180); const DRAW_DISTANCE = 300; const MAX_SPEED = SEGMENT_LENGTH / STEP; const ACCEL = MAX_SPEED / 5; const BREAKING = -MAX_SPEED; const DECEL = -MAX_SPEED / 5; const OFF_ROAD_DECEL = -MAX_SPEED / 2; const OFF_ROAD_LIMIT = MAX_SPEED / 4;
        let width = window.innerWidth; let height = window.innerHeight; let position = 0; let speed = 0; let playerX = 0; let targetX = 0; const segments: any[] = []; let keyLeft = false; let keyRight = false; let keyFaster = true; let keySlower = false;

        const project = (p: any, cameraX: number, cameraY: number, cameraZ: number, cameraDepth: number, width: number, height: number, roadWidth: number) => { p.camera.x = (p.world.x || 0) - cameraX; p.camera.y = (p.world.y || 0) - cameraY; p.camera.z = (p.world.z || 0) - cameraZ; p.screen.scale = cameraDepth / p.camera.z; p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2)); p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2)); p.screen.w = Math.round((p.screen.scale * roadWidth * width / 2)); };
        const overlap = (x1: number, w1: number, x2: number, w2: number, percent: number) => { const half = (percent || 1) / 2; const min1 = x1 - (w1 * half); const max1 = x1 + (w1 * half); const min2 = x2 - (w2 * half); const max2 = x2 + (w2 * half); return !((max1 < min2) || (min1 > max2)); };
        let lastY = 0; const addSegment = (curve: number, y: number) => { const n = segments.length; segments.push({ index: n, p1: { world: { z: n * SEGMENT_LENGTH, y: lastY }, camera: {}, screen: {} }, p2: { world: { z: (n + 1) * SEGMENT_LENGTH, y: y }, camera: {}, screen: {} }, curve: curve, sprites: [], cars: [], color: Math.floor(n / RUMBLE_LENGTH) % 2 ? 'dark' : 'light' }); lastY = y; };
        const addStraight = (num: number = 25) => { for (let n = 0; n < num; n++) addSegment(0, lastY); }; const addCurve = (num: number = 25, curve: number = 2, height: number = 0) => { for (let n = 0; n < num; n++) addSegment(curve, lastY + height); }; const addHill = (num: number = 25, height: number = 20) => { for (let n = 0; n < num; n++) addSegment(0, lastY + (n / num) * height); };
        for (let i = 0; i < 500; i++) { const r = Math.random(); if (r < 0.3) addStraight(50); else if (r < 0.6) addCurve(50, (Math.random() * 4) - 2, (Math.random() * 40) - 20); else addHill(50, (Math.random() * 40) - 20); } const trackLength = segments.length * SEGMENT_LENGTH;

        // Sprite Generation Loop
        for (let i = 60; i < segments.length; i += Math.floor(Math.random() * 50) + 40) {
            const lane = (Math.random() * 2) - 1;
            const roll = Math.random();

            // Obstacles & Pickups
            if (roll > 0.8) {
                let type = 'rock';
                if (roll > 0.95) type = 'fuel';
                else if (roll > 0.9) type = 'banana';
                else if (roll > 0.85) type = 'gem';
                segments[i].sprites.push({ source: type, offset: lane });
            }

            // Decor: Billboards & Gates
            if (Math.random() > 0.8) {
                const side = Math.random() > 0.5 ? -1.8 : 1.8;
                segments[i].sprites.push({ source: 'billboard', offset: side });
            }
            if (Math.random() > 0.96) {
                segments[i].sprites.push({ source: 'gate', offset: 0 });
            }
        }

        const drawPolygon = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: string) => { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.closePath(); ctx.fill(); };

        const drawSprite = (sprite: any, scale: number, destX: number, destY: number, clipY: number) => {
            const w = 500 * scale * width / 2;
            const h = 500 * scale * width / 2;

            // Adjust sizing for special elements
            let spriteW = w;
            let spriteH = h;
            let drawYOffset = 0;

            if (sprite.source === 'billboard') {
                spriteW = w * 2.5;
                spriteH = h * 1.5;
                drawYOffset = -h;
            } else if (sprite.source === 'gate') {
                spriteW = w * 6; // Wide enough to span road
                spriteH = h * 4;
                drawYOffset = -h * 2;
            }

            let drawX = destX - spriteW / 2;
            let drawY = destY - spriteH + drawYOffset;

            // Simple clipping check
            if (clipY && (drawY + spriteH) > clipY) {
                const clipH = Math.max(0, (drawY + spriteH) - clipY);
                if (clipH >= spriteH) return;
            }

            ctx.save();
            ctx.translate(drawX + spriteW / 2, drawY + spriteH / 2);

            if (sprite.source === 'banana') {
                ctx.font = `${w * 0.5}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🍌', 0, 0);
            } else if (sprite.source === 'gem') {
                ctx.font = `${w * 0.5}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('💎', 0, 0);
            } else if (sprite.source === 'fuel') {
                const s = w * 0.4; ctx.fillStyle = '#F3BA2F'; ctx.shadowColor = '#F3BA2F'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.8, 0); ctx.lineTo(0, s); ctx.lineTo(-s * 0.8, 0); ctx.fill(); ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(0, -s * 0.3, s * 0.1, 0, Math.PI * 2); ctx.fill();
            } else if (sprite.source === 'rock') {
                const s = w * 0.5; ctx.fillStyle = '#E00030'; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = Math.max(2, 6 * scale); ctx.shadowColor = 'rgba(224, 0, 48, 0.4)'; ctx.shadowBlur = 15; ctx.beginPath(); const angle = Math.PI * 2 / 8; for (let k = 0; k < 8; k++) { const a = k * angle + (angle / 2); const ox = Math.cos(a) * (s / 2); const oy = Math.sin(a) * (s / 2) - (s / 2) + h / 2; if (k === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'white'; ctx.font = `900 ${s * 0.35}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('STOP', 0, -s / 2 + h / 2);
            } else if (sprite.source === 'billboard') {
                // Holographic Billboard
                ctx.shadowColor = '#F3BA2F';
                ctx.shadowBlur = 15;
                ctx.strokeStyle = '#F3BA2F';
                ctx.lineWidth = 2 * scale;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';

                // Panel
                ctx.beginPath();
                ctx.roundRect(-spriteW / 2, -spriteH / 2, spriteW, spriteH, 10 * scale);
                ctx.fill();
                ctx.stroke();

                // Grid effect inside
                ctx.strokeStyle = 'rgba(243, 186, 47, 0.2)';
                ctx.lineWidth = 1 * scale;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    ctx.moveTo(-spriteW / 2, -spriteH / 2 + (spriteH / 5) * i);
                    ctx.lineTo(spriteW / 2, -spriteH / 2 + (spriteH / 5) * i);
                }
                ctx.stroke();

                // Text
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FFF';
                ctx.font = `bold italic ${spriteH * 0.25}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('$BANA', 0, -spriteH * 0.1);
                ctx.fillStyle = '#F3BA2F';
                ctx.font = `bold ${spriteH * 0.15}px sans-serif`;
                ctx.fillText('TO THE MOON', 0, spriteH * 0.2);

            } else if (sprite.source === 'gate') {
                // Neon Gate
                const glow = '#9945FF';
                ctx.shadowColor = glow;
                ctx.shadowBlur = 30;
                ctx.strokeStyle = glow;
                ctx.lineWidth = 8 * scale;

                // Arch
                ctx.beginPath();
                ctx.moveTo(-spriteW / 3, spriteH / 2); // Left foot
                ctx.lineTo(-spriteW / 3, -spriteH / 4); // Left Up
                ctx.bezierCurveTo(-spriteW / 3, -spriteH / 1.5, spriteW / 3, -spriteH / 1.5, spriteW / 3, -spriteH / 4); // Top Arch
                ctx.lineTo(spriteW / 3, spriteH / 2); // Right foot
                ctx.stroke();

                // Energy Field
                const grad = ctx.createLinearGradient(0, -spriteH / 2, 0, spriteH / 2);
                grad.addColorStop(0, 'rgba(153, 69, 255, 0)');
                grad.addColorStop(0.5, 'rgba(153, 69, 255, 0.2)');
                grad.addColorStop(1, 'rgba(153, 69, 255, 0)');
                ctx.fillStyle = grad;
                ctx.fill();
            }

            ctx.restore();
        };

        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') keyLeft = true; if (e.key === 'ArrowRight') keyRight = true; if (e.key === 'ArrowUp') keyFaster = true; if (e.key === 'ArrowDown') keySlower = true; };
        const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') keyLeft = false; if (e.key === 'ArrowRight') keyRight = false; if (e.key === 'ArrowUp') keyFaster = true; if (e.key === 'ArrowDown') keySlower = false; };
        window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);

        const handleMouseMove = (e: MouseEvent) => {
            if (gameState !== 'playing') return;
            const x = (e.clientX / width) * 2 - 1;
            const sensitivity = 1.5;
            targetX = x * sensitivity;
        };
        window.addEventListener('mousemove', handleMouseMove);

        let frameId: number; let lastTime = performance.now(); let gdt = 0;

        const update = (dt: number) => {
            position = (position + speed * dt);
            while (position >= trackLength) position -= trackLength;
            while (position < 0) position += trackLength;

            // Steering input
            if (keyLeft) targetX = targetX - dt * 3;
            if (keyRight) targetX = targetX + dt * 3;
            targetX = Math.max(-1, Math.min(1, targetX));

            const ratio = speed / MAX_SPEED;

            // Speed logic
            if (keyFaster) speed = speed + ACCEL * dt;
            else if (keySlower) speed = speed + BREAKING * dt;
            else speed = speed + DECEL * dt;

            // Position updates
            const segmentIndex = Math.floor(position / SEGMENT_LENGTH) % segments.length;
            const playerSegment = segments[segmentIndex];
            const steerSpeed = 5 * ratio;

            playerX = playerX + (targetX - playerX) * (steerSpeed * dt);
            playerX = playerX - (dt * 1.5 * ratio * playerSegment.curve);

            // STRICT CLAMPING
            if (playerX < -1) playerX = -1;
            if (playerX > 1) playerX = 1;

            speed = Math.max(0, Math.min(MAX_SPEED, speed));
            scoreRef.current += Math.floor(speed * dt * 0.1);
            setSpeedDisplay(Math.floor(speed / 100));
            if (Math.random() > 0.9) setDisplayScore(scoreRef.current);

            // Collision detection
            for (let n = 0; n < playerSegment.sprites.length; n++) {
                const sprite = playerSegment.sprites[n];
                const spriteW = 0.3;
                // Ignore collisions with decor
                if (sprite.source === 'billboard' || sprite.source === 'gate') continue;

                if (overlap(playerX, 0.6, sprite.offset, spriteW, 1)) {
                    if (sprite.source !== 'rock') {
                        if (sprite.source === 'fuel') scoreRef.current += 1000;
                        if (sprite.source === 'banana') scoreRef.current += 500;
                        if (sprite.source === 'gem') scoreRef.current += 2500;
                        playerSegment.sprites.splice(n, 1);
                        n--;
                    } else {
                        speed = 0;
                        handleGameOver(scoreRef.current);
                    }
                }
            }
        };

        const render = () => {
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; width = canvas.width; height = canvas.height; }
            const baseIndex = Math.floor(position / SEGMENT_LENGTH) % segments.length;
            const baseSegment = segments[baseIndex];
            const basePercent = (position % SEGMENT_LENGTH) / SEGMENT_LENGTH;
            const playerY = (baseSegment.p1.world.y + (baseSegment.p2.world.y - baseSegment.p1.world.y) * basePercent);
            let maxy = height;
            let x = 0;
            let dx = -(baseSegment.curve * basePercent);

            // Background
            ctx.fillStyle = '#0B0E11';
            ctx.fillRect(0, 0, width, height);
            const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
            skyGrad.addColorStop(0, '#020205');
            skyGrad.addColorStop(1, '#2c1e4a');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, width, height);

            // Stars
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 50; i++) {
                const sx = (i * 137.5) % width;
                const sy = (i * 91.3) % (height / 2);
                ctx.fillRect(sx, sy, 1, 1);
            }

            // Road Rendering
            for (let n = 0; n < DRAW_DISTANCE; n++) {
                const segment = segments[(baseIndex + n) % segments.length];
                const loopZ = (baseIndex + n) >= segments.length ? trackLength : 0;
                project(segment.p1, (playerX * ROAD_WIDTH) - x, playerY + CAMERA_HEIGHT, position - loopZ, CAMERA_DEPTH, width, height, ROAD_WIDTH);
                project(segment.p2, (playerX * ROAD_WIDTH) - x - dx, playerY + CAMERA_HEIGHT, position - loopZ, CAMERA_DEPTH, width, height, ROAD_WIDTH);
                x = x + dx;
                dx = dx + segment.curve;
                if ((segment.p1.camera.z <= CAMERA_DEPTH) || (segment.p2.screen.y >= maxy) || (segment.p2.screen.y >= segment.p1.screen.y)) continue;
                const grassColor = segment.color === 'dark' ? '#100020' : '#15002a';
                const rumbleColor = segment.color === 'dark' ? '#5500aa' : '#F3BA2F';
                const roadColor = segment.color === 'dark' ? '#0a0a0a' : '#0e0e0e';
                drawPolygon(0, segment.p1.screen.y, width, segment.p1.screen.y, width, segment.p2.screen.y, 0, segment.p2.screen.y, grassColor);
                const r1 = segment.p1.screen.w / 6;
                const r2 = segment.p2.screen.w / 6;
                drawPolygon(segment.p1.screen.x - segment.p1.screen.w - r1, segment.p1.screen.y, segment.p1.screen.x - segment.p1.screen.w, segment.p1.screen.y, segment.p2.screen.x - segment.p2.screen.w, segment.p2.screen.y, segment.p2.screen.x - segment.p2.screen.w - r2, segment.p2.screen.y, rumbleColor);
                drawPolygon(segment.p1.screen.x + segment.p1.screen.w + r1, segment.p1.screen.y, segment.p1.screen.x + segment.p1.screen.w, segment.p1.screen.y, segment.p2.screen.x + segment.p2.screen.w, segment.p2.screen.y, segment.p2.screen.x + segment.p2.screen.w + r2, segment.p2.screen.y, rumbleColor);
                drawPolygon(segment.p1.screen.x - segment.p1.screen.w, segment.p1.screen.y, segment.p1.screen.x + segment.p1.screen.w, segment.p1.screen.y, segment.p2.screen.x + segment.p2.screen.w, segment.p2.screen.y, segment.p2.screen.x - segment.p2.screen.w, segment.p2.screen.y, roadColor);
                if (segment.color === 'dark') {
                    const l1 = segment.p1.screen.w / 30;
                    const l2 = segment.p2.screen.w / 30;
                    drawPolygon(segment.p1.screen.x - l1, segment.p1.screen.y, segment.p1.screen.x + l1, segment.p1.screen.y, segment.p2.screen.x + l2, segment.p2.screen.y, segment.p2.screen.x - l2, segment.p2.screen.y, '#F3BA2F');
                }
                segment.clip = maxy;
                maxy = segment.p2.screen.y;
            }

            // Sprites
            for (let n = DRAW_DISTANCE - 1; n > 0; n--) {
                const segment = segments[(baseIndex + n) % segments.length];
                for (let i = 0; i < segment.sprites.length; i++) {
                    const sprite = segment.sprites[i];
                    const spriteScale = segment.p1.screen.scale;
                    const spriteX = segment.p1.screen.x + (spriteScale * sprite.offset * ROAD_WIDTH * width / 2);
                    const spriteY = segment.p1.screen.y;
                    drawSprite(sprite, spriteScale, spriteX, spriteY, segment.clip);
                }
            }

            // --- CAR RENDERING ---
            const carX = width / 2;
            const carY = height - 80;
            ctx.save();
            ctx.translate(carX, carY);
            const curveForce = (baseSegment.curve * (speed / MAX_SPEED)) * 30;
            ctx.rotate(curveForce * Math.PI / 180);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.ellipse(0, 10, 60, 20, 0, 0, Math.PI * 2);
            ctx.fill();

            // Main Body (Sleek Wedge)
            const carGrad = ctx.createLinearGradient(0, -60, 0, 20);
            carGrad.addColorStop(0, '#0B0E11');
            carGrad.addColorStop(0.5, '#222');
            carGrad.addColorStop(1, '#0B0E11');

            ctx.fillStyle = carGrad;
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(0, -70); // Nose
            ctx.lineTo(45, 20); // Rear Right
            ctx.lineTo(0, 30); // Rear Center
            ctx.lineTo(-45, 20); // Rear Left
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cockpit Canopy
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -30);
            ctx.lineTo(15, 10);
            ctx.lineTo(-15, 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Rear Engines / Thrusters
            ctx.fillStyle = '#FF0055';
            ctx.shadowColor = '#FF0055';
            ctx.shadowBlur = 15;

            // Left Thruster
            ctx.beginPath();
            ctx.rect(-35, 20, 15, 6);
            ctx.fill();

            // Right Thruster
            ctx.beginPath();
            ctx.rect(20, 20, 15, 6);
            ctx.fill();

            // Center Boost Glow
            if (keyFaster) {
                ctx.fillStyle = '#F3BA2F';
                ctx.shadowColor = '#F3BA2F';
                ctx.shadowBlur = 30;
                ctx.beginPath();
                ctx.arc(0, 22, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Neon Trim Lines
            ctx.strokeStyle = '#F3BA2F';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#F3BA2F';

            ctx.beginPath();
            ctx.moveTo(-45, 20);
            ctx.lineTo(0, -70);
            ctx.lineTo(45, 20);
            ctx.stroke();

            ctx.restore();
        };

        const run = () => { const now = performance.now(); const dt = Math.min(1, (now - lastTime) / 1000); gdt = gdt + dt; while (gdt > STEP) { gdt = gdt - STEP; update(STEP); } render(); lastTime = now; frameId = requestAnimationFrame(run); };
        run();
        return () => { cancelAnimationFrame(frameId); window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); window.removeEventListener('mousemove', handleMouseMove); };
    }, [gameState, handleGameOver]);

    return (
        <div className="fixed inset-0 bg-bana-dark z-50 overflow-hidden font-sans">
            <canvas ref={canvasRef} className="block w-full h-full" />
            <div className="absolute top-4 left-4 z-50"><button onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all"><ArrowLeft size={24} /></button></div>
            <div className="absolute bottom-8 right-8 z-50 pointer-events-auto cursor-pointer"><button onClick={() => setShowInstructions(true)} className="bg-bana-yellow text-bana-dark p-3 rounded-full shadow-lg hover:scale-110 transition-transform"><HelpCircle size={28} /></button></div>
            {gameState === 'playing' && (
                <div className="absolute top-0 left-0 w-full p-6 z-40 pointer-events-none flex justify-between items-start">
                    <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 skew-x-[-10deg] border-l-4 border-l-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                        <div className="text-center"><div className="text-5xl font-black text-cyan-400 font-mono tracking-tighter" style={{ textShadow: '0 0 10px rgba(0,255,255,0.8)' }}>{speedDisplay}</div><div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">KM/H</div></div>
                        <div className="h-12 w-[1px] bg-white/10" /><div><Gauge size={24} className="text-cyan-400 mb-1" /><div className="flex gap-1">{[1, 2, 3, 4, 5].map(i => (<div key={i} className={`w-2 h-4 rounded-sm ${i <= (speedDisplay / 200) * 5 ? 'bg-cyan-400' : 'bg-gray-800'}`} />))}</div></div>
                    </div>
                    <div className="flex flex-col items-center"><div className="text-bana-yellow font-black text-4xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-display tracking-widest">{scoreRef.current.toString().padStart(6, '0')}</div><div className="text-xs text-white/50 uppercase tracking-[0.3em]">POINTS</div></div>
                    <div className="w-[150px]"></div>
                </div>
            )}
            <ScoreBoard score={gameState === 'playing' ? displayScore : score} highScore={highScore} onReset={() => setHighScore(0)} label="SCORE" />
            <AnimatePresence>{gameState === 'start' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-40"><div className="text-center p-8 border border-bana-yellow/20 rounded-3xl bg-black/40 shadow-[0_0_50px_rgba(243,186,47,0.2)]"><h1 className="font-display text-8xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 drop-shadow-[0_0_20px_rgba(0,255,255,0.5)] mb-2 italic transform -skew-x-12">NEON RACER</h1><p className="text-gray-300 text-xl mb-8 font-mono tracking-widest text-cyan-300">SOLANA HIGHWAY V2.0</p><button onClick={startGame} className="bg-cyan-400 text-black font-black text-2xl px-12 py-4 rounded-sm hover:bg-white hover:shadow-[0_0_30px_rgba(0,255,255,0.8)] transition-all skew-x-[-10deg] uppercase tracking-widest">Initialize System</button></div></motion.div>)}</AnimatePresence>
            <AnimatePresence>{gameState === 'gameover' && <GameOverScreen score={score} highScore={highScore} onRestart={startGame} onBack={onBack} gameName="Neon Racer" />}</AnimatePresence>
            <AnimatePresence>{showInstructions && (<InstructionModal title="NEON PROTOCOL" instructions={["Steer with Mouse or Arrows.", "Speed increases automatically (Up arrow to boost).", "Collect 🍌, 💎, and Energy Gems for massive points.", "Avoid the STOP Signs (🛑) or it's Game Over.", "Stay on the road to maintain maximum velocity."]} onClose={() => setShowInstructions(false)} />)}</AnimatePresence>
        </div>
    );
};

// --- SHARED GAME OVER SCREEN ---

const GameOverScreen: React.FC<{ score: number; highScore: number; onRestart: () => void; onBack: () => void; gameName: string }> = ({ score, highScore, onRestart, onBack, gameName }) => {

    const username = localStorage.getItem('bana_username') || 'YOU';

    // --- TOP NOTCH CANVAS GENERATOR ---
    const handleGenerateImage = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Dark Void Background
        const grad = ctx.createRadialGradient(600, 600, 0, 600, 600, 800);
        grad.addColorStop(0, '#151520');
        grad.addColorStop(0.6, '#050508');
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 1200);

        // 2. Cyberpunk Grid & Noise
        ctx.strokeStyle = 'rgba(153, 69, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 1200; i += 60) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1200); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1200, i); ctx.stroke();
        }

        // Noise
        for (let i = 0; i < 10000; i++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
            ctx.fillRect(Math.random() * 1200, Math.random() * 1200, 2, 2);
        }

        // 3. Main Glass Panel (Card Body)
        const margin = 100;
        const panelW = 1000;
        const panelH = 1000;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 50;
        ctx.fillStyle = 'rgba(20, 20, 25, 0.7)';
        ctx.roundRect(margin, margin, panelW, panelH, 40);
        ctx.fill();
        ctx.restore();

        // Panel Border
        const borderGrad = ctx.createLinearGradient(margin, margin, margin + panelW, margin + panelH);
        borderGrad.addColorStop(0, '#F3BA2F');
        borderGrad.addColorStop(0.5, '#9945FF');
        borderGrad.addColorStop(1, '#F3BA2F');
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 6;
        ctx.roundRect(margin, margin, panelW, panelH, 40);
        ctx.stroke();

        // 4. Header Branding
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        // Fallback font stack
        ctx.font = '900 60px "Inter", sans-serif';
        ctx.fillText('$BANA ARCADE', 600, 220);

        ctx.fillStyle = '#F3BA2F';
        ctx.font = 'italic 800 120px "Bangers", sans-serif';
        ctx.shadowColor = '#F3BA2F';
        ctx.shadowBlur = 30;
        ctx.fillText(gameName.toUpperCase(), 600, 360);
        ctx.shadowBlur = 0;

        // Player Name
        ctx.fillStyle = '#9945FF';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText(username, 600, 420);

        // 5. Score Display (Centerpiece)
        const scoreY = 600;
        // Glow behind score
        const scoreGrad = ctx.createRadialGradient(600, scoreY - 40, 0, 600, scoreY - 40, 300);
        scoreGrad.addColorStop(0, 'rgba(243, 186, 47, 0.15)');
        scoreGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = scoreGrad;
        ctx.fillRect(200, 400, 800, 400);

        ctx.fillStyle = '#FFF';
        ctx.font = '900 200px "Courier New", monospace';
        ctx.fillText(score.toString(), 600, scoreY + 40);

        ctx.fillStyle = '#888';
        ctx.font = '500 40px sans-serif';
        ctx.letterSpacing = '10px';
        ctx.fillText('SCORE VERIFIED', 600, scoreY + 120);

        // 6. High Score Badge
        if (score >= highScore && score > 0) {
            ctx.fillStyle = '#9945FF';
            ctx.shadowColor = '#9945FF';
            ctx.shadowBlur = 40;
            ctx.beginPath();
            ctx.roundRect(350, scoreY + 160, 500, 80, 20);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 40px sans-serif';
            ctx.letterSpacing = '2px';
            ctx.fillText('NEW RECORD', 600, scoreY + 215);
        }

        // 7. Footer & Verified Badge
        // Verified Seal
        const sealY = 950;
        ctx.beginPath();
        ctx.arc(600, sealY, 50, 0, Math.PI * 2);
        ctx.fillStyle = '#F3BA2F';
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '50px sans-serif';
        ctx.fillText('✓', 600, sealY + 18);

        ctx.fillStyle = '#666';
        ctx.font = '30px sans-serif';
        ctx.letterSpacing = '0px';
        ctx.fillText('PLAY AT BANATOKEN.COM', 600, 1050);

        // Download
        const link = document.createElement('a');
        link.download = `bana-score-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const handleShareText = () => {
        const shareText = `I just dropped ${score} points in ${gameName} on $BANA Arcade! 🍌 Can you beat my high score? 🚀 #BanaToken`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-[60]"
        >
            <div className="text-center p-8 border border-white/10 rounded-3xl bg-white/5 max-w-md w-full mx-4 relative overflow-hidden shadow-2xl">
                {/* Glow Effect */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-bana-yellow/20 rounded-full blur-[80px]" />

                <Trophy size={64} className="text-bana-yellow mx-auto mb-6 drop-shadow-[0_0_15px_rgba(243,186,47,0.6)]" />
                <h2 className="font-display text-5xl text-white mb-2">GAME OVER</h2>
                <p className="text-bana-yellow font-bold text-xl mb-2">{username}</p>

                <div className="flex justify-center items-end gap-2 mb-8 mt-6">
                    <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Score</p>
                        <p className="text-5xl font-bold text-white font-mono">{score}</p>
                    </div>
                    <div className="w-[1px] h-12 bg-white/20 mx-6 mb-2" />
                    <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Best</p>
                        <p className="text-3xl font-bold text-bana-yellow font-mono">{highScore}</p>
                    </div>
                </div>

                <div className="grid gap-3">
                    <button onClick={onRestart} className="flex items-center justify-center gap-2 w-full py-4 bg-bana-yellow text-bana-dark font-black text-lg rounded-xl hover:bg-white hover:scale-[1.02] transition-all">
                        <RotateCcw size={20} /> PLAY AGAIN
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleGenerateImage} className="flex items-center justify-center gap-2 py-3 bg-white/10 text-white font-bold text-xs md:text-sm rounded-xl hover:bg-white/20 transition-all border border-white/5 group">
                            <Download size={18} className="group-hover:-translate-y-1 transition-transform" /> SAVE CARD
                        </button>
                        <button onClick={handleShareText} className="flex items-center justify-center gap-2 py-3 bg-[#1DA1F2]/20 text-[#1DA1F2] font-bold text-xs md:text-sm rounded-xl hover:bg-[#1DA1F2]/30 transition-all border border-[#1DA1F2]/20">
                            <Share2 size={18} /> SHARE
                        </button>
                    </div>

                    <button onClick={onBack} className="text-gray-500 hover:text-white text-sm py-2 mt-2">Return to Menu</button>
                </div>
            </div>
        </motion.div>
    );
};

// --- LEADERBOARD COMPONENT ---

const Leaderboard: React.FC<{ game: string }> = ({ game }) => {
    const [data, setData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const { data: scores, error } = await supabase
                .from('scores')
                .select(`
                    score,
                    created_at,
                    users (username)
                `)
                .eq('game_mode', game)
                .order('score', { ascending: false })
                .limit(10);

            if (error) throw error;

            if (scores) {
                const formattedData: LeaderboardEntry[] = scores.map((entry: any) => ({
                    username: entry.users?.username || 'Unknown Ape',
                    score: entry.score,
                    created_at: entry.created_at
                }));
                setData(formattedData);
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    }, [game]);

    useEffect(() => {
        setLoading(true);
        fetchLeaderboard();

        // Realtime Subscription
        const channel = supabase
            .channel(`public:scores:game_mode=eq.${game}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'scores' },
                () => {
                    // Just refresh the whole list for simplicity
                    fetchLeaderboard();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [game, fetchLeaderboard]);

    return (
        <div className="bg-black/40 border border-white/10 rounded-3xl p-6 h-full overflow-hidden flex flex-col w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-display text-2xl flex items-center gap-2">
                    <Trophy size={20} className="text-bana-yellow" /> GLOBAL TOP 10
                </h3>
                {loading && <Loader2 size={16} className="animate-spin text-gray-500" />}
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-3">
                {data.length === 0 && !loading && (
                    <p className="text-gray-500 text-center py-4">No scores yet. Be the first!</p>
                )}

                {data.map((entry, idx) => (
                    <div key={idx} className={`flex justify-between items-center p-4 rounded-2xl border transition-all hover:scale-[1.01] ${idx === 0 ? 'bg-bana-yellow/10 border-bana-yellow/50 shadow-[0_0_15px_rgba(243,186,47,0.1)]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm ${idx === 0 ? 'bg-yellow-400 text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-orange-400 text-black' : 'bg-white/10 text-gray-400'}`}>
                                {idx + 1}
                            </div>
                            <span className="text-white font-bold text-base md:text-lg truncate max-w-[150px] md:max-w-none">{entry.username}</span>
                        </div>
                        <span className="text-bana-yellow font-mono text-lg md:text-xl font-bold">{entry.score.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- LEADERBOARD VIEW (SUB-PAGE) ---

const LeaderboardView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [selectedLb, setSelectedLb] = useState('rush');

    return (
        <div className="absolute inset-0 z-50 bg-bana-dark flex flex-col overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-bana-yellow/20 via-black to-black" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-6 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 text-white hover:text-bana-yellow transition-colors font-bold text-sm md:text-base">
                    <ArrowLeft size={20} /> BACK TO GAMES
                </button>
                <h2 className="font-display text-3xl md:text-4xl text-bana-yellow">RANKINGS</h2>
                <div className="w-24 hidden md:block"></div>
            </div>

            <div className="relative z-10 flex-1 overflow-hidden p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col">
                {/* Game Tabs */}
                <div className="flex gap-4 mb-6 shrink-0 bg-black/40 p-1 rounded-2xl border border-white/10">
                    {['rush', 'racer'].map(g => (
                        <button
                            key={g}
                            onClick={() => setSelectedLb(g)}
                            className={`flex-1 py-3 md:py-4 rounded-xl text-sm md:text-lg font-bold uppercase transition-all ${selectedLb === g ? 'bg-bana-yellow text-bana-dark shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {g === 'rush' ? 'Bana Rush' : 'Neon Racer'}
                        </button>
                    ))}
                </div>

                {/* The List Container */}
                <div className="flex-1 overflow-hidden">
                    <Leaderboard game={selectedLb} />
                </div>
            </div>
        </div>
    )
}

// --- MAIN GAME HUB MENU ---

const GameMenu: React.FC<{ onSelect: (mode: GameMode) => void; onBack: () => void }> = ({ onSelect, onBack }) => {
    const [showRankings, setShowRankings] = useState(false);
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [pendingGame, setPendingGame] = useState<GameMode | null>(null);

    const handleGameClick = (mode: GameMode) => {
        const storedId = localStorage.getItem('bana_user_id');
        if (storedId) {
            onSelect(mode);
        } else {
            setPendingGame(mode);
            setShowUsernameModal(true);
        }
    };

    const handleUsernameSubmit = (profile: UserProfile) => {
        // Local storage is set inside the modal
        setShowUsernameModal(false);
        if (pendingGame) onSelect(pendingGame);
    };

    if (showRankings) {
        return <LeaderboardView onBack={() => setShowRankings(false)} />;
    }

    return (
        <div className="absolute inset-0 z-40 bg-bana-dark overflow-y-auto">
            {/* Background */}
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-black" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-6 md:py-12 min-h-screen flex flex-col max-w-6xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors text-sm md:text-base font-bold bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                        <ArrowLeft size={18} /> <span className="hidden md:inline">EXIT ARCADE</span><span className="md:hidden">EXIT</span>
                    </button>

                    <button
                        onClick={() => setShowRankings(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-bana-yellow hover:text-bana-dark rounded-full transition-all text-sm font-bold border border-white/10 backdrop-blur-md"
                    >
                        <Trophy size={18} /> <span>RANKINGS</span>
                    </button>
                </div>

                <div className="text-center mb-12">
                    <h1 className="font-display text-5xl md:text-7xl text-white mb-2">BANA <span className="text-bana-yellow">ARCADE</span></h1>
                    <p className="text-gray-400">Select your challenge. Earn your stripes.</p>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto w-full">

                    {/* Game Card 1: Rush */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="group relative bg-black/40 border border-white/10 rounded-3xl overflow-hidden cursor-pointer flex flex-col w-full hover:border-bana-yellow/50 transition-all shadow-2xl min-h-[450px] md:aspect-[3/4] md:min-h-0"
                        onClick={() => handleGameClick('rush')}
                    >
                        <div className="h-48 md:h-1/2 bg-gray-800 relative overflow-hidden shrink-0">
                            <div className="absolute inset-0 flex items-center justify-center text-8xl md:text-9xl opacity-20 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110">🍌</div>
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col flex-1 relative bg-black/20 backdrop-blur-sm">
                            <div className="absolute -top-6 right-6">
                                <span className="bg-bana-yellow text-bana-dark text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20">POPULAR</span>
                            </div>
                            <h2 className="font-display text-3xl md:text-5xl text-white mb-2 group-hover:text-bana-yellow transition-colors">BANA RUSH</h2>
                            <p className="text-gray-400 mb-6 flex-1 text-sm md:text-base leading-relaxed">Classic Arcade. Catch the loot, dodge the rugs. High speed reflex test.</p>
                            <button className="w-full py-3 md:py-4 bg-white/10 hover:bg-bana-yellow hover:text-bana-dark rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-base md:text-lg">
                                <Gamepad2 size={20} /> PLAY NOW
                            </button>
                        </div>
                    </motion.div>

                    {/* Game Card 2: Racer */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="group relative bg-black/40 border border-white/10 rounded-3xl overflow-hidden cursor-pointer flex flex-col w-full hover:border-cyan-400/50 transition-all shadow-2xl min-h-[450px] md:aspect-[3/4] md:min-h-0"
                        onClick={() => handleGameClick('racer')}
                    >
                        <div className="h-48 md:h-1/2 bg-[#0A0015] relative overflow-hidden shrink-0">
                            <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(0,255,255,0.1)_25%,rgba(0,255,255,0.1)_26%,transparent_27%,transparent_74%,rgba(0,255,255,0.1)_75%,rgba(0,255,255,0.1)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(0,255,255,0.1)_25%,rgba(0,255,255,0.1)_26%,transparent_27%,transparent_74%,rgba(0,255,255,0.1)_75%,rgba(0,255,255,0.1)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />
                            <div className="absolute inset-0 flex items-center justify-center"><Zap size={70} className="text-cyan-400 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" /></div>
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col flex-1 relative bg-black/20 backdrop-blur-sm">
                            <h2 className="font-display text-3xl md:text-5xl text-white mb-2 group-hover:text-cyan-400 transition-colors italic">NEON RACER</h2>
                            <p className="text-gray-400 mb-6 flex-1 text-sm md:text-base leading-relaxed">Cyberpunk Driving. Outrun the taxes on the Solana highway.</p>
                            <button className="w-full py-3 md:py-4 bg-white/10 hover:bg-cyan-400 hover:text-black rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-base md:text-lg">
                                <Gamepad2 size={20} /> PLAY NOW
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {showUsernameModal && (
                    <UsernameModal
                        onSubmit={handleUsernameSubmit}
                        onClose={() => setShowUsernameModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface GamePageProps {
    onBack: () => void;
}

const GamePage: React.FC<GamePageProps> = ({ onBack }) => {
    const [activeGame, setActiveGame] = useState<GameMode>('menu');

    return (
        <div className="fixed inset-0 z-50 bg-bana-dark font-sans text-white">
            {activeGame === 'menu' && <GameMenu onSelect={setActiveGame} onBack={onBack} />}
            {activeGame === 'rush' && <BanaRush onBack={() => setActiveGame('menu')} />}
            {activeGame === 'racer' && <BanaRacer onBack={() => setActiveGame('menu')} />}
        </div>
    );
};

export default GamePage;

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { GameState, Custard as ICustard, Obstacle } from './types';
import { World } from './components/Environment';
import { Player } from './components/Player';
import { Custard } from './components/Custard';
import { Monster } from './components/Monster';
import { getHorrorMessage } from './services/geminiService';
import { Ghost, Play, Settings as SettingsIcon, X, Skull, RotateCcw, Home, BatteryFull, BatteryLow, BatteryWarning, ArrowBigUp, Download, Monitor, Zap } from 'lucide-react';

const TOTAL_CUSTARDS = 10;
const BATTERY_DRAIN_RATE = 0.8;
const BATTERY_RECHARGE_RATE = 0.4;
const HOUSE_POSITION = new THREE.Vector3(0, 0, -40);

const worldObstacles: Obstacle[] = Array.from({ length: 60 }).map((_, i) => {
  const angle = Math.random() * Math.PI * 2;
  const radius = 15 + Math.random() * 80;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  const types: Obstacle['type'][] = ['tree', 'rock', 'willow', 'dead-tree'];
  const type = types[Math.floor(Math.random() * types.length)];
  let collRadius = 0.8;
  let scale = 0.8 + Math.random() * 0.7;
  
  if (type === 'rock') collRadius = 1.6 * scale;
  else if (type === 'willow') collRadius = 1.2 * scale;
  else if (type === 'dead-tree') collRadius = 1.4 * scale;

  return {
    id: `obs-${i}`,
    position: [x, 0, z],
    radius: collRadius,
    type,
    scale
  };
});

const JUMPSCARE_SOUND_URL = "https://cdn.pixabay.com/audio/2022/03/25/audio_27357c320a.mp3"; 
const MENU_MUSIC_URL = "https://cdn.pixabay.com/audio/2022/10/30/audio_33989c676d.mp3"; 
const GAME_AMBIENCE_URL = "https://cdn.pixabay.com/audio/2022/03/24/audio_73d9e265c0.mp3"; 
const HEARTBEAT_SOUND_URL = "https://cdn.pixabay.com/audio/2024/02/08/audio_824707833e.mp3";
const WIN_FANFARE_URL = "https://cdn.pixabay.com/audio/2021/08/04/audio_06250269f8.mp3";

const APP_VERSION = "v1.5.3";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [custards, setCustards] = useState<ICustard[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [battery, setBattery] = useState(100);
  const [horrorMessage, setHorrorMessage] = useState("");
  const [isScaring, setIsScaring] = useState(false);
  const [dangerLevel, setDangerLevel] = useState(0); 
  
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [soundVolume, setSoundVolume] = useState(0.8);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const jumpscareAudio = useRef<HTMLAudioElement | null>(null);
  const menuAudio = useRef<HTMLAudioElement | null>(null);
  const gameAudio = useRef<HTMLAudioElement | null>(null);
  const heartbeatAudio = useRef<HTMLAudioElement | null>(null);
  const winAudio = useRef<HTMLAudioElement | null>(null);
  
  const custardsGroupRef = useRef<THREE.Group>(null);
  const sceneRef = useRef<THREE.Group>(null);

  // Global listener for Esc key to return to menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && gameState === GameState.PLAYING) {
        setGameState(GameState.START);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const initAudio = (url: string, loop: boolean = false, initialVolume: number = 0.5) => {
      const audio = new Audio(url);
      audio.loop = loop;
      audio.volume = initialVolume;
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      return audio;
    };
    jumpscareAudio.current = initAudio(JUMPSCARE_SOUND_URL, false, soundVolume);
    menuAudio.current = initAudio(MENU_MUSIC_URL, true, musicVolume);
    gameAudio.current = initAudio(GAME_AMBIENCE_URL, true, musicVolume);
    heartbeatAudio.current = initAudio(HEARTBEAT_SOUND_URL, true, 0);
    winAudio.current = initAudio(WIN_FANFARE_URL, false, soundVolume);
    return () => {
      [menuAudio, gameAudio, heartbeatAudio, winAudio].forEach(ref => { if (ref.current) ref.current.pause(); });
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (gameState === GameState.START) {
      gameAudio.current?.pause();
      if (menuAudio.current?.paused) menuAudio.current.play().catch(() => {});
    } else if (gameState === GameState.PLAYING) {
      menuAudio.current?.pause();
      if (gameAudio.current?.paused) gameAudio.current.play().catch(() => {});
    }
  }, [gameState]);

  useEffect(() => {
    let interval: number;
    if (gameState === GameState.PLAYING) {
      interval = window.setInterval(() => {
        setBattery(prev => {
          if (flashlightOn) {
            const next = Math.max(0, prev - (BATTERY_DRAIN_RATE * 0.1));
            if (next === 0 && flashlightOn) setFlashlightOn(false);
            return next;
          } else {
            return Math.min(100, prev + (BATTERY_RECHARGE_RATE * 0.1));
          }
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, flashlightOn]);

  const initGame = () => {
    const newCustards: ICustard[] = [];
    newCustards.push({ id: 'house-1', position: [5, 0.2, -45] });
    newCustards.push({ id: 'house-2', position: [-5, 0.2, -42] });
    for (let i = 2; i < TOTAL_CUSTARDS; i++) {
      const x = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      if (Math.sqrt(x * x + z * z) < 15 || Math.sqrt(x * x + (z + 40) * (z + 40)) < 15) { i--; continue; }
      newCustards.push({ id: `c-${i}`, position: [x, 0.2, z] });
    }
    setCustards(newCustards);
    setCollectedCount(0);
    setFlashlightOn(true);
    setBattery(100);
    setGameState(GameState.PLAYING);
    setIsScaring(false);
    setDangerLevel(0);
    setHorrorMessage("Collect 10 Custards...");
    
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleInteract = useCallback((raycaster: THREE.Raycaster) => {
    if (gameState !== GameState.PLAYING || isScaring) return;
    if (custardsGroupRef.current) {
      const intersects = raycaster.intersectObjects(custardsGroupRef.current.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.name.startsWith('custard-')) obj = obj.parent;
        if (obj) {
          const id = obj.name.replace('custard-', '');
          setCustards(prev => prev.filter(c => c.id !== id));
          setCollectedCount(prev => {
            const nextCount = prev + 1;
            getHorrorMessage(nextCount, TOTAL_CUSTARDS).then(setHorrorMessage);
            return nextCount;
          });
        }
      }
    }
  }, [gameState, isScaring]);

  const handleCatch = useCallback(() => {
    if (gameState === GameState.PLAYING && !isScaring) {
      setIsScaring(true);
      if (jumpscareAudio.current) {
        jumpscareAudio.current.currentTime = 0;
        jumpscareAudio.current.play().catch(() => {});
      }
      setTimeout(() => {
        setIsScaring(false);
        setGameState(GameState.GAMEOVER);
      }, 1600);
    }
  }, [gameState, isScaring]);

  const handleWin = useCallback(() => {
    if (collectedCount === TOTAL_CUSTARDS) {
      winAudio.current?.play().catch(() => {});
      setGameState(GameState.WIN);
    }
  }, [collectedCount]);

  const getBatteryIcon = () => {
    if (battery > 70) return <BatteryFull size={24} className="text-green-500" />;
    if (battery > 25) return <BatteryLow size={24} className="text-yellow-500" />;
    return <BatteryWarning size={24} className="text-red-600 animate-pulse" />;
  };

  return (
    <div className={`w-full h-screen relative bg-black font-sans overflow-hidden select-none ${isScaring ? 'animate-shake' : ''} ${gameState === GameState.PLAYING ? 'cursor-none' : ''}`}>
      <style>{`
        @keyframes shake { 0%, 100% { transform: translate(0, 0); } 5% { transform: translate(-10px, -10px); } 15% { transform: translate(10px, 10px); } 25% { transform: translate(-10px, 10px); } }
        @keyframes flash { 0%, 100% { background: rgba(0,0,0,1); } 50% { background: rgba(185,28,28,0.3); } }
        .animate-shake { animation: shake 0.1s infinite; }
        .jumpscare-flash { animation: flash 0.2s linear infinite; }
        .danger-pulse { animation: dangerPulse 1.5s ease-in-out infinite; }
        @keyframes dangerPulse { 0%, 100% { opacity: 0; } 50% { opacity: var(--danger-opacity, 0); } }
      `}</style>

      {/* 3D Scene Layer */}
      {(gameState === GameState.PLAYING || isScaring) && (
        <div className="absolute inset-0 z-0">
          <Canvas shadows camera={{ fov: 75, position: [0, 1.7, 0] }}>
            <group ref={sceneRef}>
              <World houseLightsOn={true} obstacles={worldObstacles} />
              <group ref={custardsGroupRef}>
                {custards.map(c => <Custard key={c.id} id={c.id} position={c.position} />)}
              </group>
              <Monster onCatch={handleCatch} active={gameState === GameState.PLAYING && !isScaring} isScaring={isScaring} onDangerUpdate={setDangerLevel} soundVolume={soundVolume} />
              {collectedCount === TOTAL_CUSTARDS && (
                <group position={[HOUSE_POSITION.x, 0, HOUSE_POSITION.z]}>
                  <pointLight intensity={20} distance={30} color="#00ffff" />
                  <mesh position={[0, 10, 0]}><cylinderGeometry args={[0.1, 0.1, 20]} /><meshBasicMaterial color="#00ffff" transparent opacity={0.3} /></mesh>
                </group>
              )}
            </group>
            <Player 
              onInteract={handleInteract} 
              flashlightOn={flashlightOn && !isScaring} 
              isScaring={isScaring} 
              battery={battery} 
              obstacles={worldObstacles} 
              onToggleFlashlight={() => { if (!isScaring && battery > 0) setFlashlightOn(!flashlightOn); }} 
              soundVolume={soundVolume} 
              canWin={collectedCount === TOTAL_CUSTARDS} 
              onWin={handleWin}
              active={gameState === GameState.PLAYING}
            />
          </Canvas>
        </div>
      )}

      {/* Global Danger Effects */}
      <div className="absolute inset-0 z-10 pointer-events-none danger-pulse bg-red-900/30" style={{ '--danger-opacity': (dangerLevel * 0.7).toString() } as any} />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-[500] pointer-events-none">
        
        {/* Crosshair - Ensure it is at the highest priority in the HUD */}
        {(gameState === GameState.PLAYING && !isScaring) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1000] opacity-50">
            <div className="w-1.5 h-1.5 bg-white rounded-full border border-black/50"></div>
          </div>
        )}

        {/* Main Menu */}
        {gameState === GameState.START && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] text-white p-6 pointer-events-auto">
            <div className="mb-12 relative flex flex-col items-center">
              <Ghost className="text-red-800 mb-4 animate-pulse" size={64} />
              <h1 className="text-7xl font-black italic text-red-700 drop-shadow-[0_0_30px_rgba(185,28,28,0.6)] text-center uppercase tracking-tight"> SLENDYTUBBIES </h1>
              <p className="text-zinc-600 font-bold uppercase tracking-[1em] mt-4 opacity-70 text-sm">NIGHTMARE</p>
            </div>
            
            <div className="flex flex-col gap-4 w-80">
              <button 
                onClick={initGame} 
                className="bg-red-800 hover:bg-red-700 border-b-[6px] border-red-950 text-white py-5 font-black uppercase tracking-widest text-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95 cursor-pointer"
              > 
                <Play fill="white" size={24} /> PLAY 
              </button>
              
              {deferredPrompt && (
                <button 
                  onClick={() => { deferredPrompt.prompt(); setDeferredPrompt(null); }} 
                  className="bg-cyan-900/40 hover:bg-cyan-800/60 border-b-2 border-cyan-950 text-cyan-400 py-3 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                > 
                  <Monitor size={16} /> INSTALL DESKTOP APP 
                </button>
              )}

              <button 
                onClick={() => setIsSettingsOpen(true)} 
                className="bg-zinc-900/80 hover:bg-zinc-800 border-b-2 border-zinc-950 text-zinc-500 py-3 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              > 
                <SettingsIcon size={16} /> SETTINGS 
              </button>
            </div>

            <div className="mt-16 flex gap-6 text-[10px] font-bold text-zinc-700 uppercase tracking-widest flex-wrap justify-center max-w-2xl">
              <div className="flex flex-col items-center gap-1"> <span className="text-zinc-500">WASD</span> <span>Move</span> </div>
              <div className="flex flex-col items-center gap-1"> <span className="text-zinc-500">SHIFT</span> <span>Sprint</span> </div>
              <div className="flex flex-col items-center gap-1"> <span className="text-zinc-500">SPACE</span> <span>Jump</span> </div>
              <div className="flex flex-col items-center gap-1"> <span className="text-zinc-500">MOUSE</span> <span>Look</span> </div>
              <div className="flex flex-col items-center gap-1"> <span className="text-zinc-500">F</span> <span>Light</span> </div>
              <div className="flex flex-col items-center gap-1"> <span className="text-zinc-500">E</span> <span>Pick Up</span> </div>
              <div className="flex flex-col items-center gap-1"> <span className="text-zinc-500">ESC</span> <span>Quit</span> </div>
            </div>
            
            <div className="absolute bottom-6 right-8 text-zinc-800 font-mono text-[10px] tracking-widest uppercase opacity-40"> {APP_VERSION} </div>
          </div>
        )}

        {/* Game HUD */}
        {gameState === GameState.PLAYING && !isScaring && (
          <div className="absolute inset-0 w-full h-full pointer-events-none p-8">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <div className="px-8 py-2 bg-black/70 rounded border border-red-900/50 backdrop-blur-md">
                   <div className="text-red-500 font-black text-2xl tracking-tighter uppercase italic flex items-baseline gap-2">
                     <span className="text-4xl">{collectedCount}</span>
                     <span className="text-red-900 text-lg">/ {TOTAL_CUSTARDS}</span>
                   </div>
                   <div className="text-[10px] font-bold text-red-900 uppercase tracking-widest">SAMPLES FOUND</div>
                </div>
                {collectedCount === TOTAL_CUSTARDS && (
                   <div className="px-4 py-2 bg-cyan-900/80 rounded border border-cyan-400 text-cyan-400 font-black uppercase text-xs animate-pulse flex items-center gap-2">
                     <ArrowBigUp size={16} /> EXIT AT HOUSE
                   </div>
                )}
              </div>

              <div className="flex items-center gap-4 bg-black/60 px-6 py-3 rounded border border-white/10 backdrop-blur-md shadow-2xl">
                <div className="flex flex-col items-end gap-1">
                   <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Power Cell</div>
                   <div className="w-40 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                     <div className={`h-full transition-all duration-300 ${battery > 25 ? 'bg-green-600' : 'bg-red-600 animate-pulse'}`} style={{ width: `${battery}%` }} />
                   </div>
                </div>
                {getBatteryIcon()}
              </div>
            </div>

            <div className="absolute bottom-16 left-0 right-0 flex justify-center">
              <p className="text-red-600 text-3xl font-black uppercase italic drop-shadow-[0_4px_8px_rgba(0,0,0,1)] text-center max-w-2xl px-4 animate-flicker">
                {horrorMessage}
              </p>
            </div>

            <div className="absolute bottom-8 left-8 text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em] opacity-40">
              [F] LIGHT &nbsp;&nbsp; [E] PICK UP &nbsp;&nbsp; [SPACE] JUMP &nbsp;&nbsp; [ESC] MENU
            </div>
          </div>
        )}

        {/* Jumpscare Layer */}
        {isScaring && (
          <div className="absolute inset-0 z-[1000] jumpscare-flash pointer-events-none flex items-center justify-center bg-black">
             <div className="relative w-full h-full flex items-center justify-center animate-shake">
               <div className="flex flex-col items-center">
                  <div className="flex gap-20 -mb-4">
                     <div className="w-40 h-40 bg-red-600 rounded-full blur-md border-8 border-white shadow-[0_0_120px_rgba(255,0,0,1)]"></div>
                     <div className="w-40 h-40 bg-red-600 rounded-full blur-md border-8 border-white shadow-[0_0_120px_rgba(255,0,0,1)]"></div>
                  </div>
                  <div className="w-96 h-48 bg-black border-t-8 border-zinc-900 rounded-b-full mt-4 shadow-[0_0_50px_rgba(0,0,0,1)]"></div>
               </div>
             </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === GameState.GAMEOVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/98 text-white p-6 pointer-events-auto">
            <style>{` .cursor-fix { cursor: auto !important; } `}</style>
            <Skull className="text-red-600 mb-8 drop-shadow-[0_0_40px_rgba(220,38,38,0.5)]" size={96} />
            <h2 className="text-8xl font-black uppercase italic text-red-700 mb-4 text-center tracking-tighter"> FATE SEALED </h2>
            <div className="flex flex-col gap-4 w-72 mt-8">
              <button onClick={initGame} className="bg-red-800 hover:bg-red-700 border-b-4 border-red-950 text-white py-5 font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95 cursor-pointer cursor-fix"> <RotateCcw size={20} /> TRY AGAIN </button>
              <button onClick={() => setGameState(GameState.START)} className="bg-zinc-900/80 hover:bg-zinc-800 border-b-2 border-zinc-950 text-zinc-400 py-3 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer cursor-fix"> <Home size={16} /> MENU </button>
            </div>
          </div>
        )}

        {/* Win Screen */}
        {gameState === GameState.WIN && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white p-8 pointer-events-auto text-center">
             <div className="w-32 h-32 bg-cyan-500/10 rounded-full flex items-center justify-center mb-8 border border-cyan-500/20 shadow-[0_0_60px_rgba(6,182,212,0.2)]">
               <Monitor size={64} className="text-cyan-400" />
             </div>
            <h2 className="text-8xl font-black mb-4 uppercase italic tracking-tighter"> EVADED </h2>
            <p className="text-cyan-400 font-bold uppercase tracking-[0.5em] mb-12 text-sm"> You escaped the shadow's gaze. </p>
            <button onClick={() => setGameState(GameState.START)} className="bg-cyan-600 hover:bg-cyan-500 text-black py-6 w-80 font-black uppercase tracking-widest text-lg border-b-4 border-cyan-900 flex items-center justify-center gap-3 active:scale-95 cursor-pointer transition-all hover:-translate-y-1 cursor-fix"> <Home size={24} /> BACK TO MENU </button>
          </div>
        )}

        {/* Settings */}
        {isSettingsOpen && (
          <div className="absolute inset-0 bg-black/95 flex items-center justify-center pointer-events-auto backdrop-blur-xl">
            <div className="w-full max-w-md border border-white/10 bg-zinc-950 p-12 relative shadow-[0_0_100px_rgba(0,0,0,1)] m-4">
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white cursor-pointer cursor-fix"><X size={32} /></button>
              <h2 className="text-4xl font-black mb-12 uppercase tracking-tight text-red-700 border-b border-red-900/20 pb-6">Game Settings</h2>
              <div className="space-y-10">
                <div className="space-y-4"> 
                  <div className="flex justify-between text-xs uppercase font-black text-zinc-500 tracking-widest"><span>Audio FX</span><span>{Math.round(soundVolume * 100)}%</span></div> 
                  <input type="range" min="0" max="1" step="0.01" value={soundVolume} onChange={(e) => setSoundVolume(parseFloat(e.target.value))} className="w-full h-1.5 bg-zinc-900 rounded-lg accent-red-700 cursor-pointer cursor-fix" /> 
                </div>
                <div className="space-y-4 text-xs font-bold text-zinc-600 leading-relaxed uppercase tracking-wider">
                  <p className="text-zinc-500">Controls:</p>
                  <p>[W/A/S/D] - Move</p>
                  <p>[SHIFT] - Sprint</p>
                  <p>[SPACE] - Jump</p>
                  <p>[MOUSE] - Look around</p>
                  <p>[F] - Toggle Flashlight</p>
                  <p>[E] - Pick Up Sample</p>
                  <p>[ESC] - Return to Main Menu</p>
                </div>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-12 bg-red-800 hover:bg-red-700 py-5 font-black uppercase text-sm tracking-widest active:scale-95 transition-all cursor-pointer cursor-fix">APPLY CHANGES</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default App;

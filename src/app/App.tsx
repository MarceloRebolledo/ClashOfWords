import { useState, useEffect } from "react";
import { allCards } from "./cardsData";
import {
  Shield,
  Sword,
  Trophy,
  Package,
  Volume2,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Upload,
  ChevronDown,
  Star,
  Zap,
  Users,
  BarChart2,
  Plus,
  X,
  ArrowRight,
  Eye,
  EyeOff,
  Settings,
  LogOut,
  Layers,
  PlayCircle,
  Gift,
  Flame,
  Sparkles,
  Swords,
  Wifi,
  ChevronLeft,
  ShoppingBag,
  RotateCcw,
  BookOpen
} from "lucide-react";

// ─── AUDIO HELPER (TTS) ──────────────────────────────────────────────────────
function speakWord(text: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel(); // Cancel current audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85; // Slightly slower for language learners
    window.speechSynthesis.speak(utterance);
  }
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type Screen =
  | "login"
  | "student-hub"
  | "deck-builder"
  | "game-mat"
  | "teacher-verify"
  | "teacher-cards"
  | "teacher-progress";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type CardType = "Creature" | "Item" | "Effect" | "Value";

export interface Card {
  id: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  power: number;
  englishClass: string;
  ability?: string;
  active?: boolean;
  image?: string;
}

export interface StudentProfile {
  username: string;
  coins: number;
  trophies: number;
  wins: number;
  losses: number;
  collection: string[]; // List of card IDs owned by student
  activeDeck: string[]; // List of card IDs in active deck
}

export interface RewardCode {
  code: string;
  rewardType: "coins" | "pack";
  rewardValue: number;
  redeemed: boolean;
}

export interface MatchLog {
  id: string;
  date: string;
  student: string;
  outcome: "win" | "loss";
  trophiesBefore: number;
  trophiesAfter: number;
  playerTrophiesWon: number;
  opponentTrophiesWon: number;
}

// ─── CARD DATA CONSTANTS ──────────────────────────────────────────────────────
const RARITY_STRIP: Record<Rarity, string> = {
  Common: "bg-gradient-to-r from-slate-400 to-slate-500",
  Uncommon: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  Rare: "bg-gradient-to-r from-blue-400 to-blue-600",
  Epic: "bg-gradient-to-r from-purple-400 to-purple-700",
  Legendary: "bg-gradient-to-r from-amber-400 to-orange-500",
};

const RARITY_GLOW: Record<Rarity, string> = {
  Common: "shadow-[0_0_10px_rgba(148,163,184,0.3)]",
  Uncommon: "shadow-[0_0_12px_rgba(52,211,153,0.35)]",
  Rare: "shadow-[0_0_14px_rgba(96,165,250,0.45)]",
  Epic: "shadow-[0_0_18px_rgba(168,85,247,0.55)]",
  Legendary: "shadow-[0_0_24px_rgba(251,191,36,0.65)]",
};

const RARITY_BORDER: Record<Rarity, string> = {
  Common: "border-slate-500/60",
  Uncommon: "border-emerald-500/60",
  Rare: "border-blue-500/60",
  Epic: "border-purple-500/70",
  Legendary: "border-amber-400/80",
};

const RARITY_BADGE_BG: Record<Rarity, string> = {
  Common: "bg-slate-700 text-slate-300",
  Uncommon: "bg-emerald-800 text-emerald-200",
  Rare: "bg-blue-800 text-blue-200",
  Epic: "bg-purple-800 text-purple-200",
  Legendary: "bg-amber-700 text-amber-100",
};

const TYPE_ICON: Record<CardType, React.ReactNode> = {
  Creature: <Sword size={20} className="text-amber-400" />,
  Item: <Package size={20} className="text-cyan-400" />,
  Effect: <Zap size={20} className="text-emerald-400" />,
  Value: <Star size={20} className="text-rose-400" />,
};

const TYPE_ICON_SM: Record<CardType, React.ReactNode> = {
  Creature: <Sword size={13} className="text-amber-400" />,
  Item: <Package size={13} className="text-cyan-400" />,
  Effect: <Zap size={13} className="text-emerald-400" />,
  Value: <Star size={13} className="text-rose-400" />,
};

const defaultCatalog: Card[] = allCards;
function playSynthSound(type: "equip" | "victory" | "defeat" | "error") {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;
  
  try {
    const ctx = new AudioContextClass();
    
    if (type === "equip") {
      // Chime: two ascending notes
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.start(now);
      osc1.stop(now + 0.15);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.3);
    } else if (type === "error") {
      // Buzz sound
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.error("Audio Context failed to start", e);
  }
}

// ─── ACCESSIBILITY RARITY ICONS (DALTONISM) ───────────────────────────────────
const RARITY_ICONS: Record<Rarity, string> = {
  Common: "◯",
  Uncommon: "▲",
  Rare: "♢",
  Epic: "🛡️",
  Legendary: "⭐",
};

// ─── LONG PRESS PROPS GENERATOR ──────────────────────────────────────────────
interface LongPressProps {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
}

function getLongPressProps(onLongPress: () => void, onClick: () => void): LongPressProps {
  let pressTimer: any = null;
  let wasLongPress = false;
  
  return {
    onPointerDown: (e) => {
      wasLongPress = false;
      if (e.button !== 0) return;
      pressTimer = setTimeout(() => {
        onLongPress();
        wasLongPress = true;
      }, 600);
    },
    onPointerUp: (e) => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      if (!wasLongPress) {
        onClick();
      }
    },
    onPointerLeave: () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    }
  };
}

// ─── CARD COMPONENTS ──────────────────────────────────────────────────────────

function FullCard({ card, dimmed = false, onSpeech, onZoom }: { card: Card; dimmed?: boolean; onSpeech?: () => void; onZoom?: (c: Card) => void }) {
  const r = card.rarity;
  const rIcon = RARITY_ICONS[r] || "◯";

  const handleCardClick = () => {
    if (onZoom) onZoom(card);
  };

  const handleLongPress = () => {
    speakWord(card.name);
  };

  const pressProps = getLongPressProps(handleLongPress, handleCardClick);

  return (
    <div
      {...pressProps}
      className={`relative flex flex-col rounded-xl border-2 overflow-hidden bg-gradient-to-b from-[#1c1845] to-[#0e0c24] transition-all hover:scale-[1.03] duration-300 ${
        RARITY_BORDER[r]
      } ${RARITY_GLOW[r]} ${dimmed ? "opacity-50" : ""}`}
      style={{ width: 108, height: 148 }}
    >
      {card.image ? (
        <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <>
          {/* Rarity strip */}
          <div className={`h-1.5 w-full flex-shrink-0 ${RARITY_STRIP[r]}`} />

          {/* Power badge */}
          <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-[#0e0c24] border-2 border-amber-400 flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.6)]">
            <span className="font-['Nunito'] font-black text-sm text-amber-300 leading-none">{card.power}</span>
          </div>

          {/* Art area */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-900/80 to-indigo-950 flex items-center justify-center border border-purple-700/30">
              {TYPE_ICON[card.type]}
            </div>
          </div>

          {/* Info strip */}
          <div className="px-2 pb-2 flex flex-col gap-0.5">
            <p className="font-['Nunito'] font-black text-[11px] text-white leading-tight line-clamp-1">{card.name}</p>
            <div className="flex items-center justify-between">
              <span className="font-['DM_Mono'] text-[8px] text-purple-400">{card.englishClass}</span>
              <span className={`text-[8px] px-1 rounded font-bold ${RARITY_BADGE_BG[r]} flex items-center gap-0.5`}>
                <span>{rIcon}</span>
                <span>{r[0]}</span>
              </span>
            </div>
          </div>
        </>
      )}

      {/* Show the rarity icon watermark on image-based cards for accessibility */}
      {card.image && (
        <span className={`absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded font-bold bg-[#0e0c24]/85 text-purple-300 border border-purple-900/30 z-10 opacity-90`}>{rIcon}</span>
      )}

      {/* Speaker */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onSpeech) onSpeech();
          else speakWord(card.name);
        }}
        className="absolute bottom-1.5 left-1.5 z-10 w-6 h-6 rounded-md bg-indigo-800/80 border border-indigo-600/50 flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all"
        aria-label={`Hear pronunciation of ${card.name}`}
      >
        <Volume2 size={11} className="text-cyan-300" />
      </button>
    </div>
  );
}

function HandCard({ card, onPlay, onSpeech, onZoom }: { card: Card; onPlay?: () => void; onSpeech?: () => void; onZoom?: (c: Card) => void }) {
  const r = card.rarity;
  const rIcon = RARITY_ICONS[r] || "◯";

  const handleCardClick = () => {
    if (onPlay) onPlay();
  };

  const handleLongPress = () => {
    speakWord(card.name);
  };

  const pressProps = getLongPressProps(handleLongPress, handleCardClick);

  return (
    <div
      {...pressProps}
      className={`relative flex-shrink-0 flex flex-col rounded-xl border-2 overflow-hidden bg-gradient-to-b from-[#1c1845] to-[#0e0c24] cursor-pointer active:scale-95 transition-all hover:-translate-y-1.5 ${
        RARITY_BORDER[r]
      } ${RARITY_GLOW[r]}`}
      style={{ width: 72, height: 100 }}
    >
      {card.image ? (
        <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <>
          <div className={`h-1 w-full flex-shrink-0 ${RARITY_STRIP[r]}`} />
          <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-[#0e0c24] border border-amber-400 flex items-center justify-center">
            <span className="font-['Nunito'] font-black text-[10px] text-amber-300 leading-none">{card.power}</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-900/80 to-indigo-950 flex items-center justify-center border border-purple-700/30">
              {TYPE_ICON_SM[card.type]}
            </div>
          </div>
          <div className="px-1.5 pb-1.5 flex flex-col gap-0.5">
            <p className="font-['Nunito'] font-black text-[9px] text-white leading-tight line-clamp-1">{card.name}</p>
            <div className="flex items-center justify-between">
              <span className="font-['DM_Mono'] text-[7px] text-purple-400">{card.englishClass}</span>
              <span className="text-[7px] font-bold text-purple-500">{rIcon}</span>
            </div>
          </div>
        </>
      )}
      {/* Show the rarity icon watermark on image-based HandCards for accessibility */}
      {card.image && (
        <span className={`absolute bottom-1 right-1 text-[7px] px-1 rounded font-bold bg-[#0e0c24]/85 text-purple-300 border border-purple-900/30 z-10 opacity-90`}>{rIcon}</span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onSpeech) onSpeech();
          else speakWord(card.name);
        }}
        className="absolute bottom-1 left-1 z-10 w-4 h-4 rounded bg-indigo-800/80 hover:bg-indigo-700 active:scale-90 transition-all flex items-center justify-center"
        aria-label={`Hear ${card.name}`}
      >
        <Volume2 size={8} className="text-cyan-300" />
      </button>
    </div>
  );
}

function CardBack({ count, label, color = "purple", onClick }: {
  count: number;
  label: string;
  color?: "purple" | "amber" | "slate" | "emerald";
  onClick?: () => void;
}) {
  const colors = {
    purple: { border: "border-purple-600/60", bg: "from-purple-900/70 to-purple-950", glow: "shadow-[0_0_12px_rgba(124,58,237,0.35)]", text: "text-purple-300", badge: "bg-purple-700 text-purple-200" },
    amber: { border: "border-amber-500/70", bg: "from-amber-900/60 to-amber-950", glow: "shadow-[0_0_14px_rgba(217,119,6,0.45)]", text: "text-amber-300", badge: "bg-amber-700 text-amber-200" },
    slate: { border: "border-slate-600/50", bg: "from-slate-800/70 to-slate-900", glow: "", text: "text-slate-400", badge: "bg-slate-700 text-slate-300" },
    emerald: { border: "border-emerald-600/50", bg: "from-emerald-900/60 to-emerald-950", glow: "shadow-[0_0_10px_rgba(16,185,129,0.3)]", text: "text-emerald-300", badge: "bg-emerald-800 text-emerald-200" },
  }[color];

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={`flex flex-col items-center justify-between rounded-xl border-2 bg-gradient-to-b ${colors.bg} ${colors.border} ${colors.glow} ${onClick ? "cursor-pointer active:scale-95 hover:brightness-110" : ""} transition-all relative overflow-hidden`}
      style={{ width: 72, height: 96 }}
    >
      <img src="/cards/CARD BACK/carta_001.png" alt="Card Back" className="w-full h-full object-cover absolute inset-0" />
      <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-between py-2 z-10">
        <span className="font-['Nunito'] font-black text-2xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{count}</span>
        <div className="w-full px-1.5 py-0.5 text-center bg-black/60 rounded-b-lg">
          <span className="font-['Nunito'] font-bold text-[8px] uppercase tracking-wider text-white">{label}</span>
        </div>
      </div>
    </div>
  );
}

function EmptySlot({ label, sublabel, width = 72, height = 96, dashed = true }: {
  label: string;
  sublabel?: string;
  width?: number;
  height?: number;
  dashed?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 ${
        dashed ? "border-dashed" : "border-solid"
      } border-purple-700/35 bg-purple-950/10`}
      style={{ width, height }}
    >
      <Plus size={12} className="text-purple-700 mb-1" />
      <span className="font-['Nunito'] font-bold text-[8px] text-purple-700 uppercase tracking-wider text-center px-1 leading-tight">{label}</span>
      {sublabel && <span className="font-['DM_Mono'] text-[7px] text-purple-800 mt-0.5 text-center px-1">{sublabel}</span>}
    </div>
  );
}

function ZoneLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-['DM_Mono'] text-[7px] text-purple-600 uppercase tracking-widest text-center leading-none">
      {children}
    </span>
  );
}

const RARITY_COLORS_MINI: Record<string, string> = {
  Common: "from-slate-400 to-slate-500",
  Uncommon: "from-emerald-400 to-emerald-600",
  Rare: "from-blue-400 to-blue-600",
  Epic: "from-purple-400 to-purple-700",
  Legendary: "from-amber-400 to-orange-500",
};

const RARITY_BADGE_MINI: Record<string, string> = {
  Common: "bg-slate-600 text-slate-200",
  Uncommon: "bg-emerald-700 text-emerald-100",
  Rare: "bg-blue-700 text-blue-100",
  Epic: "bg-purple-700 text-purple-100",
  Legendary: "bg-amber-600 text-amber-100",
};

interface MiniCardProps {
  name: string;
  type: string;
  rarity: string;
  power: number;
  englishClass: string;
  selected?: boolean;
  glowing?: boolean;
  onSpeech?: () => void;
  image?: string;
  onZoom?: () => void;
  onLongPress?: () => void;
}

function MiniCard({ name, type, rarity, power, englishClass, selected, glowing, onSpeech, image, onZoom, onLongPress }: MiniCardProps) {
  const grad = RARITY_COLORS_MINI[rarity] ?? RARITY_COLORS_MINI.Common;
  const badge = RARITY_BADGE_MINI[rarity] ?? RARITY_BADGE_MINI.Common;

  const handleCardClick = () => {
    if (onZoom) onZoom();
  };

  const handleLongPress = () => {
    if (onLongPress) onLongPress();
  };

  const pressProps = (onZoom || onLongPress) ? getLongPressProps(handleLongPress, handleCardClick) : {};

  return (
    <div
      {...pressProps}
      className={`relative rounded-xl overflow-hidden border flex flex-col transition-all duration-300 ${
        glowing ? "border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.5)]" : "border-purple-700/50"
      } bg-gradient-to-b from-[#1a1540] to-[#0d0b1e]`}
      style={{ width: 88, minHeight: 120 }}
    >
      {image ? (
        <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <>
          <div className={`h-1.5 w-full bg-gradient-to-r ${grad}`} />
          <div className="flex-1 flex flex-col items-center justify-center p-1.5 gap-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center">
              {type === "Creature" ? <Sword size={14} className="text-amber-400" /> :
               type === "Item" ? <Package size={14} className="text-cyan-400" /> :
               <Zap size={14} className="text-emerald-400" />}
            </div>
            <p className="text-[9px] font-bold text-white text-center leading-tight line-clamp-2">{name}</p>
            <div className="flex items-center gap-1 w-full justify-between px-0.5">
              <span className={`text-[7px] px-1 py-0.5 rounded font-bold ${badge}`}>{rarity[0]}</span>
              <span className="text-[9px] font-black text-amber-400">{power}</span>
            </div>
          </div>
        </>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onSpeech) onSpeech();
          else speakWord(name);
        }}
        className="absolute bottom-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-indigo-700 hover:bg-indigo-600 flex items-center justify-center cursor-pointer transition-colors"
      >
        <Volume2 size={9} className="text-white" />
      </button>
    </div>
  );
}

// ─── LOGIN SCREEN ────────────────────────────────────────────────────────────

function LoginScreen({ onNavigate, onStudentLogin }: { onNavigate: (s: Screen) => void; onStudentLogin: (username: string) => void }) {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = () => {
    if (!username.trim()) {
      setErrorMsg("Please enter a username.");
      return;
    }
    setErrorMsg("");
    if (role === "student") {
      onStudentLogin(username.trim());
    } else {
      if (username.toLowerCase() === "admin" && password === "admin") {
        onNavigate("teacher-verify");
      } else {
        setErrorMsg("Teacher credentials invalid. (Use admin/admin for demo)");
      }
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-[#0d0b1e] overflow-hidden justify-center">
      {/* Background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-700/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-700/10 blur-3xl pointer-events-none" />
      
      <div className="flex flex-row items-center justify-between w-full h-full px-12 py-6 gap-8 relative z-10">
        
        {/* Left Column: Logo & Title */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 border-r border-purple-955/40 pr-8 h-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.4)] border border-purple-500/35">
            <Sword size={32} className="text-amber-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-['Cinzel'] text-2xl font-black text-white tracking-wide leading-none">Clash of</h1>
            <h1 className="font-['Cinzel'] text-2xl font-black text-amber-400 tracking-wide mt-1 leading-none">Words</h1>
          </div>
          <p className="text-[10px] text-purple-300 font-['Nunito'] tracking-widest uppercase mt-1">English Card Game<br/>Grades 5–6</p>
        </div>

        {/* Right Column: Login Form */}
        <div className="flex-1 flex flex-col justify-center gap-3.5 h-full max-w-[360px]">
          <div>
            <p className="text-[9px] text-purple-400 font-['Nunito'] font-bold mb-1.5 tracking-wider uppercase">I am a…</p>
            <div className="flex rounded-xl bg-[#1a1540] p-0.5 border border-purple-700/20">
              {(["student", "teacher"] as const).map((r) => (
                <button 
                  key={r} 
                  onClick={() => { setRole(r); setErrorMsg(""); }} 
                  className={`flex-1 py-1.5 rounded-lg font-['Nunito'] font-bold text-[10px] transition-all duration-200 ${role === r ? "bg-purple-600 text-white shadow-[0_2px_8px_rgba(124,58,237,0.4)]" : "text-purple-400 hover:text-white"}`}
                >
                  {r === "student" ? "⚔️ Student" : "🛡️ Teacher"}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="px-2.5 py-1.5 bg-red-955/30 border border-red-800/40 rounded-lg flex items-center gap-2">
              <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
              <span className="text-[9px] text-red-300 font-['Nunito'] leading-tight">{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] font-['Nunito'] font-bold text-purple-300 uppercase tracking-wider">
                {role === "student" ? "Username (Simulated ID)" : "Username"}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === "student" ? "e.g. Elena_Wizard" : "e.g. admin"}
                className="w-full bg-[#221d4a] border border-purple-700/30 rounded-xl px-3 py-1.5 text-white font-['Nunito'] text-xs placeholder:text-purple-600/70 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            {role === "teacher" && (
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-['Nunito'] font-bold text-purple-300 uppercase tracking-wider font-semibold">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full bg-[#221d4a] border border-purple-700/30 rounded-xl px-3 py-1.5 pr-9 text-white font-['Nunito'] text-xs placeholder:text-purple-600/70 focus:outline-none focus:border-purple-500 transition-all"
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-300 transition-colors">
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleLogin} 
            className="w-full py-2.5 rounded-xl font-['Nunito'] font-black text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_2px_12px_rgba(124,58,237,0.4)] transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            Enter the Arena <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── STUDENT HUB SCREEN (Dashboard, Code Redemption, Card Shop) ──────────────

interface StudentHubProps {
  onNavigate: (s: Screen) => void;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  codes: RewardCode[];
  setCodes: React.Dispatch<React.SetStateAction<RewardCode[]>>;
  catalog: Card[];
  history: MatchLog[];
  onZoomCard: (c: Card) => void;
}

function StudentHubScreen({ onNavigate, profile, setProfile, codes, setCodes, catalog, history, onZoomCard }: StudentHubProps) {
  const [showRedeem, setShowRedeem] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemStatus, setRedeemStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Shop state variables
  const [boughtPack, setBoughtPack] = useState<Card[] | null>(null);
  const [isOpeningPack, setIsOpeningPack] = useState(false);

  const [claimedLoot, setClaimedLoot] = useState<Card[] | null>(null);

  const claimStarterLoot = () => {
    const activeCards = catalog.filter(c => c.active !== false);
    
    // Helper to get a random rarity based on probabilities
    const getRandomRarity = (): Rarity => {
      const rand = Math.random() * 100;
      if (rand < 55) return "Common";      // 55%
      if (rand < 80) return "Uncommon";    // 25%
      if (rand < 92) return "Rare";        // 12%
      if (rand < 98) return "Epic";        // 6%
      return "Legendary";                  // 2%
    };

    const drawCard = (type: CardType): Card => {
      const rarity = getRandomRarity();
      let matches = activeCards.filter(c => c.type === type && c.rarity === rarity);
      if (matches.length === 0) {
        matches = activeCards.filter(c => c.type === type); // fallback
      }
      if (matches.length === 0) {
        matches = activeCards; // ultimate fallback
      }
      return matches[Math.floor(Math.random() * matches.length)];
    };

    const drawn: Card[] = [];
    // Draw 12 creatures, 5 items, 5 effects
    for (let i = 0; i < 12; i++) {
      drawn.push(drawCard("Creature"));
    }
    for (let i = 0; i < 5; i++) {
      drawn.push(drawCard("Item"));
    }
    for (let i = 0; i < 5; i++) {
      drawn.push(drawCard("Effect"));
    }

    setProfile(prev => ({
      ...prev,
      coins: prev.coins + 100,
      collection: drawn.map(c => c.id),
      activeDeck: drawn.slice(0, 20).map(c => c.id) // Automatically activate first 20 cards
    }));

    setClaimedLoot(drawn);
    playSynthSound("equip");
  };

  const buyPack = () => {
    if (profile.coins < 50) return;
    setProfile(prev => ({ ...prev, coins: prev.coins - 50 }));
    setIsOpeningPack(true);
    setTimeout(() => {
      const activeCards = catalog.filter(c => c.active !== false);
      const drawn: Card[] = [];
      for (let i = 0; i < 3; i++) {
        const rand = activeCards[Math.floor(Math.random() * activeCards.length)] || defaultCatalog[0];
        drawn.push(rand);
      }
      setProfile(prev => ({
        ...prev,
        collection: [...prev.collection, ...drawn.map(c => c.id)]
      }));
      setBoughtPack(drawn);
      setIsOpeningPack(false);
      playSynthSound("equip");
    }, 1500);
  };

  const handleRedeem = () => {
    const cleaned = redeemCode.trim().toUpperCase();
    if (!cleaned) return;
    const matched = codes.find(c => c.code.toUpperCase() === cleaned);
    if (!matched) {
      setRedeemStatus({ success: false, msg: "Código inválido." });
      playSynthSound("error");
      return;
    }
    if (matched.redeemed) {
      setRedeemStatus({ success: false, msg: "Code already claimed." });
      playSynthSound("error");
      return;
    }
    if (matched.rewardType === "coins") {
      setProfile(prev => ({ ...prev, coins: prev.coins + matched.rewardValue }));
      setRedeemStatus({ success: true, msg: "+" + matched.rewardValue + " coins!" });
    } else if (matched.rewardType === "pack") {
      const activeCards = catalog.filter(c => c.active !== false);
      const drawn: Card[] = [];
      for (let i = 0; i < 3; i++) {
        const rand = activeCards[Math.floor(Math.random() * activeCards.length)] || defaultCatalog[0];
        drawn.push(rand);
      }
      setProfile(prev => ({
        ...prev,
        collection: [...prev.collection, ...drawn.map(c => c.id)]
      }));
      setBoughtPack(drawn);
      setRedeemStatus({ success: true, msg: "¡Reclamaste 1 Booster Pack!" });
    }
    setCodes(prev => prev.map(c => c.code.toUpperCase() === cleaned ? { ...c, redeemed: true } : c));
    setRedeemCode("");
    playSynthSound("equip");
  };

  return (
    <div className="relative flex flex-col w-full h-full text-white bg-gradient-to-br from-[#0c0a21] via-[#16123d] to-[#0c0a21] overflow-hidden select-none">
      
      {/* Background illustration overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-700 via-transparent to-transparent" />
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Top bar (Header) */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-2 border-b border-purple-900/30 backdrop-blur-sm bg-black/10">
        
        {/* Left side: Avatar and student name/level */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border border-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            <span className="text-xl">🧙‍♀️</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-['Nunito'] font-black text-sm text-white">{profile.username}</span>
              <span className="text-[7px] font-black bg-purple-900 text-purple-200 px-1 py-0.5 rounded border border-purple-700/50 uppercase">Explorer Lvl 5</span>
            </div>
            <p className="text-[8px] text-purple-400 mt-0.5 uppercase tracking-widest font-bold font-sans">Clash of Words Dashboard</p>
          </div>
        </div>

        {/* Right side: Coins, Shop, Redeem, Help */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-900/30 px-2.5 py-1 rounded-xl shadow-inner">
            <span className="text-xs">🪙</span>
            <span className="text-xs font-black text-amber-300 font-['DM_Mono']">{profile.coins}</span>
          </div>
          
          <button 
            onClick={() => { setShowShop(true); setBoughtPack(null); }}
            className="p-2 rounded-xl bg-gradient-to-b from-[#2a2364] to-[#1c174b] border border-purple-700/30 hover:border-purple-500/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            title="Shop"
          >
            <ShoppingBag size={14} className="text-purple-300" />
          </button>
          
          <button 
            onClick={() => { setShowRedeem(true); setRedeemStatus(null); }}
            className="p-2 rounded-xl bg-gradient-to-b from-[#2a2364] to-[#1c174b] border border-purple-700/30 hover:border-purple-500/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            title="Redeem Code"
          >
            <Gift size={14} className="text-amber-400" />
          </button>
          
          <button 
            onClick={() => setShowRules(true)}
            className="p-2 rounded-xl bg-gradient-to-b from-indigo-700 to-indigo-900 border border-indigo-500/30 hover:border-indigo-400/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md text-indigo-200 cursor-pointer"
            title="Help / Rules"
          >
            <span className="font-bold text-xs font-['Nunito']">?</span>
          </button>

          <button onClick={() => onNavigate("login")} className="w-8 h-8 rounded-xl bg-red-950/40 border border-red-900/30 flex items-center justify-center hover:bg-red-900/30 transition-colors cursor-pointer">
            <LogOut size={13} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Main Area: Giant PLAY CLASH button */}
      <div className="flex-1 flex items-center justify-center p-4 z-10 relative">
        <button
          onClick={() => onNavigate("game-mat")}
          className="relative group w-[220px] h-[75px] rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 border-3 border-amber-300 shadow-[0_8px_32px_rgba(245,158,11,0.5)] active:scale-95 hover:brightness-110 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/5 opacity-10 bg-[repeating-linear-gradient(45deg,currentColor_0,currentColor_1px,transparent_0,transparent_50%)] bg-[size:8px_8px]" />
          <Swords size={28} className="text-amber-955 animate-bounce group-hover:scale-110 transition-transform" />
          <div className="text-left flex flex-col leading-none">
            <span className="font-['Cinzel'] font-black text-[#1e1402] text-xl tracking-wider">PLAY CLASH</span>
            <span className="font-['Nunito'] font-bold text-[9px] text-[#4d2f00] uppercase tracking-widest mt-1">Enter Arena Battle</span>
          </div>
        </button>
      </div>

      {/* Bottom square buttons */}
      <div className="relative z-10 px-6 pb-4 pt-1 flex justify-center gap-5">
        
        {/* Collection button */}
        <button 
          onClick={() => setShowCollection(true)}
          className="w-[135px] h-[65px] rounded-2xl bg-[#1e184e]/70 border border-purple-700/40 hover:border-purple-500/60 p-2.5 flex items-center gap-2 hover:-translate-y-0.5 active:scale-98 transition-all text-left shadow-lg cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-900/60 flex items-center justify-center flex-shrink-0">
            <BookOpen size={18} className="text-purple-300" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-['Nunito'] font-black text-white text-xs leading-none">Collection</span>
            <span className="font-['Nunito'] text-[8px] text-purple-400 mt-1 uppercase font-bold tracking-wider">{profile.collection.length} Cards</span>
          </div>
        </button>

        {/* Deck Builder button */}
        <button 
          onClick={() => onNavigate("deck-builder")}
          className="w-[135px] h-[65px] rounded-2xl bg-[#1e184e]/70 border border-purple-700/40 hover:border-purple-500/60 p-2.5 flex items-center gap-2 hover:-translate-y-0.5 active:scale-98 transition-all text-left shadow-lg cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-900/60 flex items-center justify-center flex-shrink-0">
            <Layers size={18} className="text-indigo-300" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-['Nunito'] font-black text-white text-xs leading-none">Deck Builder</span>
            <span className="font-['Nunito'] text-[8px] text-indigo-400 mt-1 uppercase font-bold tracking-wider">{profile.activeDeck.length} Active</span>
          </div>
        </button>

        {/* Progress button */}
        <button 
          onClick={() => setShowProgress(true)}
          className="w-[135px] h-[65px] rounded-2xl bg-[#1e184e]/70 border border-purple-700/40 hover:border-purple-500/60 p-2.5 flex items-center gap-2 hover:-translate-y-0.5 active:scale-98 transition-all text-left shadow-lg cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-900/60 flex items-center justify-center flex-shrink-0">
            <Trophy size={18} className="text-emerald-300" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-['Nunito'] font-black text-white text-xs leading-none">Progress</span>
            <span className="font-['Nunito'] text-[8px] text-emerald-400 mt-1 uppercase font-bold tracking-wider">{profile.wins} Wins</span>
          </div>
        </button>

      </div>

      {/* Rules Modal Dialog */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#150f35] border border-indigo-500/50 p-5 shadow-2xl flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h3 className="font-['Nunito'] font-black text-white text-base">Rules of Clash of Words</h3>
              </div>
              <button onClick={() => setShowRules(false)} className="w-7 h-7 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 hover:text-white border border-indigo-800/40 cursor-pointer">
                <X size={14} />
              </button>
            </div>
            
            <div className="text-xs text-indigo-200 flex flex-col gap-3 leading-relaxed">
              <p>Clash of Words is an educational cards game. Here are the simple rules to guide your deck builder and battles:</p>
              
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <div className="bg-[#1f174e]/40 p-2.5 rounded-xl border border-indigo-900/40">
                  <h4 className="font-bold text-amber-300 text-[10px] uppercase tracking-wider mb-1">1. Build your Deck</h4>
                  <p className="text-[9px] text-indigo-300">You must select between 20 and 25 cards in the <strong>Deck Builder</strong>. Cards are unlocked by spending coins in the Shop.</p>
                </div>
                <div className="bg-[#1f174e]/40 p-2.5 rounded-xl border border-indigo-900/40">
                  <h4 className="font-bold text-amber-300 text-[10px] uppercase tracking-wider mb-1">2. Draw & Play Cards</h4>
                  <p className="text-[9px] text-indigo-300">During a duel, draw cards. Drag <strong>Item</strong> or <strong>Effect</strong> cards from your hand onto your Creature in the center to increase its power.</p>
                </div>
                <div className="bg-[#1f174e]/40 p-2.5 rounded-xl border border-indigo-900/40">
                  <h4 className="font-bold text-amber-300 text-[10px] uppercase tracking-wider mb-1">3. Clashing Rules</h4>
                  <p className="text-[9px] text-indigo-300">Compare active cards. <strong>Higher Rarity</strong> wins first. On rarity ties, <strong>Higher Power</strong> wins. Otherwise, a tie-breaker triggers.</p>
                </div>
                <div className="bg-[#1f174e]/40 p-2.5 rounded-xl border border-indigo-900/40">
                  <h4 className="font-bold text-amber-300 text-[10px] uppercase tracking-wider mb-1">4. Hear Pronunciation</h4>
                  <p className="text-[9px] text-indigo-300">Practice your English vocabulary! <strong>Long-press (hold down)</strong> any card to hear its system-spoken English pronunciation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collection Modal Dialog */}
      {showCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-[#150f35] border border-purple-600/50 p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="text-purple-400" size={18} />
                <h3 className="font-['Nunito'] font-black text-white text-base">Your Vocabulary Collection ({profile.collection.length} Cards)</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowShop(true); setBoughtPack(null); }}
                  className="px-2.5 py-1 bg-amber-500 text-amber-950 rounded-lg text-[10px] font-bold hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  🛒 Buy Packs (50🪙)
                </button>
                <button onClick={() => setShowCollection(false)} className="w-7 h-7 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 hover:text-white cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            </div>
            
            <p className="text-[10px] text-purple-400 leading-tight">Touch any card to zoom, or hold down to hear its system-spoken pronunciation. Spend coins in the Shop to expand your vocabulary library.</p>
            
            {/* Scrollable list of cards in grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-6 gap-2 pr-1" style={{ scrollbarWidth: "none" }}>
              {profile.collection.map((id, index) => {
                const cardObj = catalog.find(c => c.id === id);
                if (!cardObj) return null;
                return (
                  <div 
                    key={`${id}-${index}`} 
                    className="scale-90 transform-gpu hover:scale-95 transition-transform"
                  >
                    <MiniCard 
                      {...cardObj} 
                      onZoom={() => onZoomCard(cardObj)}
                      onLongPress={() => speakWord(cardObj.name)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Progress & Stats Modal Dialog */}
      {showProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#150f35] border border-emerald-600/50 p-5 shadow-2xl flex flex-col gap-3.5 max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2">
              <div className="flex items-center gap-2">
                <Trophy className="text-emerald-400" size={18} />
                <h3 className="font-['Nunito'] font-black text-white text-base">Your Clash Progress</h3>
              </div>
              <button onClick={() => setShowProgress(false)} className="w-7 h-7 rounded-full bg-emerald-950/30 flex items-center justify-center text-emerald-400 hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-3 gap-2 bg-[#1b2b2b]/40 border border-emerald-900/40 rounded-xl p-3 text-center">
              <div>
                <p className="text-[18px] font-black text-amber-400 font-['DM_Mono'] leading-none">{profile.trophies}</p>
                <p className="text-[8px] text-emerald-400 uppercase tracking-widest mt-1">Trophies</p>
              </div>
              <div className="border-x border-emerald-900/30">
                <p className="text-[18px] font-black text-white font-['DM_Mono'] leading-none">{profile.wins}W / {profile.losses}L</p>
                <p className="text-[8px] text-emerald-400 uppercase tracking-widest mt-1">Clashes Record</p>
              </div>
              <div>
                <p className="text-[18px] font-black text-emerald-300 font-['DM_Mono'] leading-none">
                  {profile.wins + profile.losses > 0 ? `${Math.round((profile.wins / (profile.wins + profile.losses)) * 100)}%` : "0%"}
                </p>
                <p className="text-[8px] text-emerald-400 uppercase tracking-widest mt-1">Win Rate</p>
              </div>
            </div>

            {/* Recess Playroom Matches log */}
            <div className="flex-1 flex flex-col min-h-0">
              <h4 className="font-['Nunito'] font-black text-white text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🏫 Recess Arena History Logs</span>
              </h4>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1" style={{ scrollbarWidth: "none" }}>
                {history.length === 0 ? (
                  <div className="py-6 text-center border border-dashed border-emerald-900/30 rounded-xl flex-1 flex items-center justify-center">
                    <p className="text-[10px] text-emerald-600">No match records found.</p>
                  </div>
                ) : (
                  history.map((log) => (
                    <div key={log.id} className="p-2 bg-[#1b2b2b]/20 border border-emerald-900/30 rounded-xl flex justify-between items-center text-[10px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={log.outcome === "win" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {log.outcome === "win" ? "🏆 Win" : "💀 Loss"}
                          </span>
                          <span className="text-[8px] text-slate-500">{log.date}</span>
                        </div>
                        <p className="text-[9px] text-indigo-300 mt-0.5">Trophy Score: {log.playerTrophiesWon} - {log.opponentTrophiesWon}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400">Trophies before/after</span>
                        <p className="text-xs font-black font-['DM_Mono'] text-amber-400">{log.trophiesBefore} ➔ {log.trophiesAfter}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Modal Dialog */}
      {showRedeem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#150f35] border border-purple-600/50 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="text-amber-400" size={18} />
                <h3 className="font-['Nunito'] font-black text-white text-base">Redeem Reward Code</h3>
              </div>
              <button onClick={() => setShowRedeem(false)} className="w-7 h-7 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            </div>
            
            <p className="text-xs text-purple-300">Enter a code distributed by your teacher to claim extra coins or random card packs.</p>

            {redeemStatus && (
              <div className={`px-3 py-2 rounded-xl border text-xs font-['Nunito'] flex items-center gap-2 ${redeemStatus.success ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-300" : "bg-red-955/40 border-red-800/40 text-red-300"}`}>
                {redeemStatus.success ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertCircle size={14} className="text-red-400" />}
                <span>{redeemStatus.msg}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                placeholder="e.g. CLASH2026"
                className="w-full bg-[#221d4a] border border-purple-700/40 rounded-xl px-4 py-2.5 text-white font-['DM_Mono'] text-sm tracking-widest placeholder:text-purple-600 uppercase focus:outline-none focus:border-purple-500 transition-all text-center"
              />
            </div>

            <button onClick={handleRedeem} className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-['Nunito'] font-black text-sm active:scale-95 transition-all">
              Claim Reward
            </button>
          </div>
        </div>
      )}

      {/* Shop Modal Dialog */}
      {showShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
          <div className="w-full max-w-sm rounded-2xl bg-[#150f35] border border-purple-600/50 p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-amber-400" size={18} />
                <h3 className="font-['Nunito'] font-black text-white text-base">Vocabulary Card Shop</h3>
              </div>
              <button onClick={() => setShowShop(false)} className="w-7 h-7 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-3 flex justify-between items-center">
              <span className="text-xs text-purple-300">Your Balance:</span>
              <span className="text-sm font-black text-amber-300 font-['DM_Mono']">🪙 {profile.coins} Coins</span>
            </div>

            {/* Shop Product */}
            {!boughtPack ? (
              <div className="border border-purple-700/30 rounded-2xl p-4 flex flex-col items-center bg-[#1d164f] text-center gap-3 relative overflow-hidden">
                <div className="w-20 h-24 rounded-xl bg-gradient-to-b from-purple-500 to-indigo-700 border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex flex-col justify-between p-2 relative">
                  <div className="absolute inset-0 bg-white/5 opacity-20 bg-[repeating-linear-gradient(45deg,currentColor_0,currentColor_1px,transparent_0,transparent_50%)] bg-[size:6px_6px]" />
                  <span className="text-[8px] text-amber-300 font-bold tracking-wider uppercase text-center border-b border-amber-400/20 pb-1">CLASH PACK</span>
                  <Sword size={26} className="text-amber-300 mx-auto" />
                  <span className="text-[7px] text-amber-100 font-semibold text-center mt-1">3 Random Cards</span>
                </div>
                <div>
                  <h4 className="font-['Nunito'] font-black text-white text-sm">Vocabulary Booster Pack</h4>
                  <p className="text-[10px] text-purple-400 mt-0.5">Expands your collection with 3 randomly selected words from the active catalog.</p>
                </div>
                
                <button
                  onClick={buyPack}
                  disabled={profile.coins < 50 || isOpeningPack}
                  className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${profile.coins >= 50 && !isOpeningPack ? "bg-amber-500 hover:brightness-110 text-amber-955 active:scale-95" : "bg-purple-955/60 text-purple-600 border border-purple-900/50 cursor-not-allowed"}`}
                >
                  {isOpeningPack ? "Opening..." : "Buy Pack for 50 Coins"}
                </button>
              </div>
            ) : (
              // Pack Opening Results
              <div className="flex flex-col gap-4 animate-scale-up">
                <p className="text-xs font-black text-emerald-400 text-center uppercase tracking-wider">🎉 Pack Opened Successfully!</p>
                <div className="flex gap-2 justify-center">
                  {boughtPack.map((card, i) => (
                    <div key={i} className="animate-fade-in-delayed">
                      <MiniCard {...card} onSpeech={() => speakWord(card.name)} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setBoughtPack(null)}
                  className="w-full py-2.5 bg-purple-700 text-white rounded-xl font-bold text-xs active:scale-95"
                >
                  Buy Another Pack
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Starter Loot Claim Overlay */}
      {profile.collection.length === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-[500px] bg-gradient-to-b from-[#1c1445] to-[#0b0825] border-2 border-amber-500 rounded-3xl p-4 shadow-2xl flex flex-row items-center text-center gap-4 relative animate-scale-up">
            {/* Left Column: Icon & Welcoming */}
            <div className="flex-1 flex flex-col items-center text-center gap-2 border-r border-purple-900/30 pr-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg border border-amber-300">
                <Gift size={24} className="text-white animate-bounce" />
              </div>
              <h3 className="font-['Cinzel'] text-base font-black text-amber-400 leading-none">Starter Loot!</h3>
              <p className="text-[9px] text-purple-200 leading-normal mt-1">
                Hello, <strong>{profile.username}</strong>! To start battling in the Arena, you need to claim your free chest:
              </p>
            </div>
            
            {/* Right Column: Loot contents & button */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex gap-2 justify-center">
                <div className="bg-[#241a54]/50 border border-purple-900/40 rounded-xl px-2.5 py-1.5 flex flex-col items-center w-[90px] shadow-sm">
                  <span className="text-base">🪙</span>
                  <span className="font-['DM_Mono'] text-[9px] font-black text-amber-300">+100 Coins</span>
                </div>
                <div className="bg-[#241a54]/50 border border-purple-900/40 rounded-xl px-2.5 py-1.5 flex flex-col items-center w-[90px] shadow-sm">
                  <span className="text-base">🃏</span>
                  <span className="font-['Nunito'] text-[9px] font-black text-purple-300">22 Cards</span>
                </div>
              </div>
              <button
                onClick={claimStarterLoot}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 border border-amber-300 text-white rounded-xl font-['Nunito'] font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles size={13} /> Open Chest!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claimed Loot Summary Overlay */}
      {claimedLoot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-3 animate-fade-in">
          <div className="w-[520px] bg-gradient-to-b from-[#1b1544] to-[#090720] border border-purple-500/50 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 max-h-[90vh]">
            <div className="text-center">
              <h3 className="font-['Cinzel'] text-base font-black text-amber-400">🎁 Loot Claimed!</h3>
              <p className="text-[8px] text-purple-400 uppercase font-black tracking-wider mt-0.5">Your 22 starter cards (Deck ready to play)</p>
            </div>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-7 gap-1.5 p-1.5 bg-black/20 rounded-xl border border-purple-900/30 min-h-0" style={{ scrollbarWidth: "none" }}>
              {claimedLoot.map((c, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="scale-[0.6] origin-top transform-gpu">
                    <MiniCard {...c} />
                  </div>
                  <span className="text-[6px] font-black text-purple-300 truncate max-w-[50px] mt-[-28px] text-center leading-none">{c.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setClaimedLoot(null)}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-['Nunito'] font-black text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md flex-shrink-0"
            >
              Understood, let's play!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── DECK BUILDER SCREEN ──────────────────────────────────────────────────────

interface DeckBuilderProps {
  onNavigate: (s: Screen) => void;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  catalog: Card[];
}

function DeckBuilderScreen({ onNavigate, profile, setProfile, catalog }: DeckBuilderProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(profile.activeDeck));
  const [previewCard, setPreviewCard] = useState<Card | null>(null);

  const activeCardsCount = selected.size;
  const valid = activeCardsCount >= 20 && activeCardsCount <= 25;

  const toggleCard = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size < 25) {
          next.add(id);
        }
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!valid) return;
    setProfile(prev => ({
      ...prev,
      activeDeck: Array.from(selected)
    }));
    onNavigate("student-hub");
  };

  // Group collection to show available copies
  const collectionList = profile.collection.map(id => catalog.find(c => c.id === id)).filter((c): c is Card => !!c && c.active !== false);

  // Set default preview card
  useEffect(() => {
    if (collectionList.length > 0 && !previewCard) {
      setPreviewCard(collectionList[0]);
    }
  }, [collectionList, previewCard]);

  return (
    <div className="flex flex-col h-full bg-[#0d0b1e] overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-3 pb-2 flex-shrink-0">
        <button onClick={() => onNavigate("student-hub")} className="w-8 h-8 rounded-lg bg-[#221d4a] flex items-center justify-center border border-purple-700/30 hover:bg-purple-900/30 transition-colors">
          <ChevronLeft size={14} className="text-purple-400" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito'] text-sm font-black text-white leading-none">Deck Builder</h2>
          <p className="font-['Nunito'] text-[8px] text-purple-400 mt-0.5">Select your battle deck</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!valid}
          className={`px-3 py-1 rounded-lg font-['Nunito'] font-bold text-xs text-white transition-all ${valid ? "bg-purple-600 hover:bg-purple-500 active:scale-95" : "bg-purple-955 text-purple-700 cursor-not-allowed border border-purple-900/50"}`}
        >
          Save
        </button>
      </div>

      {/* Validation Message */}
      <div className={`mx-5 mb-2 rounded-xl px-4 py-1.5 flex items-center gap-2.5 border flex-shrink-0 ${valid ? "bg-emerald-900/30 border-emerald-700/50" : activeCardsCount < 20 ? "bg-amber-900/30 border-amber-700/50" : "bg-red-900/30 border-red-700/50"}`}>
        {valid ? <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" /> : <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />}
        <div className="flex-1">
          <p className={`font-['Nunito'] font-bold text-xs ${valid ? "text-emerald-300" : "text-amber-300"}`}>{activeCardsCount} / 25 cards selected</p>
          <p className="font-['Nunito'] text-[8px] text-purple-400">Min 20–25 cards required to play</p>
        </div>
        <div className={`text-xs font-black font-['Nunito'] ${valid ? "text-emerald-400" : activeCardsCount < 20 ? "text-amber-400" : "text-red-400"}`}>
          {valid ? "✓ Ready" : activeCardsCount < 20 ? `+${20 - activeCardsCount}` : "Max"}
        </div>
      </div>

      {/* Main split view */}
      <div className="flex-1 flex flex-row px-5 pb-4 gap-4 overflow-hidden min-h-0">
        
        {/* Left Side: Card Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-5 gap-2 pr-1" style={{ scrollbarWidth: "none" }}>
          {collectionList.length === 0 ? (
            <div className="col-span-5 flex flex-col items-center justify-center py-12 text-center">
              <Layers className="text-purple-800 mb-2" size={32} />
              <p className="text-xs text-purple-400 font-bold">Your collection is empty!</p>
              <p className="text-[10px] text-purple-600 mt-1">Buy vocabulary packs in the Shop.</p>
            </div>
          ) : (
            collectionList.map((c, index) => {
              const isSel = selected.has(c.id);
              return (
                <div
                  key={`${c.id}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    toggleCard(c.id);
                    setPreviewCard(c);
                  }}
                  onMouseEnter={() => setPreviewCard(c)}
                  onKeyDown={(e) => e.key === "Enter" && toggleCard(c.id)}
                  className={`relative rounded-xl overflow-hidden border transition-all cursor-pointer ${isSel ? "border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)] scale-[1.02]" : "border-purple-700/40 opacity-70 hover:opacity-100"}`}
                >
                  <MiniCard {...c} glowing={isSel} onSpeech={() => speakWord(c.name)} />
                  {isSel && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center">
                      <CheckCircle size={8} className="text-amber-900" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Preview Panel */}
        <div className="w-[180px] flex flex-col items-center bg-[#151138]/50 border border-purple-800/20 rounded-2xl p-3 shadow-inner flex-shrink-0 justify-center">
          {previewCard ? (
            <div className="w-full flex flex-col items-center text-center gap-2">
              <div className="scale-90 transform-gpu my-1">
                <FullCard card={previewCard} onZoom={() => {}} />
              </div>
              <div className="w-full">
                <h4 className="font-['Nunito'] font-black text-white text-xs leading-tight truncate">{previewCard.name}</h4>
                <p className="text-[7.5px] text-purple-400 mt-0.5 uppercase tracking-wider font-black">{previewCard.type} · {previewCard.rarity}</p>
                <div className="bg-[#1b1742] border border-purple-900/30 rounded-xl p-2 mt-2 text-left">
                  <p className="text-[8.5px] text-purple-200 italic leading-snug">
                    {previewCard.ability || "This vocabulary card is part of your collection. Equip it to play in the Arena."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <Layers className="text-purple-900/40 mx-auto mb-2" size={24} />
              <p className="text-[9px] text-purple-500 font-bold uppercase tracking-wider">Hover / Tap card</p>
              <p className="text-[8px] text-purple-700 mt-1">To preview full descriptions here</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── GAME MAT SCREEN (AUTOMATED MATCH ARENA) ─────────────────────────────────

interface GameMatProps {
  onNavigate: (s: Screen) => void;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  catalog: Card[];
  setMatchHistory: React.Dispatch<React.SetStateAction<MatchLog[]>>;
  onZoomCard: (c: Card) => void;
  showToast: (msg: string) => void;
}

function GameMatScreen({ onNavigate, profile, setProfile, catalog, setMatchHistory, onZoomCard, showToast }: GameMatProps) {
  // Check if player has a valid deck (20-25 cards)
  const isDeckValid = profile.activeDeck.length >= 20 && profile.activeDeck.length <= 25;

  // Deck states
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [opponentDeck, setOpponentDeck] = useState<Card[]>([]);

  const [playerActive, setPlayerActive] = useState<Card | null>(null);
  const [opponentActive, setOpponentActive] = useState<Card | null>(null);

  const [equippedItem, setEquippedItem] = useState<Card | null>(null);
  const [opponentItem, setOpponentItem] = useState<Card | null>(null);

  const [playerDiscard, setPlayerDiscard] = useState<Card[]>([]);
  const [opponentDiscard, setOpponentDiscard] = useState<Card[]>([]);

  const [playerTrophies, setPlayerTrophies] = useState<Card[]>([]);
  const [opponentTrophies, setOpponentTrophies] = useState<Card[]>([]);

  const [playerEffects, setPlayerEffects] = useState<Card[]>([]);
  const [opponentEffects, setOpponentEffects] = useState<Card[]>([]);

  const [tiedCards, setTiedCards] = useState<Card[]>([]);

  // Match management states
  const [matchPhase, setMatchPhase] = useState<"idle" | "ready" | "clashing" | "tie_breaker" | "resolved" | "game_over">("idle");
  const [clashResult, setClashResult] = useState<{ winner: "player" | "opponent" | "tie"; reason: string } | null>(null);
  const [matchOutcome, setMatchOutcome] = useState<{
    outcome: "win" | "loss";
    playerTrophies: number;
    opponentTrophies: number;
    coinsEarned: number;
    trophyChange: number;
  } | null>(null);

  const [autoplay, setAutoplay] = useState(false);

  // Drag and Drop & click selection states
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedHandCard, setSelectedHandCard] = useState<Card | null>(null);
  const [floatPowerText, setFloatPowerText] = useState("");

  // Tutorial state
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

  // Initial Value Effects (Core values permanently active)
  const playerInitialValue: Card = { id: "p-iv", name: "Truth Seeker", type: "Value", rarity: "Legendary", power: 9, englishClass: "Value" };
  const opponentInitialValue: Card = { id: "o-iv", name: "Honor Guard", type: "Value", rarity: "Epic", power: 7, englishClass: "Value" };

  // Setup match
  const startNewMatch = () => {
    if (!isDeckValid) return;

    // Load active deck from profile
    const pDeck = profile.activeDeck.map(id => catalog.find(c => c.id === id)).filter((c): c is Card => !!c);
    const shuffledP = [...pDeck].sort(() => Math.random() - 0.5);

    // AI Opponent Deck Generator (20 cards)
    const activeCatalog = catalog.filter(c => c.active !== false);
    const oDeck = [];
    for (let i = 0; i < 20; i++) {
      const rand = activeCatalog[Math.floor(Math.random() * activeCatalog.length)] || defaultCatalog[0];
      oDeck.push({ ...rand, id: 'opp-card-' + i + '-' + Date.now() });
    }

    setPlayerDeck(shuffledP);
    setOpponentDeck(oDeck);
    setPlayerActive(null);
    setOpponentActive(null);
    setEquippedItem(null);
    setOpponentItem(null);
    setPlayerTrophies([]);
    setOpponentTrophies([]);
    setPlayerDiscard([]);
    setOpponentDiscard([]);
    setPlayerEffects([]);
    setOpponentEffects([]);
    setTiedCards([]);
    setClashResult(null);
    setMatchOutcome(null);
    setSelectedHandCard(null);
    setFloatPowerText("");
    setMatchPhase("ready");
  };

  // Run initial match setup
  useEffect(() => {
    if (isDeckValid && matchPhase === "idle") {
      startNewMatch();
    }
  }, [isDeckValid, matchPhase]);

  // Check for tutorial trigger
  useEffect(() => {
    const completed = localStorage.getItem("cow_tutorial_completed");
    if (!completed && matchPhase === "ready") {
      setTutorialStep(1);
    }
  }, [matchPhase]);

  // Player hand drawn automatically/manually (Limit of 5 cards)
  const [playerHand, setPlayerHand] = useState<Card[]>([]);

  // Draw card helper
  const drawCardToHand = () => {
    if (playerDeck.length === 0) {
      showToast("No cards left in the draw deck.");
      return;
    }
    if (playerHand.length >= 5) {
      showToast("Your hand is full (limit of 5 cards).");
      return;
    }
    if (tutorialStep === 1) {
      const creature = playerDeck.find(c => c.type === "Creature") || catalog.find(c => c.type === "Creature") || defaultCatalog[0];
      setPlayerActive(creature);

      const itemCard = playerDeck.find(c => c.type === "Item" || c.type === "Effect") || catalog.find(c => c.type === "Item") || defaultCatalog[1];
      
      setPlayerDeck(prev => prev.filter(c => c.id !== creature.id && c.id !== itemCard.id));
      setPlayerHand(prev => [...prev, itemCard]);

      setTutorialStep(2);
      playSynthSound("equip");
      return;
    }

    const drawn = playerDeck[0];
    setPlayerDeck(prev => prev.slice(1));
    setPlayerHand(prev => [...prev, drawn]);
    playSynthSound("equip");
  };

  // Play card from hand onto creature (buffs active creature)
  const playCardFromHand = (card: Card) => {
    if (!playerActive) {
      showToast("You must have an active creature to equip this card.");
      playSynthSound("error");
      return;
    }
    if (card.type !== "Item" && card.type !== "Effect") {
      showToast("You can only equip Item or Effect cards.");
      playSynthSound("error");
      return;
    }
    // Remove card from hand
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    
    // Play chime sound and power text animation
    playSynthSound("equip");
    setFloatPowerText('+' + card.power + ' Power');
    setTimeout(() => setFloatPowerText(""), 1500);

    if (card.type === "Item") {
      setEquippedItem(card);
    } else {
      setPlayerEffects(prev => [...prev, card]);
    }
    if (tutorialStep === 2) {
      setTutorialStep(3);
    }
  };

  // Resolve current turn clash
  const playClashTurn = () => {
    if (playerDeck.length === 0 || opponentDeck.length === 0) {
      handleMatchEnd();
      return;
    }

    setMatchPhase("clashing");
    setClashResult(null);

    let currentPActive = playerActive;
    let currentOActive = opponentActive;

    if (matchPhase === "resolved") {
      currentPActive = null;
      currentOActive = null;
      setPlayerActive(null);
      setOpponentActive(null);
    }

    // Draw top cards
    const pCard = currentPActive || playerDeck[0];
    const oCard = currentOActive || opponentDeck[0];

    // Remove from deck if they were not already active
    if (!currentPActive) setPlayerDeck(prev => prev.slice(1));
    if (!currentOActive) setOpponentDeck(prev => prev.slice(1));

    setPlayerActive(pCard);
    setOpponentActive(oCard);

    // TTS pronunciation trigger
    speakWord(pCard.name);

    // Opponent AI Mock Card Actions (chance to play item/effects)
    const aiUsesItem = Math.random() > 0.65;
    let aiItemCard = null;
    if (aiUsesItem) {
      const items = catalog.filter(c => c.type === "Item" && c.active !== false);
      if (items.length > 0) {
        aiItemCard = items[Math.floor(Math.random() * items.length)];
        setOpponentItem(aiItemCard);
      }
    } else {
      setOpponentItem(null);
    }

    const aiUsesEffect = Math.random() > 0.75;
    if (aiUsesEffect) {
      const effects = catalog.filter(c => c.type === "Effect" && c.active !== false);
      if (effects.length > 0) {
        const aiEffCard = effects[Math.floor(Math.random() * effects.length)];
        setOpponentEffects([aiEffCard]);
      }
    } else {
      setOpponentEffects([]);
    }

    // Calculate final battle powers
    let pPower = pCard.power;
    if (equippedItem) pPower += equippedItem.power;
    pPower += playerEffects.length * 2; // Each effect adds +2 power

    let oPower = oCard.power;
    if (aiItemCard) oPower += aiItemCard.power;
    if (aiUsesEffect) oPower += 2; // +2 for effect

    // Comparison calculations
    const rarityWeights = { Common: 1, Uncommon: 2, Rare: 3, Epic: 4, Legendary: 5 };
    const pRarityVal = rarityWeights[pCard.rarity] || 1;
    const oRarityVal = rarityWeights[oCard.rarity] || 1;

    let turnWinner = "tie";
    let detailMsg = "";

    if (pRarityVal > oRarityVal) {
      turnWinner = "player";
      detailMsg = pCard.name + ' (' + pCard.rarity + ') defeats ' + oCard.name + ' (' + oCard.rarity + ') by Rarity!';
    } else if (pRarityVal < oRarityVal) {
      turnWinner = "opponent";
      detailMsg = oCard.name + ' (' + oCard.rarity + ') defeats ' + pCard.name + ' (' + pCard.rarity + ') by Rarity!';
    } else {
      // Rarity Tie! Compare Power (which includes item/effect buffs)
      if (pPower > oPower) {
        turnWinner = "player";
        detailMsg = 'Rarity Tie (' + pCard.rarity + ')! ' + pCard.name + ' (' + pPower + ' Power) defeats ' + oCard.name + ' (' + oPower + ' Power) via Power boost!';
      } else if (pPower < oPower) {
        turnWinner = "opponent";
        detailMsg = 'Rarity Tie (' + oCard.rarity + ')! ' + oCard.name + ' (' + oPower + ' Power) defeats ' + pCard.name + ' (' + pPower + ' Power) via Power boost!';
      } else {
        // Power Tie! Compare Grammatical Class (Category)
        if (pCard.englishClass === oCard.englishClass) {
          turnWinner = "tie";
          detailMsg = 'Total Tie! Same Rarity (' + pCard.rarity + '), Power (' + pPower + ') and Class (' + pCard.englishClass + ')! Triggers Tie-Breaker!';
        } else {
          turnWinner = "tie";
          detailMsg = 'Tie! Same Rarity and Power. Triggers Tie-Breaker!';
        }
      }
    }

    // Accumulate all card entries in clash pool
    const matchPool = [pCard, oCard];
    if (equippedItem) matchPool.push(equippedItem);
    if (aiItemCard) matchPool.push(aiItemCard);

    // Timeout to simulate card animation resolution
    setTimeout(() => {
      if (turnWinner === "player") {
        setPlayerDiscard(prev => [...prev, pCard]);
        if (equippedItem) setPlayerDiscard(prev => [...prev, equippedItem]);

        setPlayerTrophies(prev => [...prev, oCard, ...tiedCards]);
        if (aiItemCard) setPlayerTrophies(prev => [...prev, aiItemCard]);

        setTiedCards([]);
        setEquippedItem(null);
        setClashResult({ winner: "player", reason: detailMsg });
        setMatchPhase("resolved");
      } else if (turnWinner === "opponent") {
        setOpponentDiscard(prev => [...prev, oCard]);
        if (aiItemCard) setOpponentDiscard(prev => [...prev, aiItemCard]);

        setOpponentTrophies(prev => [...prev, pCard, ...tiedCards]);
        if (equippedItem) setOpponentTrophies(prev => [...prev, equippedItem]);

        setTiedCards([]);
        setEquippedItem(null);
        setClashResult({ winner: "opponent", reason: detailMsg });
        setMatchPhase("resolved");
      } else {
        // It's a Tie! Card stack remains locked in middle
        setTiedCards(prev => [...prev, ...matchPool]);
        setEquippedItem(null);
        setClashResult({ winner: "tie", reason: detailMsg });
        setMatchPhase("tie_breaker");
      }
      if (tutorialStep === 3) {
        setTutorialStep(4);
      }
    }, 1500);
  };

  // Run autoplay turn sequence
  useEffect(() => {
    if (!autoplay) return;

    if (matchPhase === "ready") {
      // Auto-draw if hand empty
      if (playerHand.length === 0 && playerDeck.length > 0) {
        drawCardToHand();
      }
      const timeout = setTimeout(() => {
        playClashTurn();
      }, 1800);
      return () => clearTimeout(timeout);
    }

    if (matchPhase === "resolved") {
      const timeout = setTimeout(() => {
        setPlayerActive(null);
        setOpponentActive(null);
        setMatchPhase("ready");
      }, 2500);
      return () => clearTimeout(timeout);
    }

    if (matchPhase === "tie_breaker") {
      const timeout = setTimeout(() => {
        playClashTurn();
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [autoplay, matchPhase, playerHand.length, playerDeck.length]);

  // Finish match, compute rewards and history
  const handleMatchEnd = () => {
    const isPlayerWinner = playerTrophies.length >= opponentTrophies.length;
    const outcomeStr = isPlayerWinner ? "win" : "loss";
    const coinsReward = isPlayerWinner ? 80 : 20;
    const trophyChangeVal = isPlayerWinner ? 10 : -5;

    // Trigger end audio & speech
    if (isPlayerWinner) {
      playSynthSound("equip");
      speakWord("Victory!");
    } else {
      playSynthSound("error");
      speakWord("Defeat!");
    }

    setMatchOutcome({
      outcome: outcomeStr,
      playerTrophies: playerTrophies.length,
      opponentTrophies: opponentTrophies.length,
      coinsEarned: coinsReward,
      trophyChange: trophyChangeVal,
    });

    setProfile(prev => ({
      ...prev,
      coins: prev.coins + coinsReward,
      trophies: Math.max(0, prev.trophies + trophyChangeVal),
      wins: prev.wins + (isPlayerWinner ? 1 : 0),
      losses: prev.losses + (isPlayerWinner ? 0 : 1),
    }));

    setMatchHistory(prev => [
      {
        id: 'h-' + Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        student: profile.username,
        outcome: outcomeStr,
        trophiesBefore: profile.trophies,
        trophiesAfter: Math.max(0, profile.trophies + trophyChangeVal),
        playerTrophiesWon: playerTrophies.length,
        opponentTrophiesWon: opponentTrophies.length,
      },
      ...prev,
    ]);

    setMatchPhase("game_over");
  };

  return (
    <div className="relative flex flex-col w-full h-full text-white bg-[#0a081c] overflow-hidden select-none">
      
      {/* Dynamic battleboard grid lines */}
      <div
        className="absolute inset-0 z-10 pointer-events-none opacity-10 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)]"
        style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header with quick stats & exit */}
      <div className="relative z-30 flex items-center justify-between px-4 py-2 border-b border-purple-900/40 bg-[#0e0c24]/85 backdrop-blur">
        <button
          onClick={() => onNavigate("student-hub")}
          className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span className="font-['Nunito'] font-bold text-[10px]">Exit Arena</span>
        </button>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoplay}
              onChange={() => setAutoplay(!autoplay)}
              className="accent-purple-600 w-3 h-3 cursor-pointer"
            />
            <span className="font-['Nunito'] font-bold text-[9px] text-purple-400 uppercase tracking-wider">Autoplay</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Trophy size={11} className="text-amber-500" />
            <span className="font-['DM_Mono'] text-[11px] text-amber-400 font-black">{playerTrophies.length} Trophies</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <Trophy size={11} />
            <span className="font-['DM_Mono'] text-[11px] font-black">{opponentTrophies.length}</span>
          </div>
        </div>
      </div>

      {/* Main landscape battlefield divided horizontally */}
      <div className="flex-1 flex justify-between items-stretch px-4 py-1.5 gap-4 overflow-hidden relative z-20">
        
        {/* LEFT AREA: Initial permanent effect */}
        <div className="w-24 flex flex-col justify-center items-center border border-dashed border-purple-900/30 rounded-xl bg-purple-950/10 p-1 h-[175px] self-center">
          <span className="text-[7px] text-rose-500 font-bold uppercase tracking-wider mb-1">Initial Effect</span>
          <div className="flex-1 flex flex-col items-center justify-center bg-rose-950/20 border border-rose-900/40 rounded-lg p-1 text-center w-full">
            <span className="text-[9px] font-black text-white leading-tight">{playerInitialValue.name}</span>
            <span className="text-[8px] font-bold text-rose-400 mt-1">+{playerInitialValue.power} Permanent</span>
          </div>
        </div>

        {/* CENTER AREA: Clashing duel mat */}
        <div className="flex-1 flex flex-col justify-between items-center relative min-w-[320px]">
          
          {/* Clash Turn outcome text label */}
          {clashResult && (
            <div className="absolute top-1 z-35 text-center bg-[#150f35]/95 border border-purple-800/40 rounded-lg px-2.5 py-0.5 max-w-[300px]">
              <span className={`text-[8px] font-['Nunito'] font-bold leading-tight ${clashResult.winner === "player" ? "text-emerald-400" : clashResult.winner === "opponent" ? "text-rose-400" : "text-amber-400"}`}>
                {clashResult.reason}
              </span>
            </div>
          )}

          {/* Opponent Active Creature Slot */}
          <div className="flex-1 flex items-center justify-center w-full relative">
            <div className="absolute top-0 text-[8px] text-red-500 uppercase tracking-widest font-black opacity-80">Opponent Creature</div>
            {opponentActive ? (
              <div className="scale-75 transition-all">
                <FullCard card={opponentActive} dimmed={matchPhase === "resolved" && clashResult?.winner === "player"} onZoom={onZoomCard} />
              </div>
            ) : (
              <EmptySlot label="Awaiting..." width={54} height={74} />
            )}
            {opponentItem && (
              <span className="absolute right-4 text-[7px] text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-1 rounded font-bold">
                +{opponentItem.power} ({opponentItem.name})
              </span>
            )}
          </div>

          {/* Clash Line VS Indicator */}
          <div className="h-6 flex items-center gap-2 relative">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-purple-800" />
            <span className="font-['Cinzel'] text-amber-400 text-xs font-black italic select-none">VS</span>
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-purple-800" />
          </div>

          {/* Player Active Creature Slot (Drag Target) */}
          <div 
            id="player-active-slot"
            className={`flex-1 flex items-center justify-center w-full relative transition-all rounded-xl ${isDragOver ? "bg-purple-500/20 border border-dashed border-purple-500 scale-[1.03]" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const cardId = e.dataTransfer.getData("text/plain");
              const card = playerHand.find(c => c.id === cardId);
              if (card) playCardFromHand(card);
            }}
            onClick={() => {
              if (selectedHandCard) {
                playCardFromHand(selectedHandCard);
                setSelectedHandCard(null);
              }
            }}
          >
            <div className="absolute bottom-0 text-[8px] text-purple-400 uppercase tracking-widest font-black opacity-80">Your Creature</div>
            {playerActive ? (
              <div className="scale-75 transition-all relative">
                <FullCard card={playerActive} dimmed={matchPhase === "resolved" && clashResult?.winner === "opponent"} onZoom={onZoomCard} />
                {floatPowerText && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-black text-emerald-400 animate-bounce bg-black/75 px-1.5 py-0.5 rounded border border-emerald-500/30 shadow-lg z-40">
                    {floatPowerText}
                  </div>
                )}
              </div>
            ) : (
              <EmptySlot label="Drop Here" width={54} height={74} />
            )}
            {equippedItem && (
              <div className="absolute right-4 text-[7px] text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 z-30">
                <span>+{equippedItem.power} ({equippedItem.name})</span>
                <button onClick={(e) => { e.stopPropagation(); setPlayerDiscard(prev => [...prev, equippedItem]); setEquippedItem(null); }} className="text-red-400 hover:text-red-300 font-bold font-sans">×</button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT AREA: Stacks block */}
        <div className="w-24 flex flex-col justify-between items-center gap-1.5 py-1 flex-shrink-0">
          
          {/* Draw deck pile */}
          <div className="flex flex-col items-center">
            <span className="text-[6px] text-purple-600 uppercase font-black">Deck ({playerDeck.length})</span>
            {playerDeck.length > 0 ? (
              <CardBack count={playerDeck.length} label="Draw" color="purple" onClick={drawCardToHand} />
            ) : (
              <EmptySlot label="Empty" width={50} height={66} />
            )}
          </div>

          {/* Discard pile */}
          <div className="flex flex-col items-center">
            <span className="text-[6px] text-slate-500 uppercase font-black">Discard ({playerDiscard.length})</span>
            {playerDiscard.length > 0 ? (
              <CardBack count={playerDiscard.length} label="Discard" color="slate" />
            ) : (
              <EmptySlot label="Discard" width={50} height={66} />
            )}
          </div>

          {/* Trophy Stack with crown icon */}
          <div className="flex flex-col items-center">
            <span className="text-[6px] text-amber-500 uppercase font-black">Trophies ({playerTrophies.length})</span>
            <div className="relative">
              <CardBack count={playerTrophies.length} label="Trophies" color="amber" />
              <div className="absolute top-1 left-1 bg-amber-500/20 p-0.5 rounded-full text-[8px] pointer-events-none">🏆</div>
            </div>
          </div>
        </div>
      </div>

      {/* Clashing controls row */}
      {!autoplay && (matchPhase === "ready" || matchPhase === "resolved" || matchPhase === "tie_breaker") && (
        <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={playClashTurn}
            className="px-6 py-2 rounded-full font-['Nunito'] font-black text-[10px] uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-amber-955 shadow-lg active:scale-95 hover:brightness-110 transition-all cursor-pointer"
          >
            {matchPhase === "tie_breaker" ? "Execute Tie-Breaker!" : "Clash! Reveal Cards"}
          </button>
        </div>
      )}

      {/* Hand Dock - Fanned hand overlay */}
      <div className="relative z-30 bg-[#080617]/95 border-t border-purple-900/40 px-3 py-1 flex flex-col h-[95px] justify-between">
        <div className="flex justify-between items-center select-none">
          <span className="text-[7px] text-purple-400 font-bold uppercase tracking-widest">Your Hand ({playerHand.length}/5)</span>
          <span className="text-[6px] text-purple-600">Drag items to Creature (or click to select then tap Creature slot)</span>
        </div>

        {playerHand.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border border-dashed border-purple-900/30 rounded-xl my-1 select-none">
            <span className="text-[8px] text-purple-700 italic">No cards. Touch Draw Deck on the right!</span>
          </div>
        ) : (
          <div className="flex-1 flex justify-center items-end relative h-[65px] select-none">
            {playerHand.map((card, i) => {
              const N = playerHand.length;
              const angle = (i - (N - 1) / 2) * 10;
              const translateY = Math.abs(i - (N - 1) / 2) * 5;
              const translateX = (i - (N - 1) / 2) * 20;
              const isSelected = selectedHandCard?.id === card.id;

              return (
                <div
                  key={card.id + '-' + i}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", card.id);
                  }}
                  onClick={() => setSelectedHandCard(isSelected ? null : card)}
                  className="absolute bottom-0 cursor-pointer active:scale-95 transition-all origin-bottom"
                  style={{
                    transform: 'translateX(' + translateX + 'px) translateY(' + translateY + 'px) rotate(' + angle + 'deg) ' + (isSelected ? "scale(1.15) translateY(-8px)" : ""),
                    zIndex: isSelected ? 40 : 10 + i,
                    boxShadow: isSelected ? "0 0 12px rgba(139, 92, 246, 0.8)" : "none"
                  }}
                >
                  <HandCard card={card} onPlay={() => {}} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tutorial overlay wizard */}
      {tutorialStep !== null && (
        <div className="absolute top-12 left-4 z-50 pointer-events-auto animate-fade-in">
          <div className="max-w-[180px] rounded-xl bg-[#150f35]/95 border-2 border-amber-500 p-3 text-center flex flex-col gap-2.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-sm">✨</span>
              <h4 className="font-['Nunito'] font-black text-amber-400 text-[10px] uppercase tracking-wider">Tutorial</h4>
            </div>
            <p className="text-[9px] text-purple-200 leading-normal font-sans text-left">
              {tutorialStep === 1 && "Welcome! Tap the Draw Deck on the right to draw cards to your hand."}
              {tutorialStep === 2 && "Great! Now select an Item card in your hand (by clicking or dragging it) and place it on top of your active creature in the center."}
              {tutorialStep === 3 && "Excellent! Now click the 'Clash! Reveal Cards' button above to resolve your combat."}
              {tutorialStep === 4 && "Congratulations! You have successfully completed your first Clash. Click continue."}
            </p>
            {tutorialStep === 4 ? (
              <button
                onClick={() => {
                  localStorage.setItem("cow_tutorial_completed", "true");
                  setTutorialStep(null);
                }}
                className="w-full py-1.5 bg-amber-500 text-amber-955 rounded-lg text-[9px] font-black hover:brightness-110 active:scale-95 cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <span className="text-[7px] text-amber-500/70 italic uppercase tracking-wider">Follow instructions...</span>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── TEACHER VERIFY PIN SCREEN ────────────────────────────────────────────────

function TeacherVerifyScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const handleChange = (val: string, index: number) => {
    const nextPin = [...pin];
    nextPin[index] = val.replace(/\D/, ""); // numbers only
    setPin(nextPin);
    setError("");

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    const fullPin = pin.join("");
    if (fullPin === "123456") {
      onNavigate("teacher-cards");
    } else {
      setError("PIN code verification failed. (Use 123456 for demo)");
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-[#0d0b1e] overflow-hidden justify-center">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-700/10 blur-3xl pointer-events-none" />
      
      <div className="flex flex-row items-center justify-between w-full h-full px-12 py-6 gap-8 relative z-10">
        
        {/* Left Column: Icon & Titles */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 border-r border-purple-955/40 pr-8 h-full">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-700 to-purple-900 flex items-center justify-center border-2 border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.4)]">
            <Shield size={32} className="text-indigo-200 animate-pulse" />
          </div>
          <div>
            <h2 className="font-['Cinzel'] text-xl font-black text-white leading-none">Verify</h2>
            <h2 className="font-['Cinzel'] text-xl font-black text-indigo-300 mt-1 leading-none">Identity</h2>
          </div>
          <p className="text-[10px] text-purple-500 font-['Nunito'] mt-1">Admin Portal PIN verification</p>
        </div>

        {/* Right Column: Code input & Verify button */}
        <div className="flex-1 flex flex-col justify-center gap-4 h-full max-w-[360px]">
          <p className="text-[10px] text-purple-400 font-['Nunito'] text-center">Enter the 6-digit security PIN:</p>
          
          <div className="flex justify-center gap-1.5">
            {pin.map((d, i) => (
              <input
                key={i}
                id={`pin-${i}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(e.target.value, i)}
                className="w-9 h-11 rounded-xl bg-[#221d4a] border border-indigo-700/40 text-center text-lg font-black text-white font-['Nunito'] focus:outline-none focus:border-indigo-400 transition-all"
              />
            ))}
          </div>

          {error && (
            <div className="px-2.5 py-1.5 bg-red-955/30 border border-red-800/40 rounded-lg flex items-center gap-2">
              <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
              <span className="text-[9px] text-red-300 font-['Nunito'] leading-tight">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button 
              onClick={handleVerify} 
              className="w-full py-2.5 rounded-xl font-['Nunito'] font-black text-xs bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-[0_2px_12px_rgba(99,102,241,0.4)] transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Shield size={14} /> Verify & Enter
            </button>
            <button 
              onClick={() => onNavigate("login")} 
              className="font-['Nunito'] text-[10px] text-purple-500 hover:text-purple-300 transition-colors text-center mt-1"
            >
              ← Back to Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── TEACHER CARDS CMS SCREEN ────────────────────────────────────────────────

interface TeacherCardsProps {
  onNavigate: (s: Screen) => void;
  catalog: Card[];
  setCatalog: React.Dispatch<React.SetStateAction<Card[]>>;
}

function TeacherCardsScreen({ onNavigate, catalog, setCatalog }: TeacherCardsProps) {
  // Editing state variables
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  // Form states
  const [cardName, setCardName] = useState("");
  const [type, setType] = useState<CardType>("Creature");
  const [rarity, setRarity] = useState<Rarity>("Common");
  const [cls, setCls] = useState("Noun");
  const [power, setPower] = useState("");
  const [ability, setAbility] = useState("");
  const [audio, setAudio] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [alertSync, setAlertSync] = useState(false);

  // Validation conditions
  const isNameInvalid = submitted && (!cardName || cardName.trim().split(" ").length < 2);
  const isPowerInvalid = submitted && (!power || Number(power) < 1 || Number(power) > 9);
  const isAudioMissing = submitted && !audio;
  const isFormInvalid = isNameInvalid || isPowerInvalid || isAudioMissing;

  const handleSaveCard = () => {
    setSubmitted(true);
    setAlertSync(false);

    // Validate name (min 2 words) and power (1-9) and audio file
    if (!cardName.trim() || cardName.trim().split(" ").length < 2 || !power || Number(power) < 1 || Number(power) > 9 || !audio) {
      return;
    }

    if (editingCard) {
      // Edit
      setCatalog(prev => prev.map(c => c.id === editingCard.id ? {
        ...c,
        name: cardName,
        type,
        rarity,
        englishClass: cls,
        power: Number(power),
        ability,
        active: c.active !== false
      } : c));
    } else {
      // Create new
      const newCard: Card = {
        id: `c-custom-${Date.now()}`,
        name: cardName,
        type,
        rarity,
        englishClass: cls,
        power: Number(power),
        ability,
        active: true
      };
      setCatalog(prev => [...prev, newCard]);
    }

    // Reset Form
    setEditingCard(null);
    setCardName("");
    setType("Creature");
    setRarity("Common");
    setCls("Noun");
    setPower("");
    setAbility("");
    setAudio(null);
    setSubmitted(false);

    // Trigger local offline sync saving alert
    setAlertSync(true);
  };

  const startEdit = (card: Card) => {
    setEditingCard(card);
    setCardName(card.name);
    setType(card.type);
    setRarity(card.rarity);
    setCls(card.englishClass);
    setPower(card.power.toString());
    setAbility(card.ability || "");
    setAudio("pronunciation_ref.wav");
    setSubmitted(false);
    setAlertSync(false);
  };

  const toggleActive = (id: string) => {
    setCatalog(prev => prev.map(c => c.id === id ? { ...c, active: c.active === false ? true : false } : c));
    setAlertSync(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0b1e] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-3 pb-2 flex-shrink-0 border-b border-purple-900/20 bg-black/10">
        <div className="w-7 h-7 rounded-lg bg-indigo-800 flex items-center justify-center border border-indigo-600/40">
          <Shield size={14} className="text-indigo-300" />
        </div>
        <div className="flex-1">
          <h2 className="font-['Nunito'] text-sm font-black text-white leading-none">Catalog CMS</h2>
          <p className="font-['Nunito'] text-[8px] text-purple-400 mt-0.5 uppercase tracking-wider font-bold">Add & modify vocabulary cards</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("teacher-progress")} className="text-[10px] font-['Nunito'] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            Stats <ArrowRight size={10} />
          </button>
          
          <div className="bg-indigo-950/60 border border-indigo-800/40 rounded-lg px-2 py-0.5 flex items-center gap-1.5 shadow-sm">
            <span className="text-[9px]">👤</span>
            <span className="font-['Nunito'] text-[8px] font-black text-indigo-300 uppercase tracking-wider">Admin (Class 5B)</span>
          </div>
          
          <button 
            onClick={() => onNavigate("login")} 
            className="px-2.5 py-1 bg-red-955 hover:bg-red-900 border border-red-900/40 text-red-400 hover:text-red-300 rounded-lg text-[9px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex flex-row p-4 gap-4 overflow-hidden min-h-0">
        
        {/* Left Column: Form (Scrollable internally) */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 rounded-2xl bg-[#1a1540]/30 border border-purple-700/20 p-4" style={{ scrollbarWidth: "none" }}>
          <h3 className="font-['Nunito'] font-black text-white text-[10px] uppercase tracking-wider">
            {editingCard ? `✏️ Edit Card: ${editingCard.name}` : "➕ Add New Card"}
          </h3>

          {/* Offline Banner alerts */}
          {alertSync && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-600/60 px-3 py-2 flex items-center gap-2 animate-scale-up">
              <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-['Nunito'] font-bold text-emerald-300 text-[9px] leading-tight">Card catalog updated locally!</p>
              </div>
            </div>
          )}

          {isFormInvalid && (
            <div className="rounded-xl bg-red-900/30 border border-red-600/60 px-3 py-2 flex items-center gap-2 animate-shake">
              <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
              <div>
                <p className="font-['Nunito'] font-black text-red-300 text-[9px] leading-tight">Missing fields</p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[8px] font-['Nunito'] font-black text-purple-300 uppercase tracking-wider">Card Name *</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="e.g. Verbose Dragon (2 words min)"
              className={`w-full bg-[#221d4a] border rounded-xl px-3 py-1.5 text-white font-['Nunito'] text-xs focus:outline-none transition-all ${isNameInvalid ? "border-red-600/70" : "border-purple-700/40 focus:border-purple-500"}`}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[8px] font-['Nunito'] font-black text-purple-300 uppercase tracking-wider">Card Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as CardType)} className="w-full bg-[#221d4a] border border-purple-700/40 rounded-xl px-2 py-1 text-white font-['Nunito'] text-[10px] focus:outline-none cursor-pointer">
                {["Creature", "Item", "Effect", "Value"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[8px] font-['Nunito'] font-black text-purple-300 uppercase tracking-wider">Rarity</label>
              <select value={rarity} onChange={(e) => setRarity(e.target.value as Rarity)} className="w-full bg-[#221d4a] border border-purple-700/40 rounded-xl px-2 py-1 text-white font-['Nunito'] text-[10px] focus:outline-none cursor-pointer">
                {["Common", "Rare", "Epic", "Legendary"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[8px] font-['Nunito'] font-black text-purple-300 uppercase tracking-wider">Grammar Class</label>
              <select value={cls} onChange={(e) => setCls(e.target.value)} className="w-full bg-[#221d4a] border border-purple-700/40 rounded-xl px-2 py-1 text-white font-['Nunito'] text-[10px] focus:outline-none cursor-pointer">
                {["Noun", "Verb", "Adjective", "Adverb", "Prefix", "Suffix", "Grammar", "Figurative"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[8px] font-['Nunito'] font-black text-purple-300 uppercase tracking-wider">Power (1-9) *</label>
              <input
                type="number"
                min={1}
                max={9}
                value={power}
                onChange={(e) => setPower(e.target.value)}
                placeholder="e.g. 5"
                className={`w-full bg-[#221d4a] border rounded-xl px-2.5 py-1 text-white font-['DM_Mono'] text-xs focus:outline-none transition-all ${isPowerInvalid ? "border-red-600/70" : "border-purple-700/40 focus:border-purple-500"}`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-['Nunito'] font-black text-purple-300 uppercase tracking-wider">Ability (Optional)</label>
            <input
              type="text"
              value={ability}
              onChange={(e) => setAbility(e.target.value)}
              placeholder="e.g. Doubles next power"
              className="w-full bg-[#221d4a] border border-purple-700/40 rounded-xl px-3 py-1.5 text-white font-['Nunito'] text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Audio mock upload */}
          <div className="flex flex-col gap-1">
            <label className="text-[8px] font-['Nunito'] font-black text-purple-300 uppercase tracking-wider">Audio Pronunciation *</label>
            <label className={`flex items-center gap-2 rounded-xl border border-dashed px-3 py-2 cursor-pointer transition-all ${audio ? "border-emerald-600/50 bg-emerald-950/10" : isAudioMissing ? "border-red-600/60 bg-red-955/10" : "border-purple-700/40 bg-[#221d4a] hover:border-purple-500/55"}`}>
              <input type="file" accept="audio/*" className="hidden" onChange={(e) => setAudio(e.target.files?.[0]?.name ?? "audio_ref.mp3")} />
              {audio ? (
                <>
                  <Volume2 size={12} className="text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-['Nunito'] font-bold text-emerald-300 text-[9px] truncate leading-none">{audio}</p>
                  </div>
                  <CheckCircle size={11} className="text-emerald-400" />
                </>
              ) : (
                <>
                  <Upload size={12} className="text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="font-['Nunito'] font-bold text-purple-300 text-[9px] leading-none">Upload Audio</p>
                  </div>
                </>
              )}
            </label>
          </div>

          <div className="flex gap-2 mt-auto">
            {editingCard && (
              <button onClick={() => { setEditingCard(null); setCardName(""); setAudio(null); setSubmitted(false); }} className="flex-1 py-1.5 rounded-xl border border-purple-800 text-purple-400 text-[10px] font-black transition-all">Cancel</button>
            )}
            <button onClick={handleSaveCard} className="flex-2 py-1.5 bg-indigo-600 text-white rounded-xl font-['Nunito'] font-black text-[10px] active:scale-95 transition-all shadow-md">
              {editingCard ? "Update specs" : "Save Card"}
            </button>
          </div>
        </div>

        {/* Right Column: Listing (Scrollable internally) */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1" style={{ scrollbarWidth: "none" }}>
          <h3 className="font-['Nunito'] font-black text-white text-[10px] uppercase tracking-wider sticky top-0 bg-[#0d0b1e] py-1 z-10">
            Registered Catalog ({catalog.length} Cards)
          </h3>
          <div className="flex flex-col gap-1.5">
            {catalog.map((c) => (
              <div key={c.id} className={`flex items-center justify-between p-2 rounded-xl bg-[#1a1540]/60 border ${c.active !== false ? "border-purple-900/50" : "border-red-955/40 opacity-50"} text-[10px]`}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-800 to-purple-955 flex items-center justify-center flex-shrink-0">
                    {TYPE_ICON_SM[c.type]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-['Nunito'] font-bold text-white leading-tight truncate max-w-[120px]">{c.name}</h4>
                    <p className="font-['DM_Mono'] text-[7px] text-purple-500 mt-0.5 uppercase tracking-wide">
                      {c.englishClass} · {c.rarity} · Pw {c.power}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleActive(c.id)}
                    className={`text-[8px] px-1.5 py-0.5 rounded font-bold transition-all ${c.active !== false ? "bg-emerald-955 text-emerald-400 border border-emerald-800/40" : "bg-red-955 text-red-400 border border-red-800/40"}`}
                  >
                    {c.active !== false ? "Active" : "Off"}
                  </button>
                  <button
                    onClick={() => startEdit(c)}
                    className="text-[8px] bg-indigo-955 text-indigo-400 border border-indigo-800/40 px-1.5 py-0.5 rounded font-bold hover:bg-indigo-900"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEACHER PROGRESS & REWARDS SCREEN ────────────────────────────────────────

interface TeacherProgressProps {
  onNavigate: (s: Screen) => void;
  history: MatchLog[];
  codes: RewardCode[];
  setCodes: React.Dispatch<React.SetStateAction<RewardCode[]>>;
}

function TeacherProgressScreen({ onNavigate, history, codes, setCodes }: TeacherProgressProps) {
  const [newCodeName, setNewCodeName] = useState("");
  const [newCodeType, setNewCodeType] = useState<"coins" | "pack">("coins");
  const [newCodeValue, setNewCodeValue] = useState("100");
  const [showRewards, setShowRewards] = useState(false);

  const students = [
    { name: "Elena Wizard", matches: 28, wins: 18, trophies: 47, rank: "Silver" },
    { name: "Marco Rex", matches: 32, wins: 14, trophies: 36, rank: "Bronze" },
    { name: "Sofia Storm", matches: 20, wins: 16, trophies: 51, rank: "Gold" },
    { name: "Kai Rune", matches: 15, wins: 10, trophies: 28, rank: "Bronze" },
    { name: "Amara Spell", matches: 22, wins: 19, trophies: 60, rank: "Gold" },
    { name: "Luca Crest", matches: 8, wins: 3, trophies: 14, rank: "Iron" },
  ];

  const rankColors: Record<string, string> = {
    Iron: "text-slate-400",
    Bronze: "text-amber-700",
    Silver: "text-slate-300",
    Gold: "text-amber-400",
  };

  const handleGenerateCode = () => {
    const codeStr = newCodeName.trim().toUpperCase() || `CLASH-${Math.floor(1000 + Math.random() * 9000)}`;
    if (codes.find(c => c.code.toUpperCase() === codeStr)) return; // prevent dupes

    const newCode: RewardCode = {
      code: codeStr,
      rewardType: newCodeType,
      rewardValue: Number(newCodeValue) || 50,
      redeemed: false
    };

    setCodes(prev => [newCode, ...prev]);
    setNewCodeName("");
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0b1e] overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-indigo-800 flex items-center justify-center border border-indigo-600/40">
          <BarChart2 size={16} className="text-indigo-300" />
        </div>
        <div className="flex-1">
          <h2 className="font-['Nunito'] font-black text-white text-base leading-none">Classroom Progress</h2>
          <p className="font-['Nunito'] text-[10px] text-purple-400">Class 5B — English Vocabulary Tracker</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("teacher-cards")} className="text-xs font-['Nunito'] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            <ChevronLeft size={14} /> Catalog
          </button>
          
          <div className="bg-indigo-950/60 border border-indigo-800/40 rounded-lg px-2 py-0.5 flex items-center gap-1.5 shadow-sm">
            <span className="text-[9px]">👤</span>
            <span className="font-['Nunito'] text-[8px] font-black text-indigo-300 uppercase tracking-wider">Admin (Class 5B)</span>
          </div>
          
          <button 
            onClick={() => onNavigate("login")} 
            className="px-2.5 py-1 bg-red-955 hover:bg-red-900 border border-red-900/40 text-red-400 hover:text-red-300 rounded-lg text-[9px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Toggle View Options */}
      <div className="mx-5 mb-3 rounded-xl bg-[#1a1540] p-1 border border-purple-700/30 flex flex-shrink-0">
        <button onClick={() => setShowRewards(false)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${!showRewards ? "bg-indigo-600 text-white" : "text-purple-400 hover:text-white"}`}>
          📊 Student Stats
        </button>
        <button onClick={() => setShowRewards(true)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${showRewards ? "bg-indigo-600 text-white" : "text-purple-400 hover:text-white"}`}>
          🎁 Codes & Rewards
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6" style={{ scrollbarWidth: "none" }}>
        {!showRewards ? (
        // 📊 Student Stats Dashboard
        <div className="flex flex-col gap-4">
          <div className="mx-5 grid grid-cols-3 gap-2">
            {[{ label: "Students", value: "24", icon: <Users size={15} className="text-cyan-400" /> },
              { label: "Avg Trophies", value: "39", icon: <Trophy size={15} className="text-amber-400" /> },
              { label: "Active Today", value: "18", icon: <Zap size={15} className="text-emerald-400" /> }].map((s) => (
              <div key={s.label} className="rounded-xl bg-[#1a1540] border border-purple-700/30 p-2.5 flex flex-col gap-1">
                {s.icon}
                <span className="font-['Nunito'] font-black text-white text-base leading-none">{s.value}</span>
                <span className="font-['Nunito'] text-[8px] text-purple-500 uppercase tracking-wider leading-none">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="px-5">
            <h3 className="font-['Nunito'] font-black text-white text-xs uppercase tracking-wider mb-2">Student Performance</h3>
            <div className="grid grid-cols-5 gap-1 px-3 py-1.5 bg-[#141038] rounded-t-xl text-center">
              {["Name", "Matches", "Wins", "🏆", "Rank"].map(h => (
                <span key={h} className="font-['DM_Mono'] text-[8px] text-purple-400 uppercase tracking-wider font-bold">{h}</span>
              ))}
            </div>
            <div className="flex flex-col gap-1.5 bg-[#141038]/40 border-x border-b border-[#141038] rounded-b-xl p-2">
              {students.map((s) => (
                <div key={s.name} className="grid grid-cols-5 gap-1 items-center px-2 py-2 rounded-lg bg-[#1a1540] border border-purple-900/20 text-center">
                  <span className="font-['Nunito'] font-bold text-[9px] text-white truncate text-left pl-1">{s.name.split(" ")[0]}</span>
                  <span className="font-['DM_Mono'] text-xs text-purple-300">{s.matches}</span>
                  <span className="font-['DM_Mono'] text-xs text-emerald-400">{s.wins}</span>
                  <span className="font-['DM_Mono'] text-xs text-amber-400">{s.trophies}</span>
                  <span className={`font-['Nunito'] font-black text-[9px] ${rankColors[s.rank]}`}>{s.rank}</span>
                </div>
              ))}
            </div>
          </div>

          {/* School Recess Integration Log (Convivencia Log) */}
          <div className="px-5">
            <h3 className="font-['Nunito'] font-black text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>🏫 Recess Playroom Activity Log</span>
            </h3>
            <p className="text-[8px] text-purple-500 mb-2">Logs local multiplayer matches completed by students during playground breaks. Provided for monitoring integration.</p>
            
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              {history.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-purple-800/30 rounded-xl">
                  <p className="text-[10px] text-purple-600">No recess interactions registered yet.</p>
                </div>
              ) : (
                history.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-[#141038]/60 border border-purple-900/30 flex flex-col gap-1 text-[10px]">
                    <div className="flex justify-between text-[8px] text-purple-500 font-bold uppercase tracking-wider">
                      <span>{log.date}</span>
                      <span className={log.outcome === "win" ? "text-emerald-400" : "text-rose-400"}>{log.outcome === "win" ? "Match Win" : "Match Loss"}</span>
                    </div>
                    <div className="flex justify-between text-white">
                      <span>Player: <strong className="text-purple-300">{log.student}</strong></span>
                      <span>Trophy Score: <strong className="text-amber-400">{log.playerTrophiesWon} - {log.opponentTrophiesWon}</strong></span>
                    </div>
                    <p className="text-[8px] text-purple-600 leading-tight italic mt-0.5">
                      Notes: Student completed game break, exchanged trophies ({log.trophiesBefore} ➔ {log.trophiesAfter}). Social dynamics cooperative.
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        // 🎁 Codes & Rewards Management
        <div className="flex flex-col gap-4 mx-5 animate-fade-in">
          <div className="rounded-2xl bg-[#1a1540] border border-purple-700/30 p-4 flex flex-col gap-3">
            <h3 className="font-['Nunito'] font-black text-white text-xs uppercase tracking-wider">Generate Reward Code</h3>
            <p className="text-[9px] text-purple-400">Distribute unique code tokens to reward high grades, active class participation, or exemplary recess behaviour.</p>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-purple-300 uppercase tracking-wider">Code Identifier (Optional)</label>
              <input
                type="text"
                value={newCodeName}
                onChange={(e) => setNewCodeName(e.target.value)}
                placeholder="e.g. EXCELLENCE20 (Auto if blank)"
                className="w-full bg-[#221d4a] border border-purple-700/40 rounded-xl px-4 py-2 text-white font-['DM_Mono'] text-xs tracking-wider uppercase focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[9px] font-black text-purple-300 uppercase tracking-wider">Reward Type</label>
                <select value={newCodeType} onChange={(e) => setNewCodeType(e.target.value as "coins" | "pack")} className="w-full bg-[#221d4a] border border-purple-700/40 rounded-xl px-3 py-2 text-white font-['Nunito'] text-xs focus:outline-none cursor-pointer">
                  <option value="coins">Virtual Coins</option>
                  <option value="pack">Card Booster Pack</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[9px] font-black text-purple-300 uppercase tracking-wider">Reward Value</label>
                <input
                  type="number"
                  value={newCodeValue}
                  onChange={(e) => setNewCodeValue(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-[#221d4a] border border-purple-700/40 rounded-xl px-3 py-2 text-white font-['DM_Mono'] text-xs focus:outline-none"
                />
              </div>
            </div>

            <button onClick={handleGenerateCode} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs active:scale-95 transition-all shadow-md mt-1">
              Generate & Publish Code
            </button>
          </div>

          <div>
            <h3 className="font-['Nunito'] font-black text-white text-xs uppercase tracking-wider mb-2">Active Codes Catalog</h3>
            <div className="flex flex-col gap-1.5">
              {codes.length === 0 ? (
                <p className="text-[10px] text-purple-600 text-center py-4 border border-dashed border-purple-900/50 rounded-xl">No active reward codes created yet.</p>
              ) : (
                codes.map((c, i) => (
                  <div key={`${c.code}-${i}`} className="p-3 bg-[#1a1540]/60 border border-purple-900/50 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="font-['DM_Mono'] text-xs font-black text-amber-400 tracking-wider uppercase">{c.code}</span>
                      <p className="text-[8px] text-purple-400 mt-0.5 leading-none">
                        Reward: {c.rewardType === "coins" ? `${c.rewardValue} Coins` : `${c.rewardValue} Vocabulary Pack`}
                      </p>
                    </div>
                    <span className={`text-[8px] px-2 py-1 rounded font-bold uppercase ${c.redeemed ? "bg-red-950 text-red-400 border border-red-900/40" : "bg-emerald-950 text-emerald-400 border border-emerald-900/40"}`}>
                      {c.redeemed ? "Claimed" : "Active"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

type NavGroup = { label: string; screens: { id: Screen; label: string }[] };

const NAV: NavGroup[] = [
  { label: "", screens: [{ id: "login", label: "Login" }] },
  { label: "Student", screens: [{ id: "student-hub", label: "Hub" }, { id: "deck-builder", label: "Deck" }, { id: "game-mat", label: "Arena" }] },
  { label: "Teacher", screens: [{ id: "teacher-verify", label: "Verify" }, { id: "teacher-cards", label: "CMS" }, { id: "teacher-progress", label: "Stats" }] },
];

export default function App() {
  const [zoomedCard, setZoomedCard] = useState<Card | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  };

  const [screen, setScreen] = useState<Screen>("login");
  const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);
  const [isTeacherVerified, setIsTeacherVerified] = useState(false);

  const navigate = (s: Screen) => {
    setScreen(s);
    if (s === "login") {
      setUserRole(null);
      setIsTeacherVerified(false);
    } else if (s === "student-hub" || s === "deck-builder" || s === "game-mat") {
      setUserRole("student");
    } else if (s === "teacher-verify" || s === "teacher-cards" || s === "teacher-progress") {
      setUserRole("teacher");
    }
  };

  // Load state from local storage or set default initial value
  const [catalog, setCatalog] = useState<Card[]>(() => {
    const saved = localStorage.getItem("cow_catalog");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length < 100) { // Migrate old 30-card catalog
        return defaultCatalog;
      }
      // Migrate card names and properties to ensure they match defaultCatalog updates!
      const migrated = parsed.map((card: Card) => {
        const matching = defaultCatalog.find(c => c.id === card.id);
        if (matching && (matching.name !== card.name || matching.englishClass !== card.englishClass || matching.type !== card.type || matching.ability !== card.ability)) {
          return { ...card, name: matching.name, englishClass: matching.englishClass, type: matching.type, ability: matching.ability };
        }
        return card;
      });
      return migrated;
    }
    return defaultCatalog;
  });

  const [profiles, setProfiles] = useState<Record<string, StudentProfile>>(() => {
    const saved = localStorage.getItem("cow_profiles");
    if (saved) {
      return JSON.parse(saved);
    }
    // Fallback: migrate from single cow_profile if available
    const singleSaved = localStorage.getItem("cow_profile");
    const defaultProfile = singleSaved ? JSON.parse(singleSaved) : {
      username: "Elena_Wizard",
      coins: 150,
      trophies: 47,
      wins: 18,
      losses: 10,
      collection: defaultCatalog.map(c => c.id),
      activeDeck: defaultCatalog.slice(0, 20).map(c => c.id)
    };
    const initial = {
      [defaultProfile.username]: defaultProfile
    };
    localStorage.setItem("cow_profiles", JSON.stringify(initial));
    return initial;
  });

  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("cow_profile");
    if (saved) {
      return JSON.parse(saved);
    }
    const savedProfiles = localStorage.getItem("cow_profiles");
    if (savedProfiles) {
      const parsed = JSON.parse(savedProfiles);
      const keys = Object.keys(parsed);
      if (keys.length > 0) {
        return parsed[keys[0]];
      }
    }
    return {
      username: "Elena_Wizard",
      coins: 150,
      trophies: 47,
      wins: 18,
      losses: 10,
      collection: defaultCatalog.map(c => c.id),
      activeDeck: defaultCatalog.slice(0, 20).map(c => c.id)
    };
  });

  const handleStudentLogin = (username: string) => {
    let studentProfile = profiles[username];
    if (!studentProfile) {
      studentProfile = {
        username: username,
        coins: 0,
        trophies: 0,
        wins: 0,
        losses: 0,
        collection: [],
        activeDeck: []
      };
      setProfiles(prev => {
        const updated = { ...prev, [username]: studentProfile };
        localStorage.setItem("cow_profiles", JSON.stringify(updated));
        return updated;
      });
    }
    setProfile(studentProfile);
    navigate("student-hub");
  };

  const [codes, setCodes] = useState<RewardCode[]>(() => {
    const saved = localStorage.getItem("cow_codes");
    return saved ? JSON.parse(saved) : [
      { code: "CLASH2026", rewardType: "coins", rewardValue: 100, redeemed: false },
      { code: "GOODBEHAVIOR", rewardType: "pack", rewardValue: 1, redeemed: false },
      { code: "VOCABULARY", rewardType: "coins", rewardValue: 50, redeemed: false }
    ];
  });

  const [matchHistory, setMatchHistory] = useState<MatchLog[]>(() => {
    const saved = localStorage.getItem("cow_history");
    return saved ? JSON.parse(saved) : [
      { id: "h1", date: "Jul 1, 10:24 AM", student: "Elena Wizard", outcome: "win", trophiesBefore: 37, trophiesAfter: 47, playerTrophiesWon: 12, opponentTrophiesWon: 8 },
      { id: "h2", date: "Jun 30, 03:15 PM", student: "Elena Wizard", outcome: "win", trophiesBefore: 27, trophiesAfter: 37, playerTrophiesWon: 15, opponentTrophiesWon: 5 },
      { id: "h3", date: "Jun 29, 11:40 AM", student: "Elena Wizard", outcome: "loss", trophiesBefore: 32, trophiesAfter: 27, playerTrophiesWon: 7, opponentTrophiesWon: 13 }
    ];
  });

  // Sync state modifications back to local storage
  useEffect(() => {
    localStorage.setItem("cow_catalog", JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem("cow_profile", JSON.stringify(profile));
    setProfiles(prev => {
      const updated = { ...prev, [profile.username]: profile };
      localStorage.setItem("cow_profiles", JSON.stringify(updated));
      return updated;
    });
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("cow_codes", JSON.stringify(codes));
  }, [codes]);

  useEffect(() => {
    localStorage.setItem("cow_history", JSON.stringify(matchHistory));
  }, [matchHistory]);

  function renderScreen() {
    // Prevent students from accessing teacher screens
    if (userRole === "student" && (screen === "teacher-verify" || screen === "teacher-cards" || screen === "teacher-progress")) {
      return (
        <StudentHubScreen
          onNavigate={navigate}
          profile={profile}
          setProfile={setProfile}
          codes={codes}
          setCodes={setCodes}
          catalog={catalog}
          history={matchHistory}
          onZoomCard={setZoomedCard}
        />
      );
    }

    // Prevent unverified teachers from accessing teacher content (CMS/Stats)
    if (userRole === "teacher" && !isTeacherVerified && (screen === "teacher-cards" || screen === "teacher-progress")) {
      return (
        <TeacherVerifyScreen
          onNavigate={(targetScreen) => {
            if (targetScreen === "teacher-cards") {
              setIsTeacherVerified(true);
            }
            navigate(targetScreen);
          }}
        />
      );
    }

    switch (screen) {
      case "login":
        return <LoginScreen onNavigate={navigate} onStudentLogin={handleStudentLogin} />;
      case "student-hub":
        return (
          <StudentHubScreen
            onNavigate={navigate}
            profile={profile}
            setProfile={setProfile}
            codes={codes}
            setCodes={setCodes}
            catalog={catalog}
            history={matchHistory}
            onZoomCard={setZoomedCard}
          />
        );
      case "deck-builder":
        return (
          <DeckBuilderScreen
            onNavigate={navigate}
            profile={profile}
            setProfile={setProfile}
            catalog={catalog}
          />
        );
      case "game-mat":
        return (
          <GameMatScreen
            onNavigate={navigate}
            profile={profile}
            setProfile={setProfile}
            catalog={catalog}
            setMatchHistory={setMatchHistory}
            onZoomCard={setZoomedCard}
            showToast={showToast}
          />
        );
      case "teacher-verify":
        return (
          <TeacherVerifyScreen
            onNavigate={(targetScreen) => {
              if (targetScreen === "teacher-cards") {
                setIsTeacherVerified(true);
              }
              navigate(targetScreen);
            }}
          />
        );
      case "teacher-cards":
        return (
          <TeacherCardsScreen
            onNavigate={navigate}
            catalog={catalog}
            setCatalog={setCatalog}
          />
        );
      case "teacher-progress":
        return (
          <TeacherProgressScreen
            onNavigate={navigate}
            history={matchHistory}
            codes={codes}
            setCodes={setCodes}
          />
        );
    }
  }

  return (
    <div className="size-full flex items-center justify-center bg-[#030210] p-4 min-h-[90vh]">
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 844,
          height: 390,
          fontFamily: "'Nunito', sans-serif",
          boxShadow: "0 0 0 1px rgba(124,58,237,0.3), 0 32px 96px rgba(0,0,0,0.9)",
          borderRadius: 24,
          background: "#0d0b1e",
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-2 pb-1 flex-shrink-0 z-50 bg-transparent select-none">
          <span className="font-['DM_Mono'] text-[11px] text-white/50">9:41</span>
          <div className="flex items-center gap-1.5">
            <Wifi size={11} className="text-white/40" />
            <div className="flex gap-0.5 items-end">
              {[4, 6, 8, 10].map((h, i) => (
                <div key={i} className={`w-[3px] rounded-sm ${i < 3 ? "bg-white/50" : "bg-white/20"}`} style={{ height: h }} />
              ))}
            </div>
          </div>
        </div>


        {/* Zoom Modal overlay */}
        {zoomedCard && (
          <div 
            onClick={() => setZoomedCard(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer animate-fade-in"
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="bg-[#150f35] border-2 border-purple-500 rounded-3xl p-5 w-[240px] shadow-2xl flex flex-col items-center text-center gap-3 relative animate-scale-up cursor-default"
            >
              <button 
                onClick={() => setZoomedCard(null)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 hover:text-white"
              >
                ×
              </button>
              
              {/* Card visual detail */}
              <div className="scale-110 py-1">
                <FullCard card={zoomedCard} onZoom={() => {}} />
              </div>
              
              <div className="w-full mt-2">
                <h4 className="font-['Nunito'] font-black text-white text-base leading-tight">{zoomedCard.name}</h4>
                <p className="text-[10px] text-purple-400 mt-1 uppercase tracking-widest font-black">{zoomedCard.type} · {zoomedCard.rarity}</p>
                <div className="bg-[#1c1845] border border-purple-900/40 rounded-xl p-2.5 mt-3 text-left">
                  <p className="text-[9px] text-purple-200 italic leading-relaxed">
                    {zoomedCard.ability || "This card represents an English vocabulary word. Hold the card to hear its correct pronunciation!"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => speakWord(zoomedCard.name)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-['Nunito'] font-black text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Volume2 size={13} /> Listen to Vocabulary
              </button>
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {toast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-955/90 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl text-xs z-[120] shadow-lg pointer-events-none animate-bounce font-sans font-bold">
            {toast}
          </div>
        )}
        {/* Navigation tabs for presentation/grading */}
        {screen !== "login" && (
          <div className="px-3 pb-1.5 flex-shrink-0 z-50 select-none">
            <div className="flex gap-1 bg-black/30 backdrop-blur rounded-xl p-1 border border-purple-900/30">
              {NAV.filter(group => {
                if (group.label === "") {
                  return false;
                }
                if (userRole === "student" && group.label === "Teacher") {
                  return false;
                }
                if (userRole === "teacher" && group.label === "Student") {
                  return false;
                }
                return true;
              }).map((group) =>
                group.screens
                  .filter((s) => {
                    if (s.id === "teacher-verify" && isTeacherVerified) {
                      return false;
                    }
                    return true;
                  })
                  .map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => navigate(s.id)}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-['Nunito'] font-bold transition-all ${
                        screen === s.id
                          ? group.label === "Teacher"
                            ? "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.5)]"
                            : "bg-purple-600 text-white shadow-[0_2px_8px_rgba(124,58,237,0.5)]"
                          : group.label === "Teacher"
                          ? "text-indigo-700 hover:text-indigo-400"
                          : "text-purple-700 hover:text-purple-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Screen content */}
        <div className="flex-1 overflow-hidden">{renderScreen()}</div>
      </div>
    </div>
  );
}

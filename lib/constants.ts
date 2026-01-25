import {
  Shield,
  Sword,
  Zap,
  Crosshair,
  Music,
  Users,
} from "lucide-react";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type ClassRole = "warrior" | "berserker" | "volva" | "archer" | "skald" | "unknown";

export interface LootItem {
  id: string;
  name: string;
  rarity: Rarity;
  quantity: number;
  source?: string;
  timeLeft?: string;
}

export interface Participant {
  id: string;
  name: string;
  role: ClassRole;
}

export interface HistoryItem {
  id: string;
  itemName: string;
  rarity: Rarity;
  winnerName: string;
  winnerRole: ClassRole;
  quantityWon: number;
  timestamp: string;
  displayTime: string;
  displayDate: string;
}

export interface WonItemDetail {
  name: string;
  rarity: Rarity;
  quantityWon: number;
}

export interface RaffleResult {
  winner: Participant;
  wonItems: WonItemDetail[];
}

export const CLASSES: Record<ClassRole, { label: string; color: string; icon: any }> = {
  warrior: { label: "Warrior", color: "", icon: Shield },
  berserker: { label: "Berserker", color: "", icon: Sword },
  volva: { label: "Volva", color: "", icon: Zap },
  archer: { label: "Archer", color: "", icon: Crosshair },
  skald: { label: "Skald", color: "", icon: Music },
  unknown: { label: "Member", color: "", icon: Users },
};

export const WHEEL_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef",
];

export const RARITY_ORDER = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };

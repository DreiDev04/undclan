"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Users,
  Sparkles,
  Trophy,
  Plus,
  Download,
  Upload,
  Trash2,
  RefreshCcw,
  Shuffle,
  FileText,
  Save,
  Gift // Added Gift icon for the popup
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// --- Types ---
// 1. ADDED 'uncommon' HERE
type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

interface LootItem {
  id: string;
  name: string;
  rarity: Rarity;
  quantity: number;
}

interface Participant {
  id: string;
  name: string;
}

interface HistoryItem {
  id: string;
  itemName: string;
  rarity: Rarity;
  winnerName: string;
  quantityWon: number;
  timestamp: string;
  displayTime: string;
  displayDate: string;
}

// New interface to track full win details for the popup
interface RaffleResult {
  winner: Participant;
  item: LootItem;
  quantityWon: number;
}

// --- Helper Hook: Local Storage ---
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
    setIsHydrated(true);
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue, isHydrated] as const;
}

// --- Vibrant Wheel Colors ---
const WHEEL_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#f97316", // Orange (secondary)
  "#14b8a6", // Teal
];

// --- Main Component ---
export default function ClanLootSystem() {
  // --- State ---
  const [lootItems, setLootItems] = useLocalStorage<LootItem[]>("clan-loot", []);
  const [participants, setParticipants] = useLocalStorage<Participant[]>("clan-participants", []);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>("clan-history", []);
  
  // Form States
  const [newItemName, setNewItemName] = useState("");
  const [newItemRarity, setNewItemRarity] = useState<Rarity>("common");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [bulkNames, setBulkNames] = useState("");

  // Raffle States
  const [selectedRaffleItem, setSelectedRaffleItem] = useState<string>("");
  const [raffleQtyToGive, setRaffleQtyToGive] = useState<number>(1);
  const [isRaffling, setIsRaffling] = useState(false);
  
  // Changed this to hold the full result object
  const [raffleResult, setRaffleResult] = useState<RaffleResult | null>(null);
  
  const [wheelRotation, setWheelRotation] = useState(0);
  const [removeWinner, setRemoveWinner] = useState(false);

  // --- Logic Functions ---

  const addItem = () => {
    if (!newItemName) return;
    const newItem: LootItem = {
      id: crypto.randomUUID(),
      name: newItemName,
      rarity: newItemRarity,
      quantity: newItemQty,
    };
    setLootItems([...lootItems, newItem]);
    setNewItemName("");
    setNewItemQty(1);
  };

  const deleteItem = (id: string) => {
    setLootItems(lootItems.filter(i => i.id !== id));
  };

  const addParticipant = () => {
    if (!newParticipantName) return;
    const newPerson: Participant = {
      id: crypto.randomUUID(),
      name: newParticipantName,
    };
    setParticipants([...participants, newPerson]);
    setNewParticipantName("");
  };

  const handleBulkAdd = () => {
    if (!bulkNames) return;
    const names = bulkNames.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (names.length === 0) return;
    const newParticipants = names.map(name => ({ id: crypto.randomUUID(), name: name }));
    setParticipants([...participants, ...newParticipants]);
    setBulkNames(""); 
  };

  const deleteParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const runRaffle = () => {
    if (!selectedRaffleItem || participants.length === 0) return;
    if (isRaffling) return;
    
    setIsRaffling(true);
    setRaffleResult(null); // Reset result

    // 1. Pick a random winner index
    const winnerIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[winnerIndex];

    // 2. Calculate rotation
    const sliceAngle = 360 / participants.length;
    const centerAngle = winnerIndex * sliceAngle + sliceAngle / 2;
    const spinCount = 5 + Math.floor(Math.random() * 3); 
    const extraDegrees = 360 * spinCount;
    const targetAlignment = (360 - centerAngle) % 360;
    const currentAlignment = wheelRotation % 360;
    
    let adjustment = targetAlignment - currentAlignment;
    if (adjustment < 0) adjustment += 360; 
    
    const finalRotation = wheelRotation + extraDegrees + adjustment;
    setWheelRotation(finalRotation);

    // 3. Wait for animation to finish (5 seconds)
    setTimeout(() => {
      
      const item = lootItems.find(i => i.id === selectedRaffleItem);
      
      if (item) {
        // Set the full result state to display in popup
        setRaffleResult({
            winner: winner,
            item: item,
            quantityWon: raffleQtyToGive
        });

        setIsRaffling(false);

        // Record History
        const now = new Date();
        const historyRecord: HistoryItem = {
          id: crypto.randomUUID(),
          itemName: item.name,
          rarity: item.rarity,
          winnerName: winner.name,
          quantityWon: raffleQtyToGive,
          timestamp: now.toISOString(),
          displayTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          displayDate: now.toLocaleDateString([], { month: 'short', day: 'numeric' })
        };
        setHistory([historyRecord, ...history]);
        
        // Decrease item quantity
        const newQty = Math.max(0, item.quantity - raffleQtyToGive);
        setLootItems(items => items.map(i => i.id === item.id ? {...i, quantity: newQty} : i));
        
        // Handle logic if item runs out
        if(newQty === 0) {
            setSelectedRaffleItem("");
            setRaffleQtyToGive(1);
        } else if (raffleQtyToGive > newQty) {
            setRaffleQtyToGive(newQty);
        }

        if (removeWinner) {
            setParticipants(prev => prev.filter(p => p.id !== winner.id));
        }
      }
    }, 5000); 
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to delete the entire raffle history? This cannot be undone.")) {
        setHistory([]);
    }
  };

  const handleDownloadHistoryTxt = () => {
    if (history.length === 0) return;
    let content = "📜 CLAN LOOT RAFFLE HISTORY 📜\n================================\n\n";
    history.forEach(h => {
        content += `[${h.displayDate} ${h.displayTime}] ${h.winnerName} won ${h.quantityWon}x ${h.itemName} (${h.rarity.toUpperCase()})\n`;
    });
    content += "\n================================\nGenerated by Clan Loot System";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `loot_history_discord_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackupJson = () => {
    const data = { lootItems, participants, history };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clan_loot_FULL_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if(data.lootItems) setLootItems(data.lootItems);
        if(data.participants) setParticipants(data.participants);
        if(data.history) setHistory(data.history);
        alert("System restored successfully!");
      } catch (err) {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  // 2. UPDATED RARITY COLORS TO INCLUDE UNCOMMON (GREEN)
  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'legendary': return 'bg-orange-500 text-orange-950 border-orange-500/50';
      case 'epic': return 'bg-purple-500 text-purple-950 border-purple-500/50';
      case 'rare': return 'bg-blue-500 text-blue-950 border-blue-500/50';
      case 'uncommon': return 'bg-green-500 text-green-950 border-green-500/50'; // Added Green
      default: return 'bg-zinc-500 text-zinc-950 border-zinc-500/50'; // Common
    }
  };

  // --- Wheel Drawing Helper ---
  const getWheelSlices = () => {
    const total = participants.length;
    if (total === 0) return null;
    const sliceAngle = 360 / total;
    
    const getCoordinates = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return participants.map((p, i) => {
        const startPercent = i / total;
        const endPercent = (i + 1) / total;
        const [startX, startY] = getCoordinates(startPercent);
        const [endX, endY] = getCoordinates(endPercent);
        const largeArcFlag = sliceAngle > 180 ? 1 : 0;
        const pathData = total === 1 
            ? `M 0 0 m -1 0 a 1 1 0 1 0 2 0 a 1 1 0 1 0 -2 0` 
            : `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
        const midAngle = i * sliceAngle + sliceAngle / 2;
        
        return (
            <g key={p.id}>
                <path d={pathData} fill={WHEEL_COLORS[i % WHEEL_COLORS.length]} stroke="#0a0a0a" strokeWidth="0.005" />
                <text 
                    x={0.8} y={0} 
                    fill="white" fontSize="0.06" fontWeight="bold" textAnchor="end" alignmentBaseline="middle"
                    transform={`rotate(${midAngle})`}
                >
                    {p.name.length > 15 ? p.name.substring(0, 12) + '..' : p.name}
                </text>
            </g>
        );
    });
  };

  const getMaxQty = () => {
    const item = lootItems.find(i => i.id === selectedRaffleItem);
    return item ? item.quantity : 1;
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white p-8 flex flex-col items-center font-sans selection:bg-violet-500/30">
      
      {/* --- Header --- */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-400 bg-clip-text text-transparent">
          Clan Loot Raffle System
        </h1>
        <p className="text-zinc-400">
          Automate your clan loot distribution with fair, animated raffles
        </p>
      </div>

      {/* --- Main Content --- */}
      <div className="w-full max-w-6xl">
        <Tabs defaultValue="loot" className="w-full">
          
          <TabsList className="grid w-full grid-cols-4 bg-zinc-900/50 border border-zinc-800 h-12 mb-6">
            <TabsTrigger value="loot" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Box className="w-4 h-4 mr-2" /> Loot</TabsTrigger>
            <TabsTrigger value="participants" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Users className="w-4 h-4 mr-2" /> Participants</TabsTrigger>
            <TabsTrigger value="raffle" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Sparkles className="w-4 h-4 mr-2" /> Raffle</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Trophy className="w-4 h-4 mr-2" /> History</TabsTrigger>
          </TabsList>

          {/* --- LOOT TAB --- */}
          <TabsContent value="loot" className="space-y-6">
            <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Add Loot Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6 space-y-2">
                    <Label className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Item Name</Label>
                    <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g. Dragon Sword" className="bg-zinc-900 border-zinc-800" />
                  </div>
                  <div className="md:col-span-4 space-y-2">
                    <Label className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Rarity</Label>
                    <Select value={newItemRarity} onValueChange={(v: Rarity) => setNewItemRarity(v)}>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="uncommon">Uncommon</SelectItem> {/* 3. ADDED UNCOMMON TO SELECT */}
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Quantity</Label>
                    <Input type="number" min={1} value={newItemQty} onChange={(e) => setNewItemQty(Number(e.target.value))} className="bg-zinc-900 border-zinc-800" />
                  </div>
                </div>
                <Button onClick={addItem} className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white"><Plus className="w-4 h-4 mr-2" /> Add Loot Item</Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 min-h-[200px]">
              <CardHeader><CardTitle className="text-base font-semibold">Loot Pool ({lootItems.reduce((acc, i) => acc + i.quantity, 0)} items)</CardTitle></CardHeader>
              <CardContent>
                {lootItems.length === 0 ? (
                  <div className="flex justify-center items-center h-24 text-zinc-500 text-sm">No items added yet</div>
                ) : (
                  <div className="grid gap-3">
                    {lootItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-md bg-zinc-900/50 border border-zinc-800">
                        <div className="flex items-center gap-3">
                           <Badge variant="outline" className={`${getRarityColor(item.rarity)} uppercase text-[10px]`}>{item.rarity}</Badge>
                           <span>{item.name}</span>
                           <Badge variant="secondary" className="ml-2 bg-zinc-800 text-zinc-400">x{item.quantity}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="h-8 w-8 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- PARTICIPANTS TAB --- */}
          <TabsContent value="participants" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <CardHeader><CardTitle className="text-base font-semibold">Add Single Participant</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input value={newParticipantName} onChange={(e) => setNewParticipantName(e.target.value)} placeholder="e.g. PlayerOne" className="bg-zinc-900 border-zinc-800" onKeyDown={(e) => e.key === 'Enter' && addParticipant()} />
                      <Button onClick={addParticipant} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white"><Plus className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <CardHeader><CardTitle className="text-base font-semibold flex items-center gap-2">Bulk Import <Badge variant="secondary" className="text-xs font-normal bg-zinc-800 text-zinc-400">Paste from Sheets</Badge></CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea placeholder="Paste list of names here (one per line)..." className="min-h-[150px] bg-zinc-900 border-zinc-800 font-mono text-sm" value={bulkNames} onChange={(e) => setBulkNames(e.target.value)} />
                    <Button onClick={handleBulkAdd} className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white" disabled={!bulkNames.trim()}><Plus className="w-4 h-4 mr-2" /> Add All Names</Button>
                  </CardContent>
                </Card>
              </div>
              <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 h-[500px] flex flex-col">
                <CardHeader><CardTitle className="text-base font-semibold flex justify-between items-center">Participants ({participants.length}) {participants.length > 0 && (<Button variant="ghost" size="sm" onClick={() => {if(confirm("Clear all?")) setParticipants([]);}} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 text-xs">Clear All</Button>)}</CardTitle></CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                    {participants.length === 0 ? (
                      <div className="flex flex-col justify-center items-center h-48 text-zinc-500 text-sm gap-2"><Users className="w-8 h-8 opacity-20" /><p>No participants added yet</p></div>
                    ) : (
                      <div className="p-4 grid grid-cols-1 gap-2">
                        {participants.map((p) => (
                          <div key={p.id} className="group flex items-center justify-between p-2 rounded-md bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
                            <span className="font-medium truncate pl-2">{p.name}</span>
                            <Button variant="ghost" size="icon" onClick={() => deleteParticipant(p.id)} className="h-7 w-7 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- RAFFLE TAB --- */}
          <TabsContent value="raffle" className="flex flex-col lg:flex-row gap-6 h-[600px]">
            {/* LEFT: THE WHEEL */}
            <div className="flex-1 relative flex items-center justify-center bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden">
               
               {/* 4. UPDATED WINNER POPUP TO SHOW ITEM */}
               {raffleResult && (
                 <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                   <div className="text-center animate-in zoom-in duration-500 p-8 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl flex flex-col items-center gap-4">
                        <Sparkles className="w-12 h-12 text-yellow-400 mx-auto" />
                        
                        <div>
                            <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Winner</p>
                            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                {raffleResult.winner.name}
                            </h2>
                        </div>

                        {/* Display Won Item */}
                        <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 w-full flex flex-col items-center gap-2">
                            <p className="text-zinc-500 text-xs">Won Loot</p>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`${getRarityColor(raffleResult.item.rarity)} uppercase text-[10px]`}>
                                    {raffleResult.item.rarity}
                                </Badge>
                                <span className="text-xl font-bold">{raffleResult.item.name}</span>
                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">x{raffleResult.quantityWon}</Badge>
                            </div>
                        </div>

                        <Button onClick={() => setRaffleResult(null)} variant="outline" className="border-zinc-700 hover:bg-zinc-800 mt-2">
                            <RefreshCcw className="w-4 h-4 mr-2" /> New Raffle
                        </Button>
                   </div>
                 </div>
               )}

               <div className="absolute right-12 lg:right-24 top-1/2 -translate-y-1/2 z-20 pointer-events-none filter drop-shadow-xl">
                  <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[40px] border-r-white transform rotate-180" />
               </div>

               <div className={`relative transition-all duration-500 ${raffleResult ? 'blur-sm scale-95' : 'scale-100'}`}>
                 <div 
                    className="w-[450px] h-[450px] rounded-full border-8 border-zinc-800 shadow-2xl relative overflow-hidden"
                    style={{
                        transform: `rotate(${wheelRotation}deg)`,
                        transition: isRaffling ? "transform 5s cubic-bezier(0.25, 1, 0.5, 1)" : "none" 
                    }}
                 >
                    <svg viewBox="-1.05 -1.05 2.1 2.1" className="w-full h-full">
                        {participants.length > 0 ? getWheelSlices() : (
                            <g><circle cx="0" cy="0" r="1" fill="#27272a" /><text x="0" y="0" textAnchor="middle" alignmentBaseline="middle" fill="#71717a" fontSize="0.1">Add Participants</text></g>
                        )}
                    </svg>
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-zinc-200 shadow-inner z-10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-zinc-400" />
                 </div>
               </div>
            </div>

            {/* RIGHT: CONTROLS */}
            <Card className="w-full lg:w-96 bg-zinc-950 border-zinc-800 flex flex-col h-full">
                <CardHeader className="pb-3 border-b border-zinc-800">
                    <CardTitle className="text-lg font-semibold flex justify-between items-center">
                        <div className="flex items-center gap-2"><Users className="w-5 h-5" /><span>Entries ({participants.length})</span></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400"><Shuffle className="w-4 h-4" /></Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-2">
                            {participants.length === 0 ? (
                                <p className="text-zinc-500 text-center text-sm py-4">No participants added.</p>
                            ) : (
                                participants.map((p, i) => (
                                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-md bg-zinc-900/50 border border-zinc-800/50">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length] }} />
                                        <span className="font-medium truncate text-sm">{p.name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                
                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Select Loot Item</Label>
                        <Select value={selectedRaffleItem} onValueChange={(val) => { setSelectedRaffleItem(val); setRaffleQtyToGive(1); }}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue placeholder="Choose item..." /></SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                {lootItems.length === 0 ? (<SelectItem value="none" disabled>No items available</SelectItem>) : (lootItems.map(item => (<SelectItem key={item.id} value={item.id} disabled={item.quantity === 0}>{item.name} (Available: {item.quantity})</SelectItem>)))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Quantity to Raffle</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                min={1} 
                                max={getMaxQty()}
                                value={raffleQtyToGive} 
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if(val > 0 && val <= getMaxQty()) setRaffleQtyToGive(val);
                                }}
                                className="bg-zinc-900 border-zinc-800"
                                disabled={!selectedRaffleItem}
                            />
                            <div className="text-xs text-zinc-500 whitespace-nowrap">/ {getMaxQty()} avail</div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 py-1">
                        <Checkbox 
                            id="removeWinner" 
                            checked={removeWinner}
                            onCheckedChange={(checked) => setRemoveWinner(checked as boolean)}
                            className="border-zinc-700 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                        />
                        <Label htmlFor="removeWinner" className="text-xs text-zinc-400 cursor-pointer">Remove winner from pool</Label>
                    </div>

                    <Button onClick={runRaffle} disabled={isRaffling || !selectedRaffleItem || participants.length === 0} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 h-12 text-lg font-semibold shadow-lg shadow-purple-500/20 transition-all active:scale-95">
                        {isRaffling ? (<><RefreshCcw className="w-5 h-5 mr-2 animate-spin" /> Rolling...</>) : (<><Sparkles className="w-5 h-5 mr-2" /> Start Raffle</>)}
                    </Button>
                </div>
            </Card>
          </TabsContent>

          {/* --- HISTORY TAB --- */}
          <TabsContent value="history" className="space-y-6">
            
            {/* 1. DATA MANAGEMENT HEADER */}
            <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Data Management</CardTitle>
                    <CardDescription className="text-zinc-500">Export history for Discord or backup your entire system.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Export for Discord */}
                    <Button onClick={handleDownloadHistoryTxt} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/20">
                        <FileText className="w-4 h-4 mr-2" /> Download History (.txt)
                    </Button>

                    {/* Full Backup */}
                    <Button onClick={handleBackupJson} variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                        <Save className="w-4 h-4 mr-2" /> Backup Full System (.json)
                    </Button>

                    {/* Restore */}
                    <div className="relative">
                        <input type="file" accept=".json" onChange={handleRestoreJson} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                            <Upload className="w-4 h-4 mr-2" /> Restore System Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Separator className="bg-zinc-800" />

            {/* 2. HISTORY LIST */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-zinc-100" />
                    <h3 className="text-lg font-semibold">Raffle History ({history.length})</h3>
                </div>
                {history.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearHistory} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 text-xs">
                        <Trash2 className="w-3 h-3 mr-2" /> Clear History
                    </Button>
                )}
            </div>

            <ScrollArea className="h-[400px] w-full rounded-md">
              <div className="space-y-3">
                {history.length === 0 ? (<p className="text-zinc-500 text-center py-10">No raffle history yet.</p>) : (
                  history.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${getRarityColor(item.rarity)} uppercase text-[10px] font-bold border`}>{item.rarity}</Badge>
                          <span className="font-bold text-zinc-100">{item.itemName}</span>
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px]">x{item.quantityWon}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400"><Trophy className="w-3 h-3 text-yellow-500" /><span>Won by <span className="text-zinc-200">{item.winnerName}</span></span></div>
                      </div>
                      <div className="text-right"><p className="text-xs text-zinc-500 font-mono">{item.displayTime}</p><p className="text-[10px] text-zinc-600">{item.displayDate}</p></div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { Box, Users, Sparkles, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LootTab } from "@/components/LootTab";
import { ParticipantsTab } from "@/components/ParticipantsTab";
import { RaffleTab } from "@/components/RaffleTab";
import { HistoryTab } from "@/components/HistoryTab";

import {
  Rarity,
  ClassRole,
  LootItem,
  Participant,
  HistoryItem,
  RaffleResult,
  RARITY_ORDER,
  CLASSES,
} from "@/lib/constants";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { getHighestRarity } from "@/lib/helpers";

// --- Main Component ---
export default function ClanLootSystem() {
  // --- State ---
  const [lootItems, setLootItems] = useLocalStorage<LootItem[]>(
    "clan-loot",
    [],
  );
  const [participants, setParticipants] = useLocalStorage<Participant[]>(
    "clan-participants",
    [],
  );
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(
    "clan-history",
    [],
  );

  // Raffle States
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [filterRoles, setFilterRoles] = useState<ClassRole[]>([]);
  const [raffleQtyToGive, setRaffleQtyToGive] = useState<number>(1);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [isRaffling, setIsRaffling] = useState(false);
  const [raffleResult, setRaffleResult] = useState<RaffleResult | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [removeWinner, setRemoveWinner] = useState(false);

  // UI States
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // --- Loot Management ---
  const addItem = (item: LootItem) => {
    setLootItems([...lootItems, item]);
  };

  const deleteItem = (id: string) => {
    setLootItems(lootItems.filter((i) => i.id !== id));
    setSelectedItemIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const importItems = (items: LootItem[]) => {
    setLootItems([...lootItems, ...items]);
  };

  const clearAllItems = () => {
    setLootItems([]);
    setSelectedItemIds([]);
  };

  // --- Participants Management ---
  const addParticipant = (participant: Participant) => {
    setParticipants([...participants, participant]);
  };

  const addBulkParticipants = (newParticipants: Participant[]) => {
    setParticipants([...participants, ...newParticipants]);
  };

  const deleteParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const clearAllParticipants = () => {
    setParticipants([]);
  };

  // --- Raffle Logic ---
  const getEligibleParticipants = () => {
    if (filterRoles.length === 0) return participants;
    return participants.filter((p) => filterRoles.includes(p.role));
  };

  const toggleRoleFilter = (role: ClassRole) => {
    setFilterRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
    setRaffleQtyToGive(1);
  };

  const setItemQuantity = (itemId: string, qty: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: qty,
    }));
  };

  const runRaffle = () => {
    const eligibleParticipants = getEligibleParticipants();
    if (selectedItemIds.length === 0 || eligibleParticipants.length === 0)
      return;
    if (isRaffling) return;

    setIsRaffling(true);
    setRaffleResult(null);

    const winnerIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const winner = eligibleParticipants[winnerIndex];

    // Animation Math
    const sliceAngle = 360 / eligibleParticipants.length;
    const centerAngle = winnerIndex * sliceAngle + sliceAngle / 2;
    const spinCount = 5 + Math.floor(Math.random() * 3);
    const extraDegrees = 360 * spinCount;
    const targetAlignment = (360 - centerAngle) % 360;
    const currentAlignment = wheelRotation % 360;
    let adjustment = targetAlignment - currentAlignment;
    if (adjustment < 0) adjustment += 360;
    const finalRotation = wheelRotation + extraDegrees + adjustment;
    setWheelRotation(finalRotation);

    setTimeout(() => {
      const selectedItems = lootItems.filter((i) =>
        selectedItemIds.includes(i.id),
      );

      if (selectedItems.length > 0) {
        const wonItems = selectedItems.map((item) => ({
          name: item.name,
          rarity: item.rarity,
          quantityWon: itemQuantities[item.id] || raffleQtyToGive,
        }));

        setRaffleResult({
          winner: winner,
          wonItems: wonItems,
        });

        setIsRaffling(false);

        const now = new Date();
        const bundleName = selectedItems.map((i) => i.name).join(" + ");
        const bundleRarity = getHighestRarity(selectedItems);

        const historyRecord: HistoryItem = {
          id: crypto.randomUUID(),
          itemName:
            selectedItems.length > 1 ? `Bundle: ${bundleName}` : bundleName,
          rarity: bundleRarity,
          winnerName: winner.name,
          winnerRole: winner.role,
          quantityWon: raffleQtyToGive,
          timestamp: now.toISOString(),
          displayTime: now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          displayDate: now.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          }),
        };
        setHistory([historyRecord, ...history]);

        // Decrease stock
        const newLootItems = lootItems.map((item) => {
          if (selectedItemIds.includes(item.id)) {
            const qtyToGive = itemQuantities[item.id] || raffleQtyToGive;
            return {
              ...item,
              quantity: Math.max(0, item.quantity - qtyToGive),
            };
          }
          return item;
        });
        setLootItems(newLootItems);

        // Validation post-win
        const ranOut = newLootItems.filter(
          (i) => selectedItemIds.includes(i.id) && i.quantity === 0,
        );
        if (ranOut.length > 0) {
          const ranOutIds = ranOut.map((i) => i.id);
          setSelectedItemIds((prev) =>
            prev.filter((id) => !ranOutIds.includes(id)),
          );
          setRaffleQtyToGive(1);
        } else {
          const newMax = Math.min(
            ...newLootItems
              .filter((i) => selectedItemIds.includes(i.id))
              .map((i) => i.quantity),
          );
          if (raffleQtyToGive > newMax) setRaffleQtyToGive(newMax);
        }

        if (removeWinner) {
          setParticipants((prev) => prev.filter((p) => p.id !== winner.id));
        }
      }
    }, 5000);
  };

  // --- History Management ---
  const clearHistory = () => {
    setHistory([]);
  };

  const restoreData = (data: {
    loot: LootItem[];
    participants: Participant[];
    history: HistoryItem[];
  }) => {
    setLootItems(data.loot || []);
    setParticipants(data.participants || []);
    setHistory(data.history || []);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white p-8 flex flex-col items-center font-sans selection:bg-violet-500/30">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-400 bg-clip-text text-transparent">
          Clan Loot Raffle System
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Automate your clan loot distribution with fair, animated raffles
        </p>
      </div>

      <div className="w-full max-w-6xl">
        <Tabs defaultValue="loot" className="w-full">
          <TabsList className="grid w-full grid-cols-4 border border-zinc-200 dark:border-zinc-800 h-12 mb-6 bg-zinc-100 dark:bg-zinc-900">
            <TabsTrigger
              value="loot"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-black dark:data-[state=active]:text-white"
            >
              <Box className="w-4 h-4 mr-2" /> Loot
            </TabsTrigger>
            <TabsTrigger
              value="participants"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-black dark:data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" /> Participants
            </TabsTrigger>
            <TabsTrigger
              value="raffle"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-black dark:data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Raffle
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-black dark:data-[state=active]:text-white"
            >
              <Trophy className="w-4 h-4 mr-2" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loot" className="space-y-6">
            <LootTab
              lootItems={lootItems}
              onAddItem={addItem}
              onDeleteItem={deleteItem}
              onImportItems={importItems}
              onClearAllItems={clearAllItems}
            />
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            <ParticipantsTab
              participants={participants}
              onAddParticipant={addParticipant}
              onAddBulk={addBulkParticipants}
              onDeleteParticipant={deleteParticipant}
              onClearAll={clearAllParticipants}
            />
          </TabsContent>

          <TabsContent value="raffle" className="space-y-6">
            <RaffleTab
              participants={participants}
              lootItems={lootItems}
              raffleResult={raffleResult}
              wheelRotation={wheelRotation}
              isRaffling={isRaffling}
              selectedItemIds={selectedItemIds}
              filterRoles={filterRoles}
              raffleQtyToGive={raffleQtyToGive}
              itemQuantities={itemQuantities}
              removeWinner={removeWinner}
              onToggleItemSelection={toggleItemSelection}
              onToggleRoleFilter={toggleRoleFilter}
              onSetRaffleQty={setRaffleQtyToGive}
              onSetItemQuantity={setItemQuantity}
              onToggleRemoveWinner={setRemoveWinner}
              onRunRaffle={runRaffle}
              onClearResult={() => setRaffleResult(null)}
              onGetEligibleParticipants={getEligibleParticipants}
              isItemDropdownOpen={isItemDropdownOpen}
              setIsItemDropdownOpen={setIsItemDropdownOpen}
              isFilterDropdownOpen={isFilterDropdownOpen}
              setIsFilterDropdownOpen={setIsFilterDropdownOpen}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <HistoryTab
              history={history}
              lootItems={lootItems}
              participants={participants}
              onClearHistory={clearHistory}
              onRestoreData={restoreData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

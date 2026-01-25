import { LootItem, Rarity, RARITY_ORDER, CLASSES, HistoryItem } from "./constants";

export function getRarityColor(rarity: string) {
  return ""; // Use default badge styling from shadcn
}

export function getHighestRarity(items: LootItem[]): Rarity {
  if (items.length === 0) return "common";
  return items.reduce((prev, current) => {
    return RARITY_ORDER[current.rarity] > RARITY_ORDER[prev.rarity] ? current : prev;
  }).rarity;
}

export function downloadHistoryTxt(history: HistoryItem[]) {
  if (history.length === 0) return;
  let content = "📜 CLAN LOOT RAFFLE HISTORY 📜\n================================\n\n";
  history.forEach((h) => {
    content += `[${h.displayDate} ${h.displayTime}] ${h.winnerName} (${CLASSES[h.winnerRole]?.label || "Member"}) won ${h.quantityWon}x ${h.itemName}\n`;
  });
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `loot_history_${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadBackupJson(data: {
  loot: LootItem[];
  participants: any[];
  history: HistoryItem[];
}) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `loot_backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

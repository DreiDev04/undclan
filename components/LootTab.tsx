import React, { useState } from "react";
import { Plus, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LootItem, Rarity } from "@/lib/constants";
import { getRarityColor } from "@/lib/helpers";

interface LootTabProps {
  lootItems: LootItem[];
  onAddItem: (item: LootItem) => void;
  onDeleteItem: (id: string) => void;
  onImportItems: (items: LootItem[]) => void;
  onClearAllItems: () => void;
}

export function LootTab({
  lootItems,
  onAddItem,
  onDeleteItem,
  onImportItems,
  onClearAllItems,
}: LootTabProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [gameImportData, setGameImportData] = useState("");

  const handleAddItem = () => {
    if (!newItemName) return;
    const newItem: LootItem = {
      id: crypto.randomUUID(),
      name: newItemName,
      rarity: "common",
      quantity: newItemQty,
      source: "Manual Add",
      timeLeft: "N/A",
    };
    onAddItem(newItem);
    setNewItemName("");
    setNewItemQty(1);
  };

  const handleGameImport = () => {
    if (!gameImportData.trim()) return;

    const lines = gameImportData.split("\n");
    const newItems: LootItem[] = [];

    lines.forEach((line) => {
      let parts = line.split("\t");
      if (parts.length < 2) parts = line.split(" - ");

      if (parts.length >= 2) {
        const name = parts[0].trim();
        const qtyRaw = parts[1].trim();
        const source = parts[2] ? parts[2].trim() : "Unknown";
        const timeLeft = parts[3] ? parts[3].trim() : "";

        const qty = parseInt(qtyRaw.replace(/[^0-9]/g, "")) || 1;

        if (name) {
          newItems.push({
            id: crypto.randomUUID(),
            name: name,
            quantity: qty,
            rarity: "common",
            source: source,
            timeLeft: timeLeft,
          });
        }
      }
    });

    onImportItems(newItems);
    setGameImportData("");
    alert(`Imported ${newItems.length} items from game data.`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Add Manual Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item Name"
              className="mb-2"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <Button
              onClick={handleAddItem}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Import Game Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={`Paste game data here...\nFormat: Lootname [tab] Quantity [tab] Source [tab] Time`}
              className="min-h-[100px] font-mono text-xs"
              value={gameImportData}
              onChange={(e) => setGameImportData(e.target.value)}
            />
            <Button
              onClick={handleGameImport}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" /> Import Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="min-h-[200px]">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex justify-between items-center">
            Loot Pool ({lootItems.reduce((acc, i) => acc + i.quantity, 0)}{" "}
            items)
            {lootItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("Clear all loot?")) onClearAllItems();
                }}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lootItems.length === 0 ? (
            <div className="flex justify-center items-center h-24 text-sm">
              No items added yet
            </div>
          ) : (
            <div className="grid gap-3">
              {lootItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span>
                        {item.name}
                      </span>
                      <span className="text-[10px]">
                        Source: {item.source || "Manual"} • Time:{" "}
                        {item.timeLeft || "N/A"}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="ml-2"
                    >
                      x{item.quantity}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteItem(item.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { Trophy, Trash2, FileText, Save, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HistoryItem, CLASSES } from "@/lib/constants";
import { getRarityColor, downloadHistoryTxt, downloadBackupJson } from "@/lib/helpers";

interface HistoryTabProps {
  history: HistoryItem[];
  lootItems: any[];
  participants: any[];
  onClearHistory: () => void;
  onRestoreData: (data: any) => void;
}

export function HistoryTab({
  history,
  lootItems,
  participants,
  onClearHistory,
  onRestoreData,
}: HistoryTabProps) {
  const handleDownloadHistoryTxt = () => {
    downloadHistoryTxt(history);
  };

  const handleBackupJson = () => {
    downloadBackupJson({
      loot: lootItems,
      participants: participants,
      history: history,
    });
  };

  const handleRestoreJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        onRestoreData(data);
        alert("Data restored successfully!");
      } catch (error) {
        alert("Failed to restore data. Invalid JSON file.");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Data Management</CardTitle>
          <CardDescription>
            Export history for Discord or backup your entire system.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleDownloadHistoryTxt}
            className="w-full"
          >
            <FileText className="w-4 h-4 mr-2" /> Download History (.txt)
          </Button>
          <Button onClick={handleBackupJson} variant="outline" className="w-full">
            <Save className="w-4 h-4 mr-2" /> Backup Full System (.json)
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreJson}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" /> Restore System Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Raffle History ({history.length})</h3>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Delete history? This cannot be undone.")) onClearHistory();
            }}
            className="h-8 text-xs"
          >
            <Trash2 className="w-3 h-3 mr-2" /> Clear History
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px] w-full rounded-md">
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-center py-10">No raffle history yet.</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-4 rounded-lg border transition-all"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="uppercase text-[10px] font-bold border"
                    >
                      {item.rarity}
                    </Badge>
                    <span className="font-bold">{item.itemName}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px]"
                    >
                      x{item.quantityWon}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="w-3 h-3" />
                    <span>
                      Won by <span className="foreground">{item.winnerName}</span>{" "}
                      <span className="text-xs">
                        ({(CLASSES[item.winnerRole] || CLASSES.unknown).label})
                      </span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono">{item.displayTime}</p>
                  <p className="text-[10px]">{item.displayDate}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

import React, { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Participant, ClassRole, CLASSES } from "@/lib/constants";

interface ParticipantsTabProps {
  participants: Participant[];
  onAddParticipant: (participant: Participant) => void;
  onAddBulk: (participants: Participant[]) => void;
  onDeleteParticipant: (id: string) => void;
  onClearAll: () => void;
}

export function ParticipantsTab({
  participants,
  onAddParticipant,
  onAddBulk,
  onDeleteParticipant,
  onClearAll,
}: ParticipantsTabProps) {
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantRole, setNewParticipantRole] = useState<ClassRole>("warrior");
  const [bulkNames, setBulkNames] = useState("");

  const handleAddParticipant = () => {
    if (!newParticipantName) return;
    const newPerson: Participant = {
      id: crypto.randomUUID(),
      name: newParticipantName,
      role: newParticipantRole,
    };
    onAddParticipant(newPerson);
    setNewParticipantName("");
  };

  const handleBulkAdd = () => {
    if (!bulkNames) return;
    const lines = bulkNames
      .split("\n")
      .filter((n) => n.trim().length > 0);

    const newParticipants = lines.map((line) => {
      let parts = line.split(/[\t,-]/);
      let name = parts[0].trim();
      let detectedRole: ClassRole = "unknown";

      if (parts.length > 1) {
        const roleStr = parts[1].toLowerCase().trim();
        if (roleStr.includes("warrior")) detectedRole = "warrior";
        else if (roleStr.includes("berserker")) detectedRole = "berserker";
        else if (roleStr.includes("skald")) detectedRole = "skald";
        else if (roleStr.includes("archer")) detectedRole = "archer";
        else if (roleStr.includes("volva")) detectedRole = "volva";
      }

      return {
        id: crypto.randomUUID(),
        name: name,
        role: detectedRole,
      };
    });

    onAddBulk(newParticipants);
    setBulkNames("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Add Single Participant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  placeholder="e.g. PlayerOne"
                  onKeyDown={(e) => e.key === "Enter" && handleAddParticipant()}
                />
                <div className="flex gap-2">
                  <Select
                    value={newParticipantRole}
                    onValueChange={(v: ClassRole) => setNewParticipantRole(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CLASSES).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          {val.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddParticipant}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Bulk Import{" "}
                <Badge variant="secondary" className="text-xs font-normal">
                  Paste: Name - Role
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`Player1 - Warrior\nPlayer2 - Archer\nPlayer3 (defaults to Unknown)`}
                className="min-h-[150px] font-mono text-sm"
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
              />
              <Button
                onClick={handleBulkAdd}
                className="w-full"
                disabled={!bulkNames.trim()}
              >
                <Plus className="w-4 h-4 mr-2" /> Add All Names
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex justify-between items-center">
              Participants ({participants.length}){" "}
              {participants.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm("Clear all?")) onClearAll();
                  }}
                  className="h-8 text-xs"
                >
                  Clear All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              {participants.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-48 text-sm gap-2">
                  <Users className="w-8 h-8" />
                  <p>No participants added yet</p>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 gap-2">
                  {participants.map((p) => {
                    const roleClass = CLASSES[p.role] || CLASSES.unknown;
                    const RoleIcon = roleClass.icon;
                    return (
                      <div
                        key={p.id}
                        className="group flex items-center justify-between p-2 rounded-md border transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-6 w-6 p-0 flex items-center justify-center rounded-full"
                          >
                            <RoleIcon className="w-3 h-3" />
                          </Badge>
                          <span className="font-medium truncate">{p.name}</span>
                          <span className="text-[10px] uppercase">
                            {roleClass.label}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteParticipant(p.id)}
                          className="h-7 w-7 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

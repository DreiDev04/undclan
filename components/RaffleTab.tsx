import React from "react";
import { Sparkles, RefreshCcw, Users, ChevronDown, Filter, X, Check, Shuffle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Slider,
} from "@/components/ui/slider";
import {
  Participant,
  ClassRole,
  LootItem,
  RaffleResult,
  CLASSES,
  WHEEL_COLORS,
} from "@/lib/constants";

interface RaffleTabProps {
  participants: Participant[];
  lootItems: LootItem[];
  raffleResult: RaffleResult | null;
  wheelRotation: number;
  isRaffling: boolean;
  selectedItemIds: string[];
  filterRoles: ClassRole[];
  raffleQtyToGive: number;
  itemQuantities: Record<string, number>;
  removeWinner: boolean;
  onToggleItemSelection: (id: string) => void;
  onToggleRoleFilter: (role: ClassRole) => void;
  onSetRaffleQty: (qty: number) => void;
  onSetItemQuantity: (itemId: string, qty: number) => void;
  onToggleRemoveWinner: (remove: boolean) => void;
  onRunRaffle: () => void;
  onClearResult: () => void;
  onGetEligibleParticipants: () => Participant[];
  isItemDropdownOpen: boolean;
  setIsItemDropdownOpen: (open: boolean) => void;
  isFilterDropdownOpen: boolean;
  setIsFilterDropdownOpen: (open: boolean) => void;
}

export function RaffleTab({
  participants,
  lootItems,
  raffleResult,
  wheelRotation,
  isRaffling,
  selectedItemIds,
  filterRoles,
  raffleQtyToGive,
  itemQuantities,
  removeWinner,
  onToggleItemSelection,
  onToggleRoleFilter,
  onSetRaffleQty,
  onSetItemQuantity,
  onToggleRemoveWinner,
  onRunRaffle,
  onClearResult,
  onGetEligibleParticipants,
  isItemDropdownOpen,
  setIsItemDropdownOpen,
  isFilterDropdownOpen,
  setIsFilterDropdownOpen,
}: RaffleTabProps) {
  const eligibleParticipants = onGetEligibleParticipants();
  const maxQty = Math.min(
    ...(selectedItemIds.length > 0
      ? lootItems
          .filter((i) => selectedItemIds.includes(i.id))
          .map((i) => i.quantity)
      : [1])
  );

  const getWheelSlices = () => {
    if (eligibleParticipants.length === 0) return null;
    const sliceAngle = 360 / eligibleParticipants.length;

    const getCoordinates = (percent: number) => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    return eligibleParticipants.map((p, i) => {
      const startPercent = i / eligibleParticipants.length;
      const endPercent = (i + 1) / eligibleParticipants.length;
      const [startX, startY] = getCoordinates(startPercent);
      const [endX, endY] = getCoordinates(endPercent);
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const pathData =
        eligibleParticipants.length === 1
          ? `M 0 0 m -1 0 a 1 1 0 1 0 2 0 a 1 1 0 1 0 -2 0`
          : `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
      const midAngle = i * sliceAngle + sliceAngle / 2;

      return (
        <g key={p.id}>
          <path
            d={pathData}
            fill={WHEEL_COLORS[i % WHEEL_COLORS.length]}
            stroke="#0a0a0a"
            strokeWidth="0.005"
          />
          <text
            x={0.8}
            y={0}
            fill="white"
            fontSize="0.05"
            fontWeight="bold"
            textAnchor="end"
            alignmentBaseline="middle"
            transform={`rotate(${midAngle})`}
          >
            {p.name.length > 15 ? p.name.substring(0, 12) + ".." : p.name}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
      {/* LEFT: THE WHEEL */}
      <div className="flex-1 relative flex items-center justify-center rounded-xl border overflow-hidden">
        {raffleResult && (
          <div className="absolute inset-0 z-30 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="text-center animate-in zoom-in duration-500 p-8 rounded-xl border shadow-2xl flex flex-col items-center gap-4 max-w-md w-full bg-card">
              <Sparkles className="w-12 h-12 mx-auto" />
              <div>
                <p className="text-xs uppercase tracking-widest mb-1">
                  Winner
                </p>
                <h2 className="text-4xl font-bold">
                  {raffleResult.winner.name}
                </h2>
                {(() => {
                  const winnerRole = CLASSES[raffleResult.winner.role] || CLASSES.unknown;
                  return (
                    <Badge
                      variant="outline"
                      className="mt-2"
                    >
                      {winnerRole.label}
                    </Badge>
                  );
                })()}
              </div>
              <div className="border p-4 rounded-lg w-full flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                <p className="text-xs mb-1">Won Loot Bundle</p>
                {raffleResult.wonItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {item.rarity}
                      </Badge>
                      <span className="font-medium text-sm text-left">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      x{item.quantityWon}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button onClick={onClearResult} variant="outline" className="w-full mt-2">
                <RefreshCcw className="w-4 h-4 mr-2" /> New Raffle
              </Button>
            </div>
          </div>
        )}

        <div className="absolute right-12 lg:right-24 top-1/2 -translate-y-1/2 z-20 pointer-events-none filter drop-shadow-xl">
          <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[40px] border-r-white dark:border-r-white transform" />
        </div>
        <div
          className={`relative transition-all duration-500 ${
            raffleResult ? "blur-sm scale-95" : "scale-100"
          }`}
        >
          <div
            className="w-[450px] h-[450px] rounded-full border-8 shadow-2xl relative overflow-hidden"
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              transition: isRaffling ? "transform 5s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
            }}
          >
            <svg viewBox="-1.05 -1.05 2.1 2.1" className="w-full h-full">
              {eligibleParticipants.length > 0 ? (
                getWheelSlices()
              ) : (
                <g>
                  <circle cx="0" cy="0" r="1" fill="#f5f5f5" />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="0.1"
                  >
                    No Eligible Players
                  </text>
                </g>
              )}
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 shadow-inner z-10 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* RIGHT: CONTROLS */}
      <Card className="w-full lg:w-96 flex flex-col h-full">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg font-semibold flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Entries ({eligibleParticipants.length})</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Shuffle className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        {/* Entries List */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-42">
            <div className="p-4 space-y-2">
              {eligibleParticipants.length === 0 ? (
                <p className="text-center text-sm py-4">
                  No participants match filters.
                </p>
              ) : (
                eligibleParticipants.map((p, i) => {
                  const roleClass = CLASSES[p.role] || CLASSES.unknown;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2 rounded-md border"
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: WHEEL_COLORS[i % WHEEL_COLORS.length] }}
                      />
                      <span className="font-medium truncate text-sm">{p.name}</span>
                      <span className="text-[9px] uppercase ml-auto">
                        {roleClass.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <div className="p-4 border-t space-y-4">
          {/* LOOT SELECTION */}
          <div className="space-y-2 relative">
            <Label className="text-[10px] uppercase font-bold tracking-wider">
              Select Loot Items (Bundle)
            </Label>
            <Button
              variant="outline"
              role="combobox"
              onClick={() => setIsItemDropdownOpen(!isItemDropdownOpen)}
              className="w-full justify-between"
            >
              {selectedItemIds.length > 0
                ? `${selectedItemIds.length} items selected`
                : "Choose items to raffle..."}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            {isItemDropdownOpen && (
              <Card className="absolute z-50 w-full bottom-full mb-2 shadow-xl">
                <CardHeader className="p-3 border-b flex flex-row items-center justify-between">
                  <span className="text-xs font-semibold">Available Loot</span>
                  <X
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setIsItemDropdownOpen(false)}
                  />
                </CardHeader>
                <CardContent className="p-0 max-h-[200px] overflow-hidden">
                  <ScrollArea className="h-[200px]">
                    {lootItems.length === 0 ? (
                      <div className="p-4 text-center text-xs">
                        No items created
                      </div>
                    ) : (
                      <div className="p-1">
                        {lootItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() =>
                              item.quantity > 0 && onToggleItemSelection(item.id)
                            }
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                              item.quantity === 0
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-accent"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                selectedItemIds.includes(item.id)
                                  ? "border"
                                  : ""
                              }`}
                            >
                              {selectedItemIds.includes(item.id) && (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                              <span className="text-sm truncate">{item.name}</span>
                              <Badge variant="outline" className="text-[10px] h-5">
                                x{item.quantity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* PER-ITEM QUANTITY CONTROLS */}
          {selectedItemIds.length > 0 && (
            <div className="space-y-3 border rounded-lg p-3">
              <Label className="text-[10px] uppercase font-bold tracking-wider">
                Quantity Per Item
              </Label>
              {lootItems
                .filter((item) => selectedItemIds.includes(item.id))
                .map((item) => {
                  const itemQty = itemQuantities[item.id] ?? 1;
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate">{item.name}</span>
                        <span className="text-xs font-semibold">{itemQty} of {item.quantity}</span>
                      </div>
                      <Slider
                        value={[itemQty]}
                        onValueChange={(val) => onSetItemQuantity(item.id, val[0])}
                        min={1}
                        max={item.quantity}
                        step={1}
                        className="flex-1"
                      />
                    </div>
                  );
                })}
            </div>
          )}

          {/* CLASS FILTER SELECTION */}
          <div className="space-y-2 relative">
            <Label className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
              <Filter className="w-3 h-3" /> Filter Participants by Class
            </Label>
            <Button
              variant="outline"
              role="combobox"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="w-full justify-between"
            >
              {filterRoles.length > 0
                ? `${filterRoles.length} roles selected`
                : "All Classes Allowed"}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            {isFilterDropdownOpen && (
              <Card className="absolute z-50 w-full bottom-full mb-2 shadow-xl">
                <CardHeader className="p-3 border-b flex flex-row items-center justify-between">
                  <span className="text-xs font-semibold">Allowed Classes</span>
                  <X
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setIsFilterDropdownOpen(false)}
                  />
                </CardHeader>
                <CardContent className="p-1">
                  {Object.entries(CLASSES).map(([key, val]) => (
                    <div
                      key={key}
                      onClick={() => onToggleRoleFilter(key as ClassRole)}
                      className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          filterRoles.includes(key as ClassRole)
                            ? "border"
                            : ""
                        }`}
                      >
                        {filterRoles.includes(key as ClassRole) && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <span className="text-sm">{val.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex items-center space-x-2 py-1">
            <Checkbox
              id="removeWinner"
              checked={removeWinner}
              onCheckedChange={(checked) => onToggleRemoveWinner(checked as boolean)}
              className=""
            />
            <Label htmlFor="removeWinner" className="text-xs cursor-pointer">
              Remove winner from pool
            </Label>
          </div>

          <Button
            onClick={onRunRaffle}
            disabled={isRaffling || selectedItemIds.length === 0 || eligibleParticipants.length === 0}
            className="w-full h-12 text-lg font-semibold transition-all active:scale-95"
          >
            {isRaffling ? (
              <>
                <RefreshCcw className="w-5 h-5 mr-2 animate-spin" /> Rolling...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" /> Start Raffle
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

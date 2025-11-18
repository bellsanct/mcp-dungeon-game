export type EquipmentType = 'weapon' | 'shield' | 'armor' | 'accessory';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'herb' | 'charm';

export interface Stats {
  attack: number;
  defense: number;
  speed: number;
  luck: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: Rarity;
  stats: Stats;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  effect: ItemEffect;
}

export interface ItemEffect {
  // 薬草用: HP回復
  healPercentage?: number;
  activateAtHpPercentage?: number;

  // おまもり用: マイナスイベント回避
  blockNegativeEvent?: boolean;
  singleUse?: boolean;
}

export interface EquipmentSlots {
  weapon: Equipment | null;
  shield: Equipment | null;
  armor: Equipment | null;
  accessory: Equipment | null;
  item1: Item | null;
  item2: Item | null;
  [key: string]: Equipment | Item | null;
}

export interface DungeonProgress {
  dungeonId: string;
  startTime: number;
  estimatedEndTime: number;
  battleLog: BattleLogEntry[];
  events: EventLogEntry[];
}

export interface BattleLogEntry {
  floor: number;
  enemyName: string;
  victory: boolean;
  damageDealt: number;
  damageTaken: number;
  criticalHits: number;
  dodges: number;
  goldEarned: number;
  itemsDropped: Equipment[];
  herbUsed?: boolean;
}

export type EventType =
  | 'trap_fall'
  | 'poison'
  | 'treasure'
  | 'healing_fountain'
  | 'trap_damage'
  | 'shortcut'
  | 'ambush'
  | 'item_drop';

export interface EventLogEntry {
  floor: number;
  type: EventType;
  description: string;
  effect: {
    goldChange?: number;
    itemsGained?: Equipment[];
    holdingItemsGained?: Item[];
    damageDealt?: number;
    floorsSkipped?: number;
  };
  charmBlocked?: boolean;
}

export interface PlayerData {
  name: string;
  equipment: EquipmentSlots;
  inventory: Equipment[];
  itemInventory: Item[];
  gold: number;
  currentDungeon?: DungeonProgress;
  state: 'idle' | 'exploring'; // プレイヤーの状態
}

export interface Enemy {
  name: string;
  stats: Stats;
  goldDrop: [number, number]; // [min, max]
  equipmentDropRate: number; // 0-1
  exclusiveDrops?: Equipment[]; // この敵専用のドロップ装備
}

export interface Dungeon {
  id: string;
  name: string;
  floors: number;
  baseTime: number; // minutes
  enemies: Enemy[];
  boss: Enemy;
  rewardPool: Equipment[];
  itemRewardPool: Item[]; // 持ち物ドロップテーブル
}

export interface GameData {
  player: PlayerData;
  version: string;
}

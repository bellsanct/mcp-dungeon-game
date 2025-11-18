import type { Dungeon } from '../types.js';
import { BOSS_EXCLUSIVE_EQUIPMENT, getEquipmentByLevel } from './equipment.js';
import { getItemsByLevel } from './items.js';

export const DUNGEONS: Dungeon[] = [
  {
    id: 'beginner_cave',
    name: '初心者の洞窟',
    level: 5,
    floors: 5,
    baseTime: 10, // 10分
    enemies: [
      {
        name: 'スライム',
        stats: { attack: 1, defense: 1, speed: 1, luck: 0, hitpoint: 20 },
        goldDrop: [5, 15],
        equipmentDropRate: 0.1
      },
      {
        name: 'ゴブリン',
        stats: { attack: 2, defense: 2, speed: 2, luck: 1, hitpoint: 30 },
        goldDrop: [10, 25],
        equipmentDropRate: 0.15
      }
    ],
    boss: {
      name: '洞窟トロル',
      stats: { attack: 5, defense: 5, speed: 3, luck: 2, hitpoint: 80 },
      goldDrop: [50, 100],
      equipmentDropRate: 0.5,
      exclusiveDrops: [BOSS_EXCLUSIVE_EQUIPMENT[0]] // ゴブリンの王冠
    },
    rewardPool: getEquipmentByLevel(5), // ダンジョンレベル5に適した装備
    itemRewardPool: getItemsByLevel(5) // ダンジョンレベル5に適したアイテム
  },
  {
    id: 'dark_forest',
    name: '暗黒の森',
    level: 20,
    floors: 10,
    baseTime: 20, // 20分
    enemies: [
      {
        name: '野生の狼',
        stats: { attack: 8, defense: 3, speed: 5, luck: 2, hitpoint: 50 },
        goldDrop: [15, 30],
        equipmentDropRate: 0.12
      },
      {
        name: 'ダークエルフ',
        stats: { attack: 12, defense: 5, speed: 8, luck: 5, hitpoint: 60 },
        goldDrop: [25, 50],
        equipmentDropRate: 0.2
      },
      {
        name: 'トレント',
        stats: { attack: 10, defense: 15, speed: 1, luck: 0, hitpoint: 100 },
        goldDrop: [30, 60],
        equipmentDropRate: 0.15
      }
    ],
    boss: {
      name: '森の守護者',
      stats: { attack: 30, defense: 20, speed: 10, luck: 5, hitpoint: 200 },
      goldDrop: [150, 250],
      equipmentDropRate: 0.7,
      exclusiveDrops: [BOSS_EXCLUSIVE_EQUIPMENT[1]] // 闇エルフの弓
    },
    rewardPool: getEquipmentByLevel(20), // ダンジョンレベル20に適した装備
    itemRewardPool: getItemsByLevel(20) // ダンジョンレベル20に適したアイテム
  },
  {
    id: 'ancient_ruins',
    name: '古代遺跡',
    level: 40,
    floors: 15,
    baseTime: 30, // 30分
    enemies: [
      {
        name: 'スケルトンウォリアー',
        stats: { attack: 18, defense: 8, speed: 6, luck: 3, hitpoint: 90 },
        goldDrop: [40, 80],
        equipmentDropRate: 0.18
      },
      {
        name: 'レイス',
        stats: { attack: 22, defense: 5, speed: 12, luck: 8, hitpoint: 80 },
        goldDrop: [50, 100],
        equipmentDropRate: 0.22
      },
      {
        name: 'ストーンゴーレム',
        stats: { attack: 15, defense: 25, speed: 2, luck: 1, hitpoint: 150 },
        goldDrop: [60, 120],
        equipmentDropRate: 0.2
      }
    ],
    boss: {
      name: '古代のリッチ',
      stats: { attack: 45, defense: 30, speed: 15, luck: 10, hitpoint: 350 },
      goldDrop: [300, 500],
      equipmentDropRate: 0.85,
      exclusiveDrops: [BOSS_EXCLUSIVE_EQUIPMENT[2]] // ゴーレムの核
    },
    rewardPool: getEquipmentByLevel(40), // ダンジョンレベル40に適した装備
    itemRewardPool: getItemsByLevel(40) // ダンジョンレベル40に適したアイテム
  },
  {
    id: 'demon_castle',
    name: '魔王城',
    level: 80,
    floors: 25,
    baseTime: 60, // 60分
    enemies: [
      {
        name: '魔族兵士',
        stats: { attack: 30, defense: 15, speed: 10, luck: 5, hitpoint: 150 },
        goldDrop: [80, 150],
        equipmentDropRate: 0.25
      },
      {
        name: 'ヘルハウンド',
        stats: { attack: 35, defense: 10, speed: 20, luck: 8, hitpoint: 120 },
        goldDrop: [90, 180],
        equipmentDropRate: 0.25
      },
      {
        name: 'ダークナイト',
        stats: { attack: 40, defense: 30, speed: 12, luck: 10, hitpoint: 180 },
        goldDrop: [100, 200],
        equipmentDropRate: 0.3
      }
    ],
    boss: {
      name: '魔王',
      stats: { attack: 80, defense: 50, speed: 25, luck: 15, hitpoint: 500 },
      goldDrop: [800, 1500],
      equipmentDropRate: 0.95,
      exclusiveDrops: [BOSS_EXCLUSIVE_EQUIPMENT[3], BOSS_EXCLUSIVE_EQUIPMENT[4]] // 魔王の剣と鎧
    },
    rewardPool: getEquipmentByLevel(80), // ダンジョンレベル80に適した装備
    itemRewardPool: getItemsByLevel(80) // ダンジョンレベル80に適したアイテム
  }
];

export function getDungeonById(id: string): Dungeon | undefined {
  return DUNGEONS.find(d => d.id === id);
}

export function getAllDungeons(): Dungeon[] {
  return DUNGEONS;
}

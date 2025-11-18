import type { Equipment } from '../types.js';

export const STARTER_EQUIPMENT: Equipment[] = [
  // コモン武器
  {
    id: 'rusty_sword',
    name: '錆びた剣',
    type: 'weapon',
    rarity: 'common',
    stats: { attack: 5, defense: 0, speed: 0, luck: 0 },
    levelRange: [1, 15]
  },
  {
    id: 'wooden_staff',
    name: '木の杖',
    type: 'weapon',
    rarity: 'common',
    stats: { attack: 4, defense: 0, speed: 1, luck: 0 },
    levelRange: [1, 15]
  },
  {
    id: 'iron_dagger',
    name: '鉄の短剣',
    type: 'weapon',
    rarity: 'common',
    stats: { attack: 3, defense: 0, speed: 3, luck: 1 },
    levelRange: [1, 15]
  },

  // コモン盾
  {
    id: 'wooden_shield',
    name: '木の盾',
    type: 'shield',
    rarity: 'common',
    stats: { attack: 0, defense: 5, speed: -1, luck: 0 },
    levelRange: [1, 15]
  },

  // コモン防具
  {
    id: 'leather_armor',
    name: '革の鎧',
    type: 'armor',
    rarity: 'common',
    stats: { attack: 0, defense: 3, speed: 0, luck: 0 },
    levelRange: [1, 15]
  },

  // コモンアクセサリ
  {
    id: 'copper_ring',
    name: '銅の指輪',
    type: 'accessory',
    rarity: 'common',
    stats: { attack: 1, defense: 1, speed: 0, luck: 0 },
    levelRange: [1, 15]
  }
];

export const EQUIPMENT_POOL: Equipment[] = [
  ...STARTER_EQUIPMENT,
  
  // レア武器 (Lv 10-30)
  {
    id: 'steel_sword',
    name: '鋼の剣',
    type: 'weapon',
    rarity: 'rare',
    stats: { attack: 12, defense: 0, speed: 0, luck: 0 },
    levelRange: [10, 30]
  },
  {
    id: 'magic_wand',
    name: '魔法の杖',
    type: 'weapon',
    rarity: 'rare',
    stats: { attack: 10, defense: 0, speed: 2, luck: 3 },
    levelRange: [10, 30]
  },

  // レア盾 (Lv 10-30)
  {
    id: 'iron_shield',
    name: '鉄の盾',
    type: 'shield',
    rarity: 'rare',
    stats: { attack: 0, defense: 10, speed: -1, luck: 0 },
    levelRange: [10, 30]
  },

  // レア防具 (Lv 10-30)
  {
    id: 'chainmail',
    name: '鎖帷子',
    type: 'armor',
    rarity: 'rare',
    stats: { attack: 0, defense: 8, speed: -2, luck: 0 },
    levelRange: [10, 30]
  },

  // レアアクセサリ (Lv 10-30)
  {
    id: 'silver_ring',
    name: '銀の指輪',
    type: 'accessory',
    rarity: 'rare',
    stats: { attack: 2, defense: 2, speed: 1, luck: 2 },
    levelRange: [10, 30]
  },
  {
    id: 'lucky_charm',
    name: '幸運のお守り',
    type: 'accessory',
    rarity: 'rare',
    stats: { attack: 0, defense: 0, speed: 0, luck: 10 },
    levelRange: [10, 30]
  },

  // エピック武器 (Lv 25-60)
  {
    id: 'flame_sword',
    name: '炎の剣',
    type: 'weapon',
    rarity: 'epic',
    stats: { attack: 25, defense: 0, speed: 3, luck: 0 },
    levelRange: [25, 60]
  },

  // エピック盾 (Lv 25-60)
  {
    id: 'tower_shield',
    name: 'タワーシールド',
    type: 'shield',
    rarity: 'epic',
    stats: { attack: 0, defense: 20, speed: -3, luck: 0 },
    levelRange: [25, 60]
  },

  // エピック防具 (Lv 25-60)
  {
    id: 'plate_armor',
    name: 'プレートアーマー',
    type: 'armor',
    rarity: 'epic',
    stats: { attack: 0, defense: 18, speed: -3, luck: 0 },
    levelRange: [25, 60]
  },

  // エピックアクセサリ (Lv 25-60)
  {
    id: 'gold_ring',
    name: '金の指輪',
    type: 'accessory',
    rarity: 'epic',
    stats: { attack: 5, defense: 5, speed: 2, luck: 5 },
    levelRange: [25, 60]
  },

  // レジェンダリ武器 (Lv 50-100)
  {
    id: 'excalibur',
    name: 'エクスカリバー',
    type: 'weapon',
    rarity: 'legendary',
    stats: { attack: 50, defense: 5, speed: 5, luck: 10 },
    levelRange: [50, 100]
  },

  // レジェンダリ盾 (Lv 50-100)
  {
    id: 'aegis',
    name: 'イージスの盾',
    type: 'shield',
    rarity: 'legendary',
    stats: { attack: 0, defense: 40, speed: 0, luck: 10 },
    levelRange: [50, 100]
  },

  // レジェンダリ防具 (Lv 50-100)
  {
    id: 'dragon_armor',
    name: '竜鱗の鎧',
    type: 'armor',
    rarity: 'legendary',
    stats: { attack: 5, defense: 35, speed: -1, luck: 5 },
    levelRange: [50, 100]
  },

  // レジェンダリアクセサリ (Lv 50-100)
  {
    id: 'philosophers_stone',
    name: '賢者の石',
    type: 'accessory',
    rarity: 'legendary',
    stats: { attack: 10, defense: 10, speed: 5, luck: 20 },
    levelRange: [50, 100]
  }
];

// ボス・特定敵専用装備
export const BOSS_EXCLUSIVE_EQUIPMENT: Equipment[] = [
  // ゴブリンキング専用（初級ボス Lv 5）
  {
    id: 'goblin_crown',
    name: 'ゴブリンの王冠',
    type: 'accessory',
    rarity: 'rare',
    stats: { attack: 3, defense: 3, speed: 2, luck: 5 },
    levelRange: [5, 20]
  },

  // ダークエルフクイーン専用（中級ボス Lv 20）
  {
    id: 'dark_elf_bow',
    name: '闇エルフの弓',
    type: 'weapon',
    rarity: 'epic',
    stats: { attack: 20, defense: 0, speed: 8, luck: 3 },
    levelRange: [20, 40]
  },

  // ストーンゴーレム専用（上級ボス Lv 40）
  {
    id: 'golem_core',
    name: 'ゴーレムの核',
    type: 'accessory',
    rarity: 'epic',
    stats: { attack: 8, defense: 15, speed: -2, luck: 0 },
    levelRange: [40, 70]
  },

  // 魔王専用（最終ボス Lv 80）
  {
    id: 'demon_lord_sword',
    name: '魔王の剣',
    type: 'weapon',
    rarity: 'legendary',
    stats: { attack: 45, defense: 5, speed: 8, luck: 8 },
    levelRange: [80, 100]
  },
  {
    id: 'demon_lord_armor',
    name: '魔王の鎧',
    type: 'armor',
    rarity: 'legendary',
    stats: { attack: 3, defense: 30, speed: 0, luck: 7 },
    levelRange: [80, 100]
  }
];

export function getEquipmentById(id: string): Equipment | undefined {
  return EQUIPMENT_POOL.find(eq => eq.id === id);
}

export function getEquipmentByRarity(rarity: string): Equipment[] {
  return EQUIPMENT_POOL.filter(eq => eq.rarity === rarity);
}

/**
 * ダンジョンレベルに応じた装備ドロップテーブルを生成
 * @param dungeonLevel ダンジョンのレベル (1-100)
 * @param margin レベル範囲の余裕 (デフォルト: 10)
 * @returns ドロップ可能な装備の配列
 */
export function getEquipmentByLevel(dungeonLevel: number, margin: number = 10): Equipment[] {
  return EQUIPMENT_POOL.filter(eq => {
    const [minLevel, maxLevel] = eq.levelRange;
    // ダンジョンレベル ± margin の範囲内の装備を含める
    return dungeonLevel >= minLevel - margin && dungeonLevel <= maxLevel + margin;
  });
}

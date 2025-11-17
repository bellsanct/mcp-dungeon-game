import type { Equipment } from '../types.js';

export const STARTER_EQUIPMENT: Equipment[] = [
  // コモン武器
  {
    id: 'rusty_sword',
    name: '錆びた剣',
    type: 'weapon',
    rarity: 'common',
    stats: { attack: 5, defense: 0, speed: 0, luck: 0 }
  },
  {
    id: 'wooden_staff',
    name: '木の杖',
    type: 'weapon',
    rarity: 'common',
    stats: { attack: 4, defense: 0, speed: 1, luck: 0 }
  },
  {
    id: 'iron_dagger',
    name: '鉄の短剣',
    type: 'weapon',
    rarity: 'common',
    stats: { attack: 3, defense: 0, speed: 3, luck: 1 }
  },

  // コモン盾
  {
    id: 'wooden_shield',
    name: '木の盾',
    type: 'shield',
    rarity: 'common',
    stats: { attack: 0, defense: 5, speed: -1, luck: 0 }
  },

  // コモン防具
  {
    id: 'leather_armor',
    name: '革の鎧',
    type: 'armor',
    rarity: 'common',
    stats: { attack: 0, defense: 3, speed: 0, luck: 0 }
  },

  // コモンアクセサリ
  {
    id: 'copper_ring',
    name: '銅の指輪',
    type: 'accessory',
    rarity: 'common',
    stats: { attack: 1, defense: 1, speed: 0, luck: 0 }
  }
];

export const EQUIPMENT_POOL: Equipment[] = [
  ...STARTER_EQUIPMENT,
  
  // レア武器
  {
    id: 'steel_sword',
    name: '鋼の剣',
    type: 'weapon',
    rarity: 'rare',
    stats: { attack: 12, defense: 0, speed: 0, luck: 0 }
  },
  {
    id: 'magic_wand',
    name: '魔法の杖',
    type: 'weapon',
    rarity: 'rare',
    stats: { attack: 10, defense: 0, speed: 2, luck: 3 }
  },

  // レア盾
  {
    id: 'iron_shield',
    name: '鉄の盾',
    type: 'shield',
    rarity: 'rare',
    stats: { attack: 0, defense: 10, speed: -1, luck: 0 }
  },

  // レア防具
  {
    id: 'chainmail',
    name: '鎖帷子',
    type: 'armor',
    rarity: 'rare',
    stats: { attack: 0, defense: 8, speed: -2, luck: 0 }
  },

  // レアアクセサリ
  {
    id: 'silver_ring',
    name: '銀の指輪',
    type: 'accessory',
    rarity: 'rare',
    stats: { attack: 2, defense: 2, speed: 1, luck: 2 }
  },
  {
    id: 'lucky_charm',
    name: '幸運のお守り',
    type: 'accessory',
    rarity: 'rare',
    stats: { attack: 0, defense: 0, speed: 0, luck: 10 }
  },

  // エピック武器
  {
    id: 'flame_sword',
    name: '炎の剣',
    type: 'weapon',
    rarity: 'epic',
    stats: { attack: 25, defense: 0, speed: 3, luck: 0 }
  },

  // エピック盾
  {
    id: 'tower_shield',
    name: 'タワーシールド',
    type: 'shield',
    rarity: 'epic',
    stats: { attack: 0, defense: 20, speed: -3, luck: 0 }
  },

  // エピック防具
  {
    id: 'plate_armor',
    name: 'プレートアーマー',
    type: 'armor',
    rarity: 'epic',
    stats: { attack: 0, defense: 18, speed: -3, luck: 0 }
  },

  // エピックアクセサリ
  {
    id: 'gold_ring',
    name: '金の指輪',
    type: 'accessory',
    rarity: 'epic',
    stats: { attack: 5, defense: 5, speed: 2, luck: 5 }
  },

  // レジェンダリ武器
  {
    id: 'excalibur',
    name: 'エクスカリバー',
    type: 'weapon',
    rarity: 'legendary',
    stats: { attack: 50, defense: 5, speed: 5, luck: 10 }
  },

  // レジェンダリ盾
  {
    id: 'aegis',
    name: 'イージスの盾',
    type: 'shield',
    rarity: 'legendary',
    stats: { attack: 0, defense: 40, speed: 0, luck: 10 }
  },

  // レジェンダリ防具
  {
    id: 'dragon_armor',
    name: '竜鱗の鎧',
    type: 'armor',
    rarity: 'legendary',
    stats: { attack: 5, defense: 35, speed: -1, luck: 5 }
  },

  // レジェンダリアクセサリ
  {
    id: 'philosophers_stone',
    name: '賢者の石',
    type: 'accessory',
    rarity: 'legendary',
    stats: { attack: 10, defense: 10, speed: 5, luck: 20 }
  }
];

export function getEquipmentById(id: string): Equipment | undefined {
  return EQUIPMENT_POOL.find(eq => eq.id === id);
}

export function getEquipmentByRarity(rarity: string): Equipment[] {
  return EQUIPMENT_POOL.filter(eq => eq.rarity === rarity);
}

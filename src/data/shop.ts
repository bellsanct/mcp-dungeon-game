import type { Equipment, Item } from '../types.js';

export interface ShopEquipment extends Equipment {
  price: number;
}

export interface ShopItem extends Item {
  price: number;
}

// ショップで販売する装備
export const SHOP_EQUIPMENT: ShopEquipment[] = [
  // コモン装備（安価）
  {
    id: 'shop_rusty_sword',
    name: '錆びた剣',
    type: 'weapon',
    rarity: 'common',
    stats: { attack: 5, defense: 0, speed: 0, luck: 0 },
    price: 50
  },
  {
    id: 'shop_wooden_shield',
    name: '木の盾',
    type: 'shield',
    rarity: 'common',
    stats: { attack: 0, defense: 5, speed: -1, luck: 0 },
    price: 50
  },
  {
    id: 'shop_leather_armor',
    name: '革の鎧',
    type: 'armor',
    rarity: 'common',
    stats: { attack: 0, defense: 3, speed: 0, luck: 0 },
    price: 50
  },
  {
    id: 'shop_copper_ring',
    name: '銅の指輪',
    type: 'accessory',
    rarity: 'common',
    stats: { attack: 1, defense: 1, speed: 0, luck: 0 },
    price: 50
  },

  // レア装備（中価格）
  {
    id: 'shop_steel_sword',
    name: '鋼の剣',
    type: 'weapon',
    rarity: 'rare',
    stats: { attack: 12, defense: 0, speed: 0, luck: 0 },
    price: 200
  },
  {
    id: 'shop_iron_shield',
    name: '鉄の盾',
    type: 'shield',
    rarity: 'rare',
    stats: { attack: 0, defense: 10, speed: -1, luck: 0 },
    price: 200
  },
  {
    id: 'shop_chainmail',
    name: '鎖帷子',
    type: 'armor',
    rarity: 'rare',
    stats: { attack: 0, defense: 8, speed: -2, luck: 0 },
    price: 200
  },
  {
    id: 'shop_silver_ring',
    name: '銀の指輪',
    type: 'accessory',
    rarity: 'rare',
    stats: { attack: 2, defense: 2, speed: 1, luck: 2 },
    price: 250
  },
  {
    id: 'shop_lucky_charm',
    name: '幸運のお守り',
    type: 'accessory',
    rarity: 'rare',
    stats: { attack: 0, defense: 0, speed: 0, luck: 10 },
    price: 300
  },

  // エピック装備（高価格）
  {
    id: 'shop_flame_sword',
    name: '炎の剣',
    type: 'weapon',
    rarity: 'epic',
    stats: { attack: 25, defense: 0, speed: 3, luck: 0 },
    price: 800
  },
  {
    id: 'shop_tower_shield',
    name: 'タワーシールド',
    type: 'shield',
    rarity: 'epic',
    stats: { attack: 0, defense: 20, speed: -3, luck: 0 },
    price: 800
  },
  {
    id: 'shop_plate_armor',
    name: 'プレートアーマー',
    type: 'armor',
    rarity: 'epic',
    stats: { attack: 0, defense: 18, speed: -3, luck: 0 },
    price: 800
  },
  {
    id: 'shop_gold_ring',
    name: '金の指輪',
    type: 'accessory',
    rarity: 'epic',
    stats: { attack: 5, defense: 5, speed: 2, luck: 5 },
    price: 1000
  }
];

// ショップで販売する持ち物アイテム
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop_herb',
    name: '薬草',
    type: 'herb',
    description: 'HP30%以下で自動的に50%回復する',
    effect: { healPercentage: 50, activateAtHpPercentage: 30, singleUse: true },
    price: 100
  },
  {
    id: 'shop_charm',
    name: 'おまもり',
    type: 'charm',
    description: 'マイナスなイベントを1度だけ回避できる',
    effect: { blockNegativeEvent: true, singleUse: true },
    price: 150
  },
  {
    id: 'shop_high_potion',
    name: '上級回復薬',
    type: 'herb',
    description: 'HP20%以下で自動的に80%回復する',
    effect: { healPercentage: 80, activateAtHpPercentage: 20, singleUse: true },
    price: 300
  },
  {
    id: 'shop_golden_charm',
    name: '金のおまもり',
    type: 'charm',
    description: 'マイナスなイベントを1度だけ回避できる（強力版）',
    effect: { blockNegativeEvent: true, singleUse: true },
    price: 400
  }
];

export function getShopEquipmentById(id: string): ShopEquipment | undefined {
  return SHOP_EQUIPMENT.find(eq => eq.id === id);
}

export function getShopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === id);
}

import type { Item } from '../types.js';

export const ITEMS_POOL: Item[] = [
  {
    id: 'herb',
    name: '薬草',
    type: 'herb',
    description: 'HP30%以下で自動的に50%回復する',
    effect: {
      healPercentage: 50,
      activateAtHpPercentage: 30,
      singleUse: true
    },
    levelRange: [1, 20]
  },
  {
    id: 'charm',
    name: 'おまもり',
    type: 'charm',
    description: 'マイナスなイベントを1度だけ回避できる',
    effect: {
      blockNegativeEvent: true,
      singleUse: true
    },
    levelRange: [1, 30]
  },
  {
    id: 'high_potion',
    name: '上級回復薬',
    type: 'herb',
    description: 'HP20%以下で自動的に80%回復する',
    effect: {
      healPercentage: 80,
      activateAtHpPercentage: 20,
      singleUse: true
    },
    levelRange: [15, 60]
  },
  {
    id: 'golden_charm',
    name: '金のおまもり',
    type: 'charm',
    description: 'マイナスなイベントを1度だけ回避できる（強力版）',
    effect: {
      blockNegativeEvent: true,
      singleUse: true
    },
    levelRange: [20, 80]
  },
  {
    id: 'holy_charm',
    name: '聖なるおまもり',
    type: 'charm',
    description: 'HPが0になったときに、1度だけ全回復して復活できる',
    effect: {
      revive: true,
      healPercentage: 100,
      singleUse: true
    },
    levelRange: [40, 100]
  }
];

export function getItemById(id: string): Item | undefined {
  return ITEMS_POOL.find(item => item.id === id);
}

/**
 * ダンジョンレベルに応じたアイテムドロップテーブルを生成
 * @param dungeonLevel ダンジョンのレベル (1-100)
 * @param margin レベル範囲の余裕 (デフォルト: 10)
 * @returns ドロップ可能なアイテムの配列
 */
export function getItemsByLevel(dungeonLevel: number, margin: number = 10): Item[] {
  return ITEMS_POOL.filter(item => {
    if (!item.levelRange) return true; // レベル範囲なしのアイテムは常にドロップ可能
    const [minLevel, maxLevel] = item.levelRange;
    return dungeonLevel >= minLevel - margin && dungeonLevel <= maxLevel + margin;
  });
}

export function generateUniqueItemId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function cloneItem(item: Item): Item {
  return {
    ...item,
    id: generateUniqueItemId(),
    effect: { ...item.effect },
    levelRange: item.levelRange
  };
}

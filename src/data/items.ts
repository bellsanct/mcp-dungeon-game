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
    }
  },
  {
    id: 'charm',
    name: 'おまもり',
    type: 'charm',
    description: 'マイナスなイベントを1度だけ回避できる',
    effect: {
      blockNegativeEvent: true,
      singleUse: true
    }
  }
];

export function getItemById(id: string): Item | undefined {
  return ITEMS_POOL.find(item => item.id === id);
}

export function generateUniqueItemId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function cloneItem(item: Item): Item {
  return {
    ...item,
    id: generateUniqueItemId(),
    effect: { ...item.effect }
  };
}

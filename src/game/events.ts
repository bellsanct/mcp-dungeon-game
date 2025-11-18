import type { EventLogEntry, EventType, Equipment, Item } from '../types.js';
import { ITEMS_POOL, cloneItem } from '../data/items.js';

interface EventConfig {
  type: EventType;
  probability: number; // 0-1
  description: string;
  goldChange?: [number, number]; // [min, max]
  damageRange?: [number, number]; // [min, max]
  floorsSkipped?: number;
  canDropItem?: boolean;
  canDropHoldingItem?: boolean;
}

// イベント定義（自然言語で記述）
const EVENT_CONFIGS: EventConfig[] = [
  {
    type: 'trap_fall',
    probability: 0.05,
    description: '落とし穴に落ちて次の階に転落した！',
    floorsSkipped: 1
  },
  {
    type: 'poison',
    probability: 0.08,
    description: '毒の罠を踏んでしまった！',
    damageRange: [5, 15]
  },
  {
    type: 'treasure',
    probability: 0.1,
    description: '隠された宝箱を発見した！',
    goldChange: [20, 50],
    canDropItem: true
  },
  {
    type: 'healing_fountain',
    probability: 0.06,
    description: '癒しの泉を発見した。体力が回復した。',
    damageRange: [-20, -10] // マイナスは回復
  },
  {
    type: 'trap_damage',
    probability: 0.12,
    description: '針の罠が作動した！',
    damageRange: [3, 8]
  },
  {
    type: 'shortcut',
    probability: 0.04,
    description: '隠し通路を発見！階段を飛ばして進んだ。',
    floorsSkipped: 2
  },
  {
    type: 'ambush',
    probability: 0.1,
    description: '敵の奇襲を受けた！',
    damageRange: [10, 20]
  },
  {
    type: 'item_drop',
    probability: 0.08,
    description: '宝箱の中に持ち物を発見した！',
    canDropHoldingItem: true
  }
];

export function rollForEvent(
  floor: number,
  luckStat: number,
  rewardPool: Equipment[],
  equippedCharm?: Item,
  itemRewardPool?: Item[]
): EventLogEntry | null {
  // 運が高いほどポジティブなイベント発生率が上がる
  const luckModifier = luckStat / 100;

  for (const config of EVENT_CONFIGS) {
    let probability = config.probability;

    // ポジティブなイベントは運で確率上昇
    if (config.type === 'treasure' || config.type === 'healing_fountain' || config.type === 'shortcut' || config.type === 'item_drop') {
      probability *= (1 + luckModifier);
    }
    // ネガティブなイベントは運で確率減少
    else {
      probability *= (1 - luckModifier * 0.5);
    }

    if (Math.random() < probability) {
      const event = generateEvent(floor, config, rewardPool, itemRewardPool);

      // Check if charm should block this negative event
      if (
        equippedCharm?.effect.blockNegativeEvent &&
        isNegativeEvent(config.type)
      ) {
        event.charmBlocked = true;
        event.description = 'おまもりが災難から守ってくれた！';
        event.effect = {}; // Clear all negative effects
      }

      return event;
    }
  }

  return null;
}

function isNegativeEvent(eventType: EventType): boolean {
  const negativeEvents: EventType[] = [
    'trap_fall',
    'poison',
    'trap_damage',
    'ambush'
  ];
  return negativeEvents.includes(eventType);
}

function generateEvent(
  floor: number,
  config: EventConfig,
  rewardPool: Equipment[],
  itemRewardPool?: Item[]
): EventLogEntry {
  const event: EventLogEntry = {
    floor,
    type: config.type,
    description: config.description,
    effect: {}
  };

  // ゴールド変化
  if (config.goldChange) {
    const [min, max] = config.goldChange;
    event.effect.goldChange = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ダメージ/回復
  if (config.damageRange) {
    const [min, max] = config.damageRange;
    event.effect.damageDealt = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 階層スキップ
  if (config.floorsSkipped) {
    event.effect.floorsSkipped = config.floorsSkipped;
  }

  // アイテムドロップ
  if (config.canDropItem && Math.random() < 0.3 && rewardPool.length > 0) {
    const randomItem = rewardPool[Math.floor(Math.random() * rewardPool.length)];
    event.effect.itemsGained = [randomItem];
  }

  // 持ち物ドロップ（ダンジョン固有のプールから選択、なければ全体プールから）
  if (config.canDropHoldingItem) {
    const pool = itemRewardPool && itemRewardPool.length > 0 ? itemRewardPool : ITEMS_POOL;
    if (pool.length > 0) {
      const randomHoldingItem = pool[Math.floor(Math.random() * pool.length)];
      event.effect.holdingItemsGained = [cloneItem(randomHoldingItem)];
    }
  }

  return event;
}

// イベント結果を日本語で説明
export function formatEventDescription(event: EventLogEntry): string {
  let output = `【${event.floor}階】${event.description}`;

  if (event.effect.goldChange) {
    if (event.effect.goldChange > 0) {
      output += ` (ゴールド +${event.effect.goldChange})`;
    } else {
      output += ` (ゴールド ${event.effect.goldChange})`;
    }
  }

  if (event.effect.damageDealt) {
    if (event.effect.damageDealt > 0) {
      output += ` (ダメージ ${event.effect.damageDealt})`;
    } else {
      output += ` (回復 ${Math.abs(event.effect.damageDealt)})`;
    }
  }

  if (event.effect.floorsSkipped) {
    output += ` (${event.effect.floorsSkipped}階スキップ)`;
  }

  if (event.effect.itemsGained && event.effect.itemsGained.length > 0) {
    const items = event.effect.itemsGained.map(i => i.name).join(', ');
    output += ` (装備入手: ${items})`;
  }

  if (event.effect.holdingItemsGained && event.effect.holdingItemsGained.length > 0) {
    const items = event.effect.holdingItemsGained.map(i => i.name).join(', ');
    output += ` (持ち物入手: ${items})`;
  }

  if (event.charmBlocked) {
    output += ' (おまもりで回避！)';
  }

  return output;
}

// カスタムイベントを追加する関数（将来的な拡張用）
export function addCustomEvent(config: EventConfig): void {
  EVENT_CONFIGS.push(config);
}

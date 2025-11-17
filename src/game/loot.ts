import type { Equipment, Enemy } from '../types.js';

export interface LootResult {
  gold: number;
  equipment: Equipment[];
}

export function rollLoot(enemy: Enemy, luckStat: number, rewardPool: Equipment[]): LootResult {
  const result: LootResult = {
    gold: 0,
    equipment: []
  };

  // Calculate gold drop
  const [minGold, maxGold] = enemy.goldDrop;
  result.gold = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;

  // Roll for equipment drop
  const dropChance = enemy.equipmentDropRate * (1 + luckStat / 100);
  
  if (Math.random() < dropChance && rewardPool.length > 0) {
    // Determine rarity based on luck
    const rarityRoll = Math.random() * 100;
    const luckBonus = luckStat / 2;
    
    let targetRarity: string;
    if (rarityRoll + luckBonus > 98) {
      targetRarity = 'legendary';
    } else if (rarityRoll + luckBonus > 90) {
      targetRarity = 'epic';
    } else if (rarityRoll + luckBonus > 70) {
      targetRarity = 'rare';
    } else {
      targetRarity = 'common';
    }

    // Filter pool by rarity
    let eligibleItems = rewardPool.filter(item => item.rarity === targetRarity);
    
    // Fallback to all items if no items of target rarity
    if (eligibleItems.length === 0) {
      eligibleItems = rewardPool;
    }

    // Pick random item
    const randomItem = eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
    result.equipment.push(randomItem);
  }

  return result;
}

export function rollMultipleLoot(
  enemies: Enemy[],
  luckStat: number,
  rewardPool: Equipment[],
  count: number
): LootResult {
  const totalResult: LootResult = {
    gold: 0,
    equipment: []
  };

  for (let i = 0; i < count; i++) {
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    const loot = rollLoot(enemy, luckStat, rewardPool);
    
    totalResult.gold += loot.gold;
    totalResult.equipment.push(...loot.equipment);
  }

  return totalResult;
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function cloneEquipment(equipment: Equipment): Equipment {
  return {
    ...equipment,
    id: generateUniqueId(), // Generate unique ID for inventory items
    stats: { ...equipment.stats }
  };
}

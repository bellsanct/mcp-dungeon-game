import type { Stats, Enemy, Equipment, Item } from '../types.js';

export interface CombatResult {
  victory: boolean;
  damageDealt: number;
  damageTaken: number;
  criticalHits: number;
  dodges: number;
  herbUsed: boolean;
}

export function calculateTotalStats(equipment: { [key: string]: Equipment | Item | null }): Stats {
  const total: Stats = {
    attack: 0,
    defense: 0,
    speed: 0,
    luck: 0
  };

  for (const item of Object.values(equipment)) {
    if (item && 'stats' in item) {
      // Only Equipment has stats, Items don't
      total.attack += item.stats.attack;
      total.defense += item.stats.defense;
      total.speed += item.stats.speed;
      total.luck += item.stats.luck;
    }
  }

  // Ensure luck doesn't exceed 100%
  total.luck = Math.min(total.luck, 100);

  return total;
}

export function simulateCombat(
  playerStats: Stats,
  enemy: Enemy,
  equippedHerb?: Item
): CombatResult {
  const result: CombatResult = {
    victory: false,
    damageDealt: 0,
    damageTaken: 0,
    criticalHits: 0,
    dodges: 0,
    herbUsed: false
  };

  // Simple combat simulation
  let playerHp = 100 + playerStats.defense * 5; // Base HP + defense bonus
  const maxPlayerHp = playerHp;
  let enemyHp = 100 + enemy.stats.defense * 5;

  let turn = 0;
  const maxTurns = 100; // Prevent infinite loops
  let herbUsed = false;

  while (playerHp > 0 && enemyHp > 0 && turn < maxTurns) {
    // Player's turn
    const playerDodge = Math.random() * 100 < playerStats.luck;
    if (!playerDodge) {
      const playerCrit = Math.random() * 100 < playerStats.luck;
      const playerDamage = playerCrit 
        ? playerStats.attack * 2 
        : playerStats.attack;
      
      const actualDamage = Math.max(1, playerDamage - Math.floor(enemy.stats.defense * 0.5));
      enemyHp -= actualDamage;
      result.damageDealt += actualDamage;
      
      if (playerCrit) {
        result.criticalHits++;
      }
    }

    if (enemyHp <= 0) {
      result.victory = true;
      break;
    }

    // Enemy's turn
    const enemyDodge = Math.random() * 100 < playerStats.luck;
    if (enemyDodge) {
      result.dodges++;
    } else {
      // Defense reduction with some randomness
      const defenseReduction = playerStats.defense * (0.8 + Math.random() * 0.4);
      const enemyDamage = Math.max(1, enemy.stats.attack - Math.floor(defenseReduction));
      playerHp -= enemyDamage;
      result.damageTaken += enemyDamage;
    }

    // Check if herb should be used (HP30%以下で50%回復)
    if (
      !herbUsed &&
      equippedHerb?.effect.activateAtHpPercentage &&
      equippedHerb.effect.healPercentage
    ) {
      const hpPercentage = (playerHp / maxPlayerHp) * 100;
      if (hpPercentage <= equippedHerb.effect.activateAtHpPercentage) {
        const healAmount = Math.floor(maxPlayerHp * (equippedHerb.effect.healPercentage / 100));
        playerHp = Math.min(playerHp + healAmount, maxPlayerHp);
        herbUsed = true;
        result.herbUsed = true;
      }
    }

    turn++;
  }

  // If max turns reached, determine winner by remaining HP percentage
  if (turn >= maxTurns) {
    result.victory = playerHp > enemyHp;
  }

  return result;
}

export function calculateDungeonTime(baseTime: number, speedStat: number): number {
  // Each point of speed reduces time by 2%, minimum 50% of base time
  const reduction = Math.min(speedStat * 0.02, 0.5);
  return Math.ceil(baseTime * (1 - reduction));
}

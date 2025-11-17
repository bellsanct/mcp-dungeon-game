import { CryptoStorage } from '../storage/crypto.js';
import { getAllDungeons, getDungeonById } from '../data/dungeons.js';
import { calculateTotalStats, simulateCombat, calculateDungeonTime } from '../game/combat.js';
import { rollLoot, cloneEquipment } from '../game/loot.js';
import { rollForEvent, formatEventDescription } from '../game/events.js';
import { cloneItem } from '../data/items.js';
import type { Dungeon, BattleLogEntry, Item } from '../types.js';

const storage = new CryptoStorage();

export async function listDungeons(password: string): Promise<string> {
  const data = await storage.load(password);
  
  if (!data.player.name) {
    return "プレイヤーが見つかりません。先に'create_player'を実行してください。";
  }

  const dungeons = getAllDungeons();
  const playerStats = calculateTotalStats(data.player.equipment);

  let output = `=== 利用可能なダンジョン ===\n\n`;

  for (const dungeon of dungeons) {
    const actualTime = calculateDungeonTime(dungeon.baseTime, playerStats.speed);
    
    output += `[${dungeon.id}] ${dungeon.name}\n`;
    output += `  階層: ${dungeon.floors}階\n`;
    output += `  所要時間: ${actualTime}分 (基本: ${dungeon.baseTime}分)\n`;
    output += `  出現モンスター: ${dungeon.enemies.map(e => e.name).join(', ')}\n`;
    output += `  ボス: ${dungeon.boss.name}\n`;
    output += `  報酬レアリティ: ${[...new Set(dungeon.rewardPool.map(r => r.rarity))].join(', ')}\n`;
    output += '\n';
  }

  output += `詳細情報: 'dungeon_info <dungeon_id>'\n`;
  output += `探索開始: 'start_dungeon <dungeon_id>'`;

  return output;
}

export async function dungeonInfo(dungeonId: string, password: string): Promise<string> {
  const data = await storage.load(password);
  
  if (!data.player.name) {
    return "プレイヤーが見つかりません。先に'create_player'を実行してください。";
  }

  const dungeon = getDungeonById(dungeonId);
  
  if (!dungeon) {
    return `ダンジョン '${dungeonId}' が見つかりません。`;
  }

  const playerStats = calculateTotalStats(data.player.equipment);
  const actualTime = calculateDungeonTime(dungeon.baseTime, playerStats.speed);

  let output = `=== ${dungeon.name} ===\n\n`;
  output += `階層: ${dungeon.floors}階\n`;
  output += `推定所要時間: ${actualTime}分\n\n`;
  
  output += `出現モンスター:\n`;
  for (const enemy of dungeon.enemies) {
    output += `  ${enemy.name}\n`;
    output += `    攻撃: ${enemy.stats.attack} 防御: ${enemy.stats.defense} 速度: ${enemy.stats.speed} 運: ${enemy.stats.luck}\n`;
    output += `    ゴールド: ${enemy.goldDrop[0]}-${enemy.goldDrop[1]}\n`;
    output += `    ドロップ率: ${(enemy.equipmentDropRate * 100).toFixed(1)}%\n`;
  }

  output += `\nボス:\n`;
  output += `  ${dungeon.boss.name}\n`;
  output += `    攻撃: ${dungeon.boss.stats.attack} 防御: ${dungeon.boss.stats.defense} 速度: ${dungeon.boss.stats.speed} 運: ${dungeon.boss.stats.luck}\n`;
  output += `    ゴールド: ${dungeon.boss.goldDrop[0]}-${dungeon.boss.goldDrop[1]}\n`;
  output += `    ドロップ率: ${(dungeon.boss.equipmentDropRate * 100).toFixed(1)}%\n`;

  output += `\n入手可能な装備:\n`;
  const rarities = [...new Set(dungeon.rewardPool.map(r => r.rarity))];
  for (const rarity of rarities) {
    const items = dungeon.rewardPool.filter(r => r.rarity === rarity);
    output += `  ${rarity}: ${items.length}種類\n`;
  }

  return output;
}

export async function startDungeon(dungeonId: string, password: string): Promise<string> {
  const data = await storage.load(password);
  
  if (!data.player.name) {
    return "プレイヤーが見つかりません。先に'create_player'を実行してください。";
  }

  if (data.player.currentDungeon) {
    const remaining = Math.max(0, data.player.currentDungeon.estimatedEndTime - Date.now());
    const minutes = Math.ceil(remaining / 60000);
    return `既にダンジョンを探索中です！\n残り時間: 約${minutes}分\n\n'check_progress'で進行状況を確認できます。`;
  }

  const dungeon = getDungeonById(dungeonId);
  
  if (!dungeon) {
    return `ダンジョン '${dungeonId}' が見つかりません。`;
  }

  const playerStats = calculateTotalStats(data.player.equipment);
  const actualTime = calculateDungeonTime(dungeon.baseTime, playerStats.speed);

  const startTime = Date.now();
  const estimatedEndTime = startTime + (actualTime * 60 * 1000);

  data.player.currentDungeon = {
    dungeonId,
    startTime,
    estimatedEndTime,
    battleLog: [],
    events: []
  };
  data.player.state = 'exploring';

  await storage.save(data, password);

  return `🗡️  ${dungeon.name}の探索を開始しました！\n\n推定完了時刻: ${actualTime}分後\n\n'check_progress'で進行状況を確認できます。`;
}

export async function checkProgress(password: string): Promise<string> {
  const data = await storage.load(password);

  if (!data.player.name) {
    return "プレイヤーが見つかりません。先に'create_player'を実行してください。";
  }

  if (!data.player.currentDungeon) {
    return "現在探索中のダンジョンはありません。\n\n'list_dungeons'で利用可能なダンジョンを確認できます。";
  }

  const now = Date.now();
  const { dungeonId, startTime, estimatedEndTime } = data.player.currentDungeon;
  const remaining = estimatedEndTime - now;

  if (remaining > 0) {
    // 探索中 - リアルタイム進行状況を計算
    const dungeon = getDungeonById(dungeonId);

    if (!dungeon) {
      return "エラー: ダンジョンデータが見つかりません。";
    }

    // 経過時間と進行度を計算
    const totalTime = estimatedEndTime - startTime;
    const elapsed = now - startTime;
    const progressPercentage = Math.min((elapsed / totalTime) * 100, 100);

    // 現在の階層を推定（線形補間）
    const currentFloor = Math.floor((dungeon.floors * progressPercentage) / 100);
    const displayFloor = Math.max(1, Math.min(currentFloor, dungeon.floors));

    // 残り時間表示
    const minutes = Math.ceil(remaining / 60000);
    const seconds = Math.ceil((remaining % 60000) / 1000);

    let output = `⚔️  ${dungeon.name}を探索中...\n\n`;
    output += `進行状況: ${progressPercentage.toFixed(1)}%\n`;
    output += `推定現在地: ${displayFloor}階 / ${dungeon.floors}階\n`;
    output += `残り時間: ${minutes}分${seconds}秒\n\n`;

    // プログレスバー
    const barLength = 20;
    const filledLength = Math.floor((progressPercentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    output += `[${bar}] ${progressPercentage.toFixed(0)}%\n\n`;

    // 装備している持ち物の状態
    const playerStats = calculateTotalStats(data.player.equipment);
    const equippedHerb = data.player.equipment.item1?.type === 'herb'
      ? data.player.equipment.item1
      : data.player.equipment.item2?.type === 'herb'
      ? data.player.equipment.item2
      : undefined;

    const equippedCharm = data.player.equipment.item1?.type === 'charm'
      ? data.player.equipment.item1
      : data.player.equipment.item2?.type === 'charm'
      ? data.player.equipment.item2
      : undefined;

    if (equippedHerb || equippedCharm) {
      output += `持ち物状態:\n`;
      if (equippedHerb) {
        output += `  🌿 ${equippedHerb.name}: 待機中\n`;
      }
      if (equippedCharm) {
        output += `  🛡️ ${equippedCharm.name}: 待機中\n`;
      }
      output += '\n';
    }

    // 探索中の活動概要（推定）
    output += `=== 探索状況 ===\n`;

    // 進行度に基づいて推定される活動
    const estimatedBattles = Math.floor(displayFloor * 2); // 各階2戦想定
    const estimatedEvents = Math.floor(displayFloor * 0.3); // 30%程度でイベント

    output += `推定戦闘数: 約${estimatedBattles}回\n`;
    output += `推定イベント: 約${estimatedEvents}回\n\n`;

    // 現在までの階層表示（簡易）
    if (displayFloor > 1) {
      output += `通過した階層:\n`;
      const maxDisplay = Math.min(displayFloor, 5); // 最新5階まで表示
      const startFloor = Math.max(1, displayFloor - maxDisplay + 1);

      for (let f = startFloor; f <= displayFloor; f++) {
        if (f === displayFloor) {
          output += `  → ${f}階 (探索中...)\n`;
        } else {
          output += `  ✓ ${f}階 (通過済み)\n`;
        }
      }

      if (displayFloor < dungeon.floors) {
        output += `  ... ${dungeon.floors - displayFloor}階が残っています\n`;
      }
      output += '\n';
    }

    output += `💡 ヒント:\n`;
    output += `- 'view_status'でキャラクター情報を確認\n`;
    output += `- 完了後、もう一度'check_progress'で詳細な結果を確認\n`;
    output += `- 'view_battle_log'で完了後の戦闘ログを閲覧可能\n`;

    return output;
  }

  // ダンジョン完了 - 結果を処理
  return await completeDungeon(password);
}

async function completeDungeon(password: string): Promise<string> {
  const data = await storage.load(password);
  
  if (!data.player.currentDungeon) {
    return "進行中のダンジョンがありません。";
  }

  const dungeon = getDungeonById(data.player.currentDungeon.dungeonId);
  
  if (!dungeon) {
    return "エラー: ダンジョンデータが見つかりません。";
  }

  const playerStats = calculateTotalStats(data.player.equipment);

  let output = `=== ダンジョン攻略完了！ ===\n\n`;
  output += `${dungeon.name}を制覇しました！\n\n`;

  // バトルログとイベントログ
  const battleLog: BattleLogEntry[] = [];
  const events = data.player.currentDungeon.events;

  let totalGold = 0;
  const allLoot: typeof data.player.inventory = [];
  const allItemLoot: Item[] = [];
  let currentFloor = 1;
  let totalDamageDealt = 0;
  let totalDamageTaken = 0;
  let totalCrits = 0;
  let totalDodges = 0;

  // 装備している持ち物を取得
  const equippedHerb = data.player.equipment.item1?.type === 'herb'
    ? data.player.equipment.item1
    : data.player.equipment.item2?.type === 'herb'
    ? data.player.equipment.item2
    : undefined;

  const equippedCharm = data.player.equipment.item1?.type === 'charm'
    ? data.player.equipment.item1
    : data.player.equipment.item2?.type === 'charm'
    ? data.player.equipment.item2
    : undefined;

  let herbUsedTotal = false;
  let charmUsedTotal = false;

  // 階層ごとに進行
  while (currentFloor <= dungeon.floors) {
    // イベント判定
    const event = rollForEvent(
      currentFloor,
      playerStats.luck,
      dungeon.rewardPool,
      charmUsedTotal ? undefined : equippedCharm
    );
    if (event) {
      events.push(event);

      // おまもりが使用された場合
      if (event.charmBlocked) {
        charmUsedTotal = true;
      }

      // イベント効果を適用
      if (event.effect.goldChange) {
        totalGold += event.effect.goldChange;
      }
      if (event.effect.itemsGained) {
        allLoot.push(...event.effect.itemsGained.map(cloneEquipment));
      }
      if (event.effect.holdingItemsGained) {
        allItemLoot.push(...event.effect.holdingItemsGained.map(cloneItem));
      }
      if (event.effect.floorsSkipped) {
        currentFloor += event.effect.floorsSkipped;
        continue;
      }
    }

    // 通常の戦闘（各階2体）
    for (let i = 0; i < 2 && currentFloor <= dungeon.floors; i++) {
      const enemy = dungeon.enemies[Math.floor(Math.random() * dungeon.enemies.length)];
      const combatResult = simulateCombat(
        playerStats,
        enemy,
        herbUsedTotal ? undefined : equippedHerb
      );

      // 薬草が使用された場合
      if (combatResult.herbUsed) {
        herbUsedTotal = true;
      }

      const loot = rollLoot(enemy, playerStats.luck, dungeon.rewardPool);

      const battleEntry: BattleLogEntry = {
        floor: currentFloor,
        enemyName: enemy.name,
        victory: combatResult.victory,
        damageDealt: combatResult.damageDealt,
        damageTaken: combatResult.damageTaken,
        criticalHits: combatResult.criticalHits,
        dodges: combatResult.dodges,
        goldEarned: combatResult.victory ? loot.gold : 0,
        itemsDropped: combatResult.victory ? loot.equipment.map(cloneEquipment) : [],
        herbUsed: combatResult.herbUsed
      };
      
      battleLog.push(battleEntry);
      
      if (combatResult.victory) {
        totalGold += loot.gold;
        allLoot.push(...loot.equipment.map(cloneEquipment));
        totalDamageDealt += combatResult.damageDealt;
        totalDamageTaken += combatResult.damageTaken;
        totalCrits += combatResult.criticalHits;
        totalDodges += combatResult.dodges;
      } else {
        // 敗北した場合
        output += `\n❌ ${currentFloor}階で${enemy.name}に敗北...\n\n`;
        output += `獲得したものの一部を失いました。\n`;
        totalGold = Math.floor(totalGold * 0.5);
        allLoot.length = Math.floor(allLoot.length * 0.5);
        
        data.player.gold += totalGold;
        data.player.inventory.push(...allLoot);
        data.player.currentDungeon = undefined;
        data.player.state = 'idle';
        await storage.save(data, password);
        
        output += `\nゴールド: +${totalGold}\n`;
        return output;
      }
    }

    currentFloor++;
  }

  // ボス戦
  output += `\n【ボス戦】 ${dungeon.boss.name}\n`;
  const bossCombat = simulateCombat(
    playerStats,
    dungeon.boss,
    herbUsedTotal ? undefined : equippedHerb
  );

  if (bossCombat.herbUsed) {
    herbUsedTotal = true;
  }

  if (bossCombat.victory) {
    output += `✅ 勝利！\n`;
    output += `  与ダメージ: ${bossCombat.damageDealt}\n`;
    output += `  被ダメージ: ${bossCombat.damageTaken}\n`;
    output += `  クリティカル: ${bossCombat.criticalHits}回\n`;
    output += `  回避: ${bossCombat.dodges}回\n`;
    if (bossCombat.herbUsed) {
      output += `  薬草使用: ✅\n`;
    }
    output += '\n';

    const bossLoot = rollLoot(dungeon.boss, playerStats.luck, dungeon.rewardPool);
    totalGold += bossLoot.gold;
    allLoot.push(...bossLoot.equipment.map(cloneEquipment));
    totalCrits += bossCombat.criticalHits;
    totalDodges += bossCombat.dodges;
  } else {
    output += `❌ 敗北...\n\n`;
    totalGold = Math.floor(totalGold * 0.7);
    allLoot.length = Math.floor(allLoot.length * 0.7);
    allItemLoot.length = Math.floor(allItemLoot.length * 0.7);
  }

  // 統計
  output += `\n=== 戦闘統計 ===\n`;
  output += `総与ダメージ: ${totalDamageDealt}\n`;
  output += `総被ダメージ: ${totalDamageTaken}\n`;
  output += `クリティカル: ${totalCrits}回\n`;
  output += `回避: ${totalDodges}回\n`;

  // 報酬
  data.player.gold += totalGold;
  data.player.inventory.push(...allLoot);
  data.player.itemInventory.push(...allItemLoot);

  // 使用済みの持ち物を装備から削除
  if (herbUsedTotal && equippedHerb) {
    if (data.player.equipment.item1?.id === equippedHerb.id) {
      data.player.equipment.item1 = null;
    } else if (data.player.equipment.item2?.id === equippedHerb.id) {
      data.player.equipment.item2 = null;
    }
  }

  if (charmUsedTotal && equippedCharm) {
    if (data.player.equipment.item1?.id === equippedCharm.id) {
      data.player.equipment.item1 = null;
    } else if (data.player.equipment.item2?.id === equippedCharm.id) {
      data.player.equipment.item2 = null;
    }
  }

  data.player.currentDungeon = undefined;
  data.player.state = 'idle';

  await storage.save(data, password);

  output += `\n=== 報酬 ===\n`;
  output += `ゴールド: +${totalGold} (合計: ${data.player.gold})\n`;

  if (allLoot.length > 0) {
    output += `装備:\n`;
    for (const item of allLoot) {
      output += `  - ${item.name} [${item.rarity}]\n`;
    }
  } else {
    output += `装備ドロップなし\n`;
  }

  if (allItemLoot.length > 0) {
    output += `持ち物:\n`;
    for (const item of allItemLoot) {
      output += `  - ${item.name}\n`;
    }
  }

  // 持ち物の使用状況
  if (herbUsedTotal || charmUsedTotal) {
    output += `\n=== 持ち物使用 ===\n`;
    if (herbUsedTotal) {
      output += `薬草: 使用済み (HP回復)\n`;
    }
    if (charmUsedTotal) {
      output += `おまもり: 使用済み (災難回避)\n`;
    }
  }

  if (events.length > 0) {
    output += `\n=== 発生イベント ===\n`;
    for (const event of events) {
      output += formatEventDescription(event) + '\n';
    }
  }

  output += `\n'view_inventory'で新しいアイテムを確認できます！`;
  output += `\n'view_battle_log'で詳細な戦闘ログを確認できます。`;

  return output;
}

export async function viewBattleLog(password: string): Promise<string> {
  const data = await storage.load(password);
  
  if (!data.player.name) {
    return "プレイヤーが見つかりません。";
  }

  if (!data.player.currentDungeon || data.player.currentDungeon.battleLog.length === 0) {
    return "表示できる戦闘ログがありません。";
  }

  const battleLog = data.player.currentDungeon.battleLog;
  
  let output = `=== 戦闘ログ ===\n\n`;
  
  for (const battle of battleLog) {
    const icon = battle.victory ? '✅' : '❌';
    output += `${icon} ${battle.floor}階: ${battle.enemyName}\n`;
    output += `  与ダメージ: ${battle.damageDealt} / 被ダメージ: ${battle.damageTaken}\n`;
    output += `  クリティカル: ${battle.criticalHits}回 / 回避: ${battle.dodges}回\n`;

    if (battle.herbUsed) {
      output += `  薬草使用: ✅ (HP回復)\n`;
    }

    if (battle.victory) {
      output += `  ゴールド: +${battle.goldEarned}\n`;
      if (battle.itemsDropped.length > 0) {
        output += `  ドロップ: ${battle.itemsDropped.map(i => i.name).join(', ')}\n`;
      }
    }
    output += '\n';
  }

  return output;
}

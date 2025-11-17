import { CryptoStorage } from '../storage/crypto.js';
import { STARTER_EQUIPMENT } from '../data/equipment.js';
import { calculateTotalStats } from '../game/combat.js';
import type { GameData, Equipment, Item } from '../types.js';

const storage = new CryptoStorage();

export async function initializeGame(password: string): Promise<string> {
  if (storage.exists()) {
    return `ゲームは既に初期化されています: ${storage.getSaveLocation()}\n別のコマンドでプレイヤーを読み込んでください。`;
  }

  await storage.initialize(password);
  return `ゲームを初期化しました！\n保存場所: ${storage.getSaveLocation()}\n\n'create_player'でキャラクターを作成してください。`;
}

export async function createPlayer(name: string, password: string): Promise<string> {
  const data = await storage.load(password);

  if (data.player.name) {
    return `プレイヤーは既に存在します: ${data.player.name}\n'view_status'でキャラクター情報を確認してください。`;
  }

  data.player.name = name;

  // 初期装備を付与
  const starterWeapon = STARTER_EQUIPMENT.find(eq => eq.id === 'rusty_sword')!;
  const starterArmor = STARTER_EQUIPMENT.find(eq => eq.id === 'leather_armor')!;

  data.player.equipment.weapon = starterWeapon;
  data.player.equipment.armor = starterArmor;
  data.player.equipment.item1 = null;
  data.player.equipment.item2 = null;
  data.player.gold = 100; // 初期ゴールド
  data.player.itemInventory = []; // 持ち物インベントリを初期化
  data.player.state = 'idle';

  await storage.save(data, password);

  return `ようこそ、${name}！\n\n初期装備:\n- ${starterWeapon.name} (攻撃力+${starterWeapon.stats.attack})\n- ${starterArmor.name} (防御力+${starterArmor.stats.defense})\n\n初期ゴールド: 100\n\n'view_status'でステータスを確認できます！`;
}

export async function viewStatus(password: string): Promise<string> {
  const data = await storage.load(password);
  
  if (!data.player.name) {
    return "プレイヤーが見つかりません。先に'create_player'を実行してください。";
  }

  const stats = calculateTotalStats(data.player.equipment);
  
  // 状態アイコン
  const stateIcon = data.player.state === 'exploring' ? '⚔️' : '🏠';
  const stateText = data.player.state === 'exploring' ? '探索中' : '待機中';
  
  let output = `=== ${data.player.name} ===\n\n`;
  output += `状態: ${stateIcon} ${stateText}\n`;
  output += `ゴールド: ${data.player.gold}\n\n`;
  
  output += `ステータス:\n`;
  output += `  攻撃力: ${stats.attack}\n`;
  output += `  防御力: ${stats.defense}\n`;
  output += `  速度: ${stats.speed}\n`;
  output += `  運: ${stats.luck}%\n\n`;
  
  output += `装備:\n`;
  const slotNames: { [key: string]: string } = {
    weapon: '武器',
    shield: '盾',
    armor: '防具',
    accessory: 'アクセサリ',
    item1: '持ち物1',
    item2: '持ち物2'
  };

  for (const [slot, item] of Object.entries(data.player.equipment)) {
    if (slot === 'length') continue; // インデックスシグネチャ対応
    const slotName = slotNames[slot] || slot;

    if (slot === 'item1' || slot === 'item2') {
      // 持ち物スロット
      if (item && 'effect' in item) {
        const holdingItem = item as Item;
        output += `  ${slotName}: ${holdingItem.name}\n`;
        output += `    効果: ${holdingItem.description}\n`;
      } else {
        output += `  ${slotName}: (なし)\n`;
      }
    } else {
      // 装備スロット
      if (item && 'stats' in item) {
        const equipment = item as Equipment;
        output += `  ${slotName}: ${equipment.name} [${equipment.rarity}]\n`;
        output += `    ステータス: 攻撃+${equipment.stats.attack} 防御+${equipment.stats.defense} 速度+${equipment.stats.speed} 運+${equipment.stats.luck}\n`;
      } else {
        output += `  ${slotName}: (なし)\n`;
      }
    }
  }

  output += `\n装備インベントリ: ${data.player.inventory.length}個\n`;
  output += `持ち物インベントリ: ${data.player.itemInventory?.length || 0}個\n`;

  if (data.player.currentDungeon) {
    const now = Date.now();
    const { startTime, estimatedEndTime } = data.player.currentDungeon;
    const remaining = Math.max(0, estimatedEndTime - now);
    const totalTime = estimatedEndTime - startTime;
    const elapsed = now - startTime;
    const progressPercentage = Math.min((elapsed / totalTime) * 100, 100);

    const minutes = Math.ceil(remaining / 60000);
    const seconds = Math.ceil((remaining % 60000) / 1000);

    output += `\n⚔️  ダンジョン探索中！\n`;
    output += `進行状況: ${progressPercentage.toFixed(1)}%\n`;
    output += `残り時間: ${minutes}分${seconds}秒\n`;

    // 簡易プログレスバー
    const barLength = 15;
    const filledLength = Math.floor((progressPercentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    output += `[${bar}]\n`;

    output += `\n'check_progress'で詳細な進行状況を確認できます。`;
  }

  return output;
}

export async function viewInventory(password: string): Promise<string> {
  const data = await storage.load(password);

  if (!data.player.name) {
    return "プレイヤーが見つかりません。先に'create_player'を実行してください。";
  }

  const hasEquipment = data.player.inventory.length > 0;
  const hasItems = (data.player.itemInventory?.length || 0) > 0;

  if (!hasEquipment && !hasItems) {
    return "インベントリは空です。";
  }

  let output = `=== インベントリ ===\n\n`;

  // 装備インベントリ
  if (hasEquipment) {
    output += `【装備】 (${data.player.inventory.length}個)\n\n`;

    const groupedByType: { [key: string]: Equipment[] } = {};

    for (const item of data.player.inventory) {
      if (!groupedByType[item.type]) {
        groupedByType[item.type] = [];
      }
      groupedByType[item.type].push(item);
    }

    const typeNames: { [key: string]: string } = {
      weapon: '武器',
      shield: '盾',
      armor: '防具',
      accessory: 'アクセサリ'
    };

    for (const [type, items] of Object.entries(groupedByType)) {
      output += `${typeNames[type] || type}:\n`;
      for (const item of items) {
        output += `  [${item.id}] ${item.name} [${item.rarity}]\n`;
        output += `    攻撃+${item.stats.attack} 防御+${item.stats.defense} 速度+${item.stats.speed} 運+${item.stats.luck}\n`;
      }
      output += '\n';
    }
  }

  // 持ち物インベントリ
  if (hasItems) {
    output += `【持ち物】 (${data.player.itemInventory.length}個)\n\n`;

    for (const item of data.player.itemInventory) {
      output += `  [${item.id}] ${item.name}\n`;
      output += `    ${item.description}\n`;
    }
    output += '\n';
  }

  return output;
}

export async function equipItem(itemId: string, password: string): Promise<string> {
  const data = await storage.load(password);
  
  if (!data.player.name) {
    return "プレイヤーが見つかりません。先に'create_player'を実行してください。";
  }

  if (data.player.state === 'exploring') {
    return "ダンジョン探索中は装備を変更できません。\n探索完了後に装備を整えてください。";
  }

  const itemIndex = data.player.inventory.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    return `ID '${itemId}' のアイテムがインベントリに見つかりません。`;
  }

  const item = data.player.inventory[itemIndex];
  const slot = item.type as keyof typeof data.player.equipment;

  // 現在装備中のアイテムがあれば外す
  const currentItem = data.player.equipment[slot];
  if (currentItem && 'stats' in currentItem) {
    // Type guard: Only push Equipment items to equipment inventory
    data.player.inventory.push(currentItem as Equipment);
  }

  // 新しいアイテムを装備
  data.player.equipment[slot] = item;
  data.player.inventory.splice(itemIndex, 1);

  await storage.save(data, password);

  const slotNames: { [key: string]: string } = {
    weapon: '武器',
    shield: '盾',
    armor: '防具',
    accessory: 'アクセサリ'
  };

  return `${item.name}を${slotNames[slot]}スロットに装備しました！\n\n'view_status'で更新されたステータスを確認できます。`;
}

export async function unequipItem(slot: string, password: string): Promise<string> {
  const data = await storage.load(password);
  
  if (!data.player.name) {
    return "プレイヤーが見つかりません。先に'create_player'を実行してください。";
  }

  if (data.player.state === 'exploring') {
    return "ダンジョン探索中は装備を変更できません。\n探索完了後に装備を整えてください。";
  }

  const validSlots = ['weapon', 'shield', 'armor', 'accessory'];
  if (!validSlots.includes(slot)) {
    return `無効なスロットです。有効なスロット: ${validSlots.join(', ')}`;
  }

  const slotKey = slot as keyof typeof data.player.equipment;
  const item = data.player.equipment[slotKey];

  if (!item) {
    return `${slot}スロットには何も装備されていません。`;
  }

  // Type guard: Ensure we only push Equipment to equipment inventory
  if (!('stats' in item)) {
    return `エラー: ${slot}スロットに装備アイテムがありません。`;
  }

  // インベントリに移動
  data.player.inventory.push(item as Equipment);
  data.player.equipment[slotKey] = null;

  await storage.save(data, password);

  const slotNames: { [key: string]: string } = {
    weapon: '武器',
    shield: '盾',
    armor: '防具',
    accessory: 'アクセサリ'
  };

  return `${slotNames[slot]}スロットから${item.name}を外しました。`;
}

export async function equipHoldingItem(itemId: string, slot: 'item1' | 'item2', password: string): Promise<string> {
  const data = await storage.load(password);

  if (!data.player.name) {
    return "プレイヤーが見つかりません。先に'create_player'を実行してください。";
  }

  if (data.player.state === 'exploring') {
    return "ダンジョン探索中は装備を変更できません。\n探索完了後に装備を整えてください。";
  }

  const itemIndex = data.player.itemInventory.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return `ID '${itemId}' の持ち物がインベントリに見つかりません。`;
  }

  const item = data.player.itemInventory[itemIndex];

  // 現在装備中のアイテムがあれば外す
  if (data.player.equipment[slot]) {
    const currentItem = data.player.equipment[slot] as Item;
    data.player.itemInventory.push(currentItem);
  }

  // 新しいアイテムを装備
  data.player.equipment[slot] = item;
  data.player.itemInventory.splice(itemIndex, 1);

  await storage.save(data, password);

  return `${item.name}を${slot === 'item1' ? '持ち物1' : '持ち物2'}スロットに装備しました！\n効果: ${item.description}`;
}

export async function unequipHoldingItem(slot: 'item1' | 'item2', password: string): Promise<string> {
  const data = await storage.load(password);

  if (!data.player.name) {
    return "プレイヤーが見つかりません。先に'create_player'を実行してください。";
  }

  if (data.player.state === 'exploring') {
    return "ダンジョン探索中は装備を変更できません。\n探索完了後に装備を整えてください。";
  }

  const item = data.player.equipment[slot];

  if (!item) {
    return `${slot === 'item1' ? '持ち物1' : '持ち物2'}スロットには何も装備されていません。`;
  }

  // インベントリに移動
  data.player.itemInventory.push(item as Item);
  data.player.equipment[slot] = null;

  await storage.save(data, password);

  return `${slot === 'item1' ? '持ち物1' : '持ち物2'}スロットから${(item as Item).name}を外しました。`;
}

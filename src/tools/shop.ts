import { CryptoStorage } from '../storage/crypto.js';
import { SHOP_EQUIPMENT, SHOP_ITEMS, getShopEquipmentById, getShopItemById } from '../data/shop.js';
import { cloneEquipment } from '../game/loot.js';
import { cloneItem } from '../data/items.js';

const storage = new CryptoStorage();

export async function buyItem(itemId: string, password: string): Promise<string> {
  const gameData = await storage.load(password);

  // 探索中は購入不可
  if (gameData.player.state === 'exploring') {
    return '探索中はショップを利用できません。探索が終了するまでお待ちください。';
  }

  // 装備を探す
  const shopEquipment = getShopEquipmentById(itemId);
  if (shopEquipment) {
    // ゴールドチェック
    if (gameData.player.gold < shopEquipment.price) {
      return `ゴールドが足りません。必要: ${shopEquipment.price}G、所持: ${gameData.player.gold}G`;
    }

    // 購入処理
    gameData.player.gold -= shopEquipment.price;
    const purchasedEquipment = cloneEquipment(shopEquipment);
    gameData.player.inventory.push(purchasedEquipment);

    await storage.save(gameData, password);
    return `${shopEquipment.name}を${shopEquipment.price}Gで購入しました。残りゴールド: ${gameData.player.gold}G`;
  }

  // 持ち物アイテムを探す
  const shopItem = getShopItemById(itemId);
  if (shopItem) {
    // ゴールドチェック
    if (gameData.player.gold < shopItem.price) {
      return `ゴールドが足りません。必要: ${shopItem.price}G、所持: ${gameData.player.gold}G`;
    }

    // 購入処理
    gameData.player.gold -= shopItem.price;
    const purchasedItem = cloneItem(shopItem);
    gameData.player.itemInventory.push(purchasedItem);

    await storage.save(gameData, password);
    return `${shopItem.name}を${shopItem.price}Gで購入しました。残りゴールド: ${gameData.player.gold}G`;
  }

  return `アイテムID "${itemId}" は見つかりませんでした。`;
}

export async function getShopInventory(password: string): Promise<string> {
  const gameData = await storage.load(password);

  // 探索中は閲覧のみ可能（購入は不可）
  const canBuy = gameData.player.state === 'idle';
  const statusMessage = canBuy
    ? `所持金: ${gameData.player.gold}G\n`
    : `⚠️ 探索中のため購入できません（閲覧のみ）\n所持金: ${gameData.player.gold}G\n`;

  let output = '=== 🏪 ショップ ===\n\n' + statusMessage + '\n';

  // 装備セクション
  output += '【装備】\n';

  const equipmentByRarity = {
    common: SHOP_EQUIPMENT.filter(eq => eq.rarity === 'common'),
    rare: SHOP_EQUIPMENT.filter(eq => eq.rarity === 'rare'),
    epic: SHOP_EQUIPMENT.filter(eq => eq.rarity === 'epic')
  };

  for (const [rarity, items] of Object.entries(equipmentByRarity)) {
    if (items.length === 0) continue;

    const rarityName = rarity === 'common' ? 'コモン' : rarity === 'rare' ? 'レア' : 'エピック';
    output += `\n[${rarityName}]\n`;

    for (const eq of items) {
      const typeIcon = eq.type === 'weapon' ? '⚔️' : eq.type === 'shield' ? '🛡️' : eq.type === 'armor' ? '🎽' : '💍';
      const canAfford = gameData.player.gold >= eq.price ? '✅' : '❌';
      output += `${canAfford} ${typeIcon} ${eq.name} - ${eq.price}G\n`;
      output += `   ID: ${eq.id}\n`;
      output += `   攻撃+${eq.stats.attack} 防御+${eq.stats.defense} 速度+${eq.stats.speed} 運+${eq.stats.luck}\n`;
    }
  }

  // 持ち物アイテムセクション
  output += '\n【持ち物アイテム】\n';
  for (const item of SHOP_ITEMS) {
    const typeIcon = item.type === 'herb' ? '🌿' : '🧿';
    const canAfford = gameData.player.gold >= item.price ? '✅' : '❌';
    output += `${canAfford} ${typeIcon} ${item.name} - ${item.price}G\n`;
    output += `   ID: ${item.id}\n`;
    output += `   ${item.description}\n`;
  }

  output += '\n購入方法: buy_item ツールで item_id を指定してください\n';

  return output;
}

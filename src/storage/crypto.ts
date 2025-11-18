import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { GameData } from '../types.js';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

export class CryptoStorage {
  private gameDir: string;
  private dataFile: string;
  private keyFile: string;

  constructor() {
    this.gameDir = join(homedir(), '.mcp-idle-game');
    this.dataFile = join(this.gameDir, 'player_data.enc');
    this.keyFile = join(this.gameDir, 'key.enc');
    
    if (!existsSync(this.gameDir)) {
      mkdirSync(this.gameDir, { recursive: true });
    }
  }

  private deriveKey(password: string, salt: Buffer): Buffer {
    return pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  }

  private encrypt(data: string, key: Buffer): Buffer {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([iv, authTag, encrypted]);
  }

  private decrypt(encryptedData: Buffer, key: Buffer): string {
    const iv = encryptedData.subarray(0, IV_LENGTH);
    const authTag = encryptedData.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = encryptedData.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    return decipher.update(encrypted) + decipher.final('utf8');
  }

  async initialize(password: string): Promise<void> {
    if (existsSync(this.keyFile)) {
      throw new Error('Game already initialized. Use load() instead.');
    }

    const salt = randomBytes(SALT_LENGTH);
    const key = this.deriveKey(password, salt);
    
    // Store salt with encrypted marker
    const keyData = Buffer.concat([salt]);
    writeFileSync(this.keyFile, keyData);

    // Create initial empty game data
    const initialData: GameData = {
      player: {
        name: '',
        equipment: {
          weapon: null,
          shield: null,
          armor: null,
          accessory: null,
          item1: null,
          item2: null
        },
        inventory: [],
        itemInventory: [],
        gold: 0,
        state: 'idle'
      },
      version: '0.1.0'
    };

    await this.save(initialData, password);
  }

  async save(data: GameData, password: string): Promise<void> {
    if (!existsSync(this.keyFile)) {
      throw new Error('Game not initialized. Use initialize() first.');
    }

    const keyData = readFileSync(this.keyFile);
    const salt = keyData.subarray(0, SALT_LENGTH);
    const key = this.deriveKey(password, salt);

    const jsonData = JSON.stringify(data, null, 2);
    const encrypted = this.encrypt(jsonData, key);

    writeFileSync(this.dataFile, encrypted);
  }

  async load(password: string): Promise<GameData> {
    if (!existsSync(this.keyFile) || !existsSync(this.dataFile)) {
      throw new Error('No save data found. Use initialize() first.');
    }

    const keyData = readFileSync(this.keyFile);
    const salt = keyData.subarray(0, SALT_LENGTH);
    const key = this.deriveKey(password, salt);

    const encryptedData = readFileSync(this.dataFile);
    const decrypted = this.decrypt(encryptedData, key);

    const data = JSON.parse(decrypted) as GameData;

    // マイグレーション処理を実行
    const migratedData = this.migrateData(data);

    return migratedData;
  }

  private migrateData(data: GameData): GameData {
    const currentVersion = '0.1.0';
    const saveVersion = data.version || '0.0.0';

    // バージョンが既に最新の場合はそのまま返す
    if (saveVersion === currentVersion) {
      return data;
    }

    console.error(`Migrating save data from version ${saveVersion} to ${currentVersion}...`);

    // v0.0.0 → v0.1.0: 持ち物システムの追加
    if (this.compareVersions(saveVersion, '0.1.0') < 0) {
      // itemInventoryが存在しない場合は追加
      if (!data.player.itemInventory) {
        data.player.itemInventory = [];
      }

      // item1, item2が存在しない場合は追加
      if (!data.player.equipment.item1 && data.player.equipment.item1 !== null) {
        data.player.equipment.item1 = null;
      }
      if (!data.player.equipment.item2 && data.player.equipment.item2 !== null) {
        data.player.equipment.item2 = null;
      }
    }

    // 将来のマイグレーション例:
    // if (this.compareVersions(saveVersion, '0.2.0') < 0) {
    //   // v0.2.0の新機能のマイグレーション処理
    // }

    // バージョン番号を更新
    data.version = currentVersion;

    console.error(`Migration complete: ${saveVersion} → ${currentVersion}`);

    return data;
  }

  /**
   * バージョン文字列を比較する
   * @returns v1 < v2 なら負の数、v1 === v2 なら0、v1 > v2 なら正の数
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const num1 = parts1[i] || 0;
      const num2 = parts2[i] || 0;

      if (num1 !== num2) {
        return num1 - num2;
      }
    }

    return 0;
  }

  exists(): boolean {
    return existsSync(this.keyFile) && existsSync(this.dataFile);
  }

  getSaveLocation(): string {
    return this.gameDir;
  }
}

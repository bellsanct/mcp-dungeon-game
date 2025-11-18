#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import * as playerTools from './tools/player.js';
import * as dungeonTools from './tools/dungeon.js';
import * as shopTools from './tools/shop.js';

const server = new Server(
  {
    name: 'mcp-idle-game',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'init_game',
        description: '新しいゲームを初期化します。セーブファイルと暗号化キーを作成します。他の操作の前に必須です。',
        inputSchema: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              description: 'セーブデータを暗号化するパスワード。このパスワードは覚えておいてください！すべてのゲーム操作で必要になります。',
            },
          },
          required: ['password'],
        },
      },
      {
        name: 'create_player',
        description: '名前を付けて新しいプレイヤーキャラクターを作成します。ゲームごとに一度だけ実行できます。',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'キャラクター名',
            },
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['name', 'password'],
        },
      },
      {
        name: 'view_status',
        description: 'キャラクターの状態、ステータス、装備、現在の活動を表示します。',
        inputSchema: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['password'],
        },
      },
      {
        name: 'view_inventory',
        description: 'インベントリ内のすべてのアイテムを表示します。',
        inputSchema: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['password'],
        },
      },
      {
        name: 'equip_item',
        description: 'インベントリからアイテムを装備します。アイテムIDはview_inventoryで確認できます。',
        inputSchema: {
          type: 'object',
          properties: {
            item_id: {
              type: 'string',
              description: '装備するアイテムのID（インベントリに表示）',
            },
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['item_id', 'password'],
        },
      },
      {
        name: 'unequip_item',
        description: '特定のスロットからアイテムを外してインベントリに戻します。',
        inputSchema: {
          type: 'object',
          properties: {
            slot: {
              type: 'string',
              description: '装備スロット: weapon, shield, armor, または accessory',
              enum: ['weapon', 'shield', 'armor', 'accessory'],
            },
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['slot', 'password'],
        },
      },
      {
        name: 'list_dungeons',
        description: '利用可能なすべてのダンジョンとその情報を一覧表示します。',
        inputSchema: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['password'],
        },
      },
      {
        name: 'dungeon_info',
        description: '特定のダンジョンの詳細情報を取得します。',
        inputSchema: {
          type: 'object',
          properties: {
            dungeon_id: {
              type: 'string',
              description: 'ダンジョンのID（list_dungeonsから取得）',
            },
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['dungeon_id', 'password'],
        },
      },
      {
        name: 'start_dungeon',
        description: 'ダンジョンの探索を開始します。時間ベースの活動なので、後で確認する必要があります。',
        inputSchema: {
          type: 'object',
          properties: {
            dungeon_id: {
              type: 'string',
              description: '探索するダンジョンのID',
            },
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['dungeon_id', 'password'],
        },
      },
      {
        name: 'check_progress',
        description: '現在のダンジョン探索の進行状況を確認します。完了している場合は結果を処理します。',
        inputSchema: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['password'],
        },
      },
      {
        name: 'view_battle_log',
        description: '探索中のダンジョンの詳細な戦闘ログを表示します。',
        inputSchema: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['password'],
        },
      },
      {
        name: 'equip_holding_item',
        description: 'インベントリから持ち物を装備します。持ち物には薬草(HP回復)やおまもり(イベント回避)があります。',
        inputSchema: {
          type: 'object',
          properties: {
            item_id: {
              type: 'string',
              description: '装備する持ち物のID（インベントリに表示）',
            },
            slot: {
              type: 'string',
              description: '持ち物スロット: item1 または item2',
              enum: ['item1', 'item2'],
            },
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['item_id', 'slot', 'password'],
        },
      },
      {
        name: 'unequip_holding_item',
        description: '特定のスロットから持ち物を外してインベントリに戻します。',
        inputSchema: {
          type: 'object',
          properties: {
            slot: {
              type: 'string',
              description: '持ち物スロット: item1 または item2',
              enum: ['item1', 'item2'],
            },
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['slot', 'password'],
        },
      },
      {
        name: 'shop_inventory',
        description: 'ショップで販売中の商品一覧を表示します。装備と持ち物アイテムを購入できます。探索中でも閲覧可能ですが、購入は待機中のみです。',
        inputSchema: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['password'],
        },
      },
      {
        name: 'buy_item',
        description: 'ショップからアイテムを購入します。ゴールドを消費してインベントリに追加されます。探索中は購入できません。',
        inputSchema: {
          type: 'object',
          properties: {
            item_id: {
              type: 'string',
              description: '購入するアイテムのID（shop_inventoryで確認）',
            },
            password: {
              type: 'string',
              description: 'ゲームパスワード',
            },
          },
          required: ['item_id', 'password'],
        },
      },
    ],
  };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error('No arguments provided');
    }

    switch (name) {
      case 'init_game':
        return {
          content: [
            {
              type: 'text',
              text: await playerTools.initializeGame(args.password as string),
            },
          ],
        };

      case 'create_player':
        return {
          content: [
            {
              type: 'text',
              text: await playerTools.createPlayer(
                args.name as string,
                args.password as string
              ),
            },
          ],
        };

      case 'view_status':
        return {
          content: [
            {
              type: 'text',
              text: await playerTools.viewStatus(args.password as string),
            },
          ],
        };

      case 'view_inventory':
        return {
          content: [
            {
              type: 'text',
              text: await playerTools.viewInventory(args.password as string),
            },
          ],
        };

      case 'equip_item':
        return {
          content: [
            {
              type: 'text',
              text: await playerTools.equipItem(
                args.item_id as string,
                args.password as string
              ),
            },
          ],
        };

      case 'unequip_item':
        return {
          content: [
            {
              type: 'text',
              text: await playerTools.unequipItem(
                args.slot as string,
                args.password as string
              ),
            },
          ],
        };

      case 'list_dungeons':
        return {
          content: [
            {
              type: 'text',
              text: await dungeonTools.listDungeons(args.password as string),
            },
          ],
        };

      case 'dungeon_info':
        return {
          content: [
            {
              type: 'text',
              text: await dungeonTools.dungeonInfo(
                args.dungeon_id as string,
                args.password as string
              ),
            },
          ],
        };

      case 'start_dungeon':
        return {
          content: [
            {
              type: 'text',
              text: await dungeonTools.startDungeon(
                args.dungeon_id as string,
                args.password as string
              ),
            },
          ],
        };

      case 'check_progress':
        return {
          content: [
            {
              type: 'text',
              text: await dungeonTools.checkProgress(args.password as string),
            },
          ],
        };

      case 'view_battle_log':
        return {
          content: [
            {
              type: 'text',
              text: await dungeonTools.viewBattleLog(args.password as string),
            },
          ],
        };

      case 'equip_holding_item':
        return {
          content: [
            {
              type: 'text',
              text: await playerTools.equipHoldingItem(
                args.item_id as string,
                args.slot as 'item1' | 'item2',
                args.password as string
              ),
            },
          ],
        };

      case 'unequip_holding_item':
        return {
          content: [
            {
              type: 'text',
              text: await playerTools.unequipHoldingItem(
                args.slot as 'item1' | 'item2',
                args.password as string
              ),
            },
          ],
        };

      case 'shop_inventory':
        return {
          content: [
            {
              type: 'text',
              text: await shopTools.getShopInventory(args.password as string),
            },
          ],
        };

      case 'buy_item':
        return {
          content: [
            {
              type: 'text',
              text: await shopTools.buyItem(
                args.item_id as string,
                args.password as string
              ),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Idle Game server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

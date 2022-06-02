import { knownFolders } from '@nativescript/core';
import type { SQLiteDatabase } from '@testjg/nativescript-sqlite';
import {
  deleteRows,
  initDb,
  insertCorrupted,
  insertCorruptedTransaction,
  insertTransaction,
  nestedTransaction,
  resetDb,
  selectLimit,
  simpleInsert,
} from './db.utils';
import type { MessageData, ResponseMessage } from './worker-types';

require('@nativescript/core/globals');

const dbName = 'data-worker.db';
const path = `${knownFolders.documents().path}/${dbName}`;

let db: SQLiteDatabase | null;

const ensureDb = () => {
  if (db) return;
  db = initDb(path);
};

const sendMessage = (msg: ResponseMessage) => {
  global.postMessage(msg);
};

const msgProcessor = {
  process: (data: MessageData) => {
    try {
      ensureDb();
      let result: any;
      switch (data.type) {
        case 'delete-rows':
          deleteRows(db);
          break;
        case 'insert-corrupted':
          insertCorrupted(db, data.payload);
          break;
        case 'insert-corrupted-transaction':
          insertCorruptedTransaction(db, data.payload);
          break;
        case 'insert-simple':
          simpleInsert(db, data.payload);
          break;
        case 'insert-transaction':
          insertTransaction(db, data.payload);
          break;
        case 'nested-transaction':
          result = nestedTransaction(db);
          break;
        case 'reset':
          db = resetDb(path);
          break;
        case 'select':
          result = selectLimit(db, data.payload);
          break;
        default:
          console.log('no worker action defined for', data);
          sendMessage({
            type: 'error',
            payload: 'no worker action defined',
            actionType: data.type,
          });
          return;
      }
      sendMessage({
        type: 'success',
        payload: result || data.type,
        actionType: data.type,
      });
    } catch (error) {
      sendMessage({
        type: 'error',
        payload: error?.message,
        actionType: data.type,
      });
    }
  },
};

global.onmessage = (msg) => {
  msgProcessor.process(msg.data);
};

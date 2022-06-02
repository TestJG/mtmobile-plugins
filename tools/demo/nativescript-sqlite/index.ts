import { DemoSharedBase } from '../utils';
import type { SQLiteDatabase } from '@testjg/nativescript-sqlite';
import { knownFolders } from '@nativescript/core';
import {
  deleteRows,
  insertCorruptedTransaction,
  insertTransaction,
  nestedTransaction,
  resetDb,
  selectLimit,
  simpleInsert,
} from './db.utils';
import { MessageData } from './worker-types';

export class DemoSharedNativescriptSqlite extends DemoSharedBase {
  public message: string;
  public sendToWorker = false;
  private sqlite: SQLiteDatabase;
  private numOfRows = 10000;
  private worker = new Worker('./dbworker');

  constructor() {
    super();
    const dbName = 'data.db';
    const path = `${knownFolders.temp().path}/${dbName}`;
    this.sqlite = resetDb(path);
    this.sqlite.setVersion(1);
    this.message = `version = ${this.sqlite.getVersion()}`;
    this.worker.onmessage = (msg) => {
      console.log('FROM WORKER:', msg.data);
    };
  }

  private postToWorker(msg: MessageData) {
    this.worker.postMessage(msg);
  }

  private toWorkerOrAction(msgAction: { msg: MessageData; action: () => void }) {
    if (this.sendToWorker) {
      this.postToWorker(msgAction.msg);
      return;
    }

    msgAction.action();
  }

  onInsert() {
    try {
      this.toWorkerOrAction({
        msg: { type: 'insert-simple', payload: this.numOfRows },
        action: () => simpleInsert(this.sqlite, this.numOfRows),
      });
    } catch (error) {
      console.log('Error onInsert:', error);
    }
  }

  onInsertWithTrans() {
    try {
      this.toWorkerOrAction({
        msg: { type: 'insert-transaction', payload: this.numOfRows },
        action: () => insertTransaction(this.sqlite, this.numOfRows),
      });
    } catch (error) {
      console.log('Error onInsertWithTrans:', error);
    }
  }

  onInsertWithRollback() {
    try {
      this.toWorkerOrAction({
        msg: { type: 'insert-corrupted-transaction', payload: this.numOfRows },
        action: () => insertCorruptedTransaction(this.sqlite, this.numOfRows),
      });
    } catch (error) {
      console.log('Error inserting so rollback', error);
    }
  }

  onSelect() {
    this.toWorkerOrAction({
      msg: { type: 'select', payload: 20 },
      action: () => {
        const data = selectLimit(this.sqlite, 20);
        console.log(`Selected #${data.length} data items`);
        console.log(data);
      },
    });
  }

  onReset() {
    this.toWorkerOrAction({
      msg: { type: 'delete-rows', payload: null },
      action: () => deleteRows(this.sqlite),
    });
  }

  onNestedTransaction() {
    this.toWorkerOrAction({
      msg: { type: 'nested-transaction', payload: null },
      action: () => {
        const count = nestedTransaction(this.sqlite);
        console.log('nested transaction', count);
      },
    });
  }
}

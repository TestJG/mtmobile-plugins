import { DemoSharedBase } from '../utils';
import { openOrCreate, deleteDatabase, SQLiteDatabase } from '@testjg/nativescript-sqlite';
import { knownFolders } from '@nativescript/core';

type DataExample = { id: number; name: string };

export class DemoSharedNativescriptSqlite extends DemoSharedBase {
  public message: string;
  private sqlite: SQLiteDatabase;

  constructor() {
    super();
    this.resetDb();
    this.sqlite.setVersion(1);
    this.message = `version = ${this.sqlite.getVersion()}`;
  }

  resetDb() {
    const dbName = 'data.db';
    const path = `${knownFolders.temp().path}/${dbName}`;
    deleteDatabase(path);
    this.sqlite = openOrCreate(path);
    const createCmd = 'CREATE TABLE names (id INT, name TEXT, json TEXT, PRIMARY KEY (id))';
    this.sqlite.execute(createCmd);
  }

  insert(size: number) {
    for (const data of createDataGenerator(size)) {
      const insert = `INSERT INTO names (id, name, json) VALUES (?, ?, ?)`;
      this.sqlite.execute(insert, [data.id, data.name, JSON.stringify(data)]);
    }
  }

  insertCorrupted(size: number) {
    for (const data of createDataGenerator(size)) {
      const insert = `INSERT INTO names (id, name, json) VALUES (?, ?, ?)`;
      if (data.id === 1000) {
        console.log('About to crash!');
        data.id = 0;
      }
      this.sqlite.execute(insert, [data.id, data.name, JSON.stringify(data)]);
    }
  }

  onInsert() {
    try {
      this.insert(10000);
    } catch (error) {
      console.log('Error onInsert:', error);
    }
  }

  onInsertWithTrans() {
    try {
      this.sqlite.transaction(() => this.insert(10000));
    } catch (error) {
      console.log('Error onInsertWithTrans:', error);
    }
  }

  onInsertWithRollback() {
    try {
      this.sqlite.transaction(() => this.insertCorrupted(10000));
    } catch (error) {
      console.log('Error inserting so rollback', error);
    }
  }

  onSelect() {
    const select = 'SELECT * FROM names WHERE id < 20';
    const data = this.sqlite.select(select);
    console.log(`Selected #${data.length} data items`);
    console.log(data);
  }

  onReset() {
    const reset = 'DELETE FROM names';
    this.sqlite.execute(reset);
  }
}

const createDataExample = (id: number): DataExample => ({
  id,
  name: `${Math.random() + id} Test data`,
});

const createDataGenerator = (size: number): Iterable<DataExample> => {
  return {
    [Symbol.iterator]: () => {
      let i = 0;
      return {
        next: () => {
          if (i === size) return { done: true, value: undefined };
          const data = createDataExample(i++);
          return { done: false, value: data };
        },
      };
    },
  };
};

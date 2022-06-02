import { deleteDatabase, openOrCreate, SQLiteDatabase } from '@testjg/nativescript-sqlite';

type DataExample = { id: number; name: string };

const createCmd = 'CREATE TABLE names (id INT, name TEXT, json TEXT, PRIMARY KEY (id))';
const deleteAllRowsCmd = 'DELETE FROM names';
const insertCmd = 'INSERT INTO names (id, name, json) VALUES (?, ?, ?)';
const selectQuery = 'SELECT * FROM names LIMIT (?)';
const updateCmd = 'UPDATE names SET id = ?, name = ?, json = ? WHERE id = ?';
const countQuery = 'SELECT COUNT(*) FROM names';

export const initDb = (path: string) => {
  const db = openOrCreate(path);
  try {
    db.execute(createCmd);
  } catch (error) {}
  return db;
};

export const resetDb = (path: string) => {
  deleteDatabase(path);
  return initDb(path);
};

const execInsert = (db: SQLiteDatabase, data: DataExample) =>
  db.execute(insertCmd, [data.id, data.name, JSON.stringify(data)]);

export const simpleInsert = (db: SQLiteDatabase, size: number) => {
  for (const data of createDataGenerator(0, size)) {
    execInsert(db, data);
  }
};

export const insertCorrupted = (db: SQLiteDatabase, size: number) => {
  for (const data of createDataGenerator(0, size)) {
    if (data.id === 1000) {
      console.log('About to crash!');
      data.id = 0;
    }
    execInsert(db, data);
  }
};

export const insertTransaction = (db: SQLiteDatabase, size: number) => {
  db.transaction(() => simpleInsert(db, size));
};

export const insertCorruptedTransaction = (db: SQLiteDatabase, size: number) => {
  db.transaction(() => insertCorrupted(db, size));
};

export const nestedTransaction = (db: SQLiteDatabase) => {
  db.transaction(() => {
    for (const data of createDataGenerator(0, 1_000)) {
      db.transaction(() => {
        // For each data we insert three more. This should make db rollback all changes on the
        // second nested transaction.
        for (const ex of createDataGenerator(data.id, 3)) {
          execInsert(db, ex);
        }
      });
    }
  });
  return db.execute(countQuery);
};

export const selectLimit = (db: SQLiteDatabase, limit: number) => db.select(selectQuery, [limit]);

export const deleteRows = (db: SQLiteDatabase) => db.execute(deleteAllRowsCmd);

// Data generators

const createDataExample = (id: number): DataExample => ({
  id,
  name: `${Math.random() + id} Test data`,
});

const createDataGenerator = (start: number, size: number): Iterable<DataExample> => {
  return {
    [Symbol.iterator]: () => {
      let i = start;
      let end = start + size;
      return {
        next: () => {
          if (i === end) return { done: true, value: undefined };
          const data = createDataExample(i++);
          return { done: false, value: data };
        },
      };
    },
  };
};

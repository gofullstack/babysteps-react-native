import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import forEach from 'lodash/forEach';

import _ from 'lodash';

import CONSTANTS from '../constants';

const db = SQLite.openDatabase('babysteps.db');

export const tableNames = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT name FROM sqlite_master WHERE type="table";`,
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(console.log(`*** Error retrieving table names: ${error}`)),
      );
    });
  });
};

export const columnNames = tableName => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `PRAGMA table_info('${tableName}');`,
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(`Error retrieving table columns: ${error}`),
      );
    });
  });
};

export const addColumn = async (tableName, columnName, type) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${type};`,
        [],
        (_, rows) => resolve(console.log(`*** Add Column ${columnName} successful`)),
        (_, error) => console.log(`*** Column ${columnName} exists`),
      );
    });
  });
};

export const confirmColumns = async (schema, tableName) => {
  const schemaColumns = Object.keys(schema).sort();
  // list of columns in SQLite
  const result = await columnNames(tableName);
  const existingColumns = result.map(c => c.name).sort();
  for (const columnName of schemaColumns) {
    if (!existingColumns.includes(columnName)) {
      await addColumn(tableName, columnName, schema[columnName]);
    }
  };
};

export const confirmTables = async schema => {
  const schemaTables = Object.keys(schema);
  // list of tables in SQLite
  const result = await tableNames();
  const existingTables = result.map(a => a.name).sort();
  for (const tableName of schemaTables) {
    if (!existingTables.includes(tableName)) {
      createTable(tableName, schema[tableName]);
      createIndexes(tableName, schema[tableName]);
      // need a session record to initialize app
      if (tableName === 'sessions') createSessionRecord();
    } else {
      confirmColumns(schema[tableName].columns, tableName);
    }
  }
  return null;
};

export const createTable = async (tableName, schema) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
      Object.keys(schema.columns).forEach(column => {
        sql += `${column} ${schema.columns[column]}, `;
      });
      sql = sql.slice(0, -2);
      sql += ' );';

      tx.executeSql(
        sql,
        [],
        (_, rows) => resolve(console.log('** Execute ' + sql)),
        (_, error) => reject(console.log('*** Error in executing ' + sql)),
      );
    });
  });
};

export const createIndexes = async (tableName, schema) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      schema.indexes.forEach(sql => {
        tx.executeSql(
          'CREATE INDEX IF NOT EXISTS ' + sql,
          [],
          (_, rows) => resolve(console.log('** Execute CREATE INDEX ' + sql)),
          (_, error) => reject(console.log('*** Error in executing CREATE INDEX ' + sql)),
        );
      });
    });
  });
};

export const insertRows = async (tableName, schema, data) => {
  if (typeof data !== 'object') {
    console.log('*** Insert Failed: data is improper format: ', data);
    return;
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Clear table
        tx.executeSql(
          `DELETE FROM ${tableName}`,
          [],
          (_, rows) => {
            console.log(`*** Delete rows from table ${tableName}: ${rows.rowsAffected} records affected`);
          },
          (_, error) => {
            console.log('*** Error in deleting rows from table ' + tableName);
          },
        );

        //Construct SQL
        let prefix = `INSERT INTO ${tableName} ( `;
        Object.keys(schema.columns).forEach(column => {
          prefix += `${column}, `;
        });
        prefix = `${prefix.slice(0, -2)} ) `;

        forEach(data, row => {
          const values = [];
          let sql = `${prefix} VALUES (`;
          Object.keys(schema.columns).forEach(column => {
            sql += ' ?,';
            // need to trap booleans
            if (typeof row[column] === typeof true) {
              values.push(row[column] ? 1 : 0);
            } else {
              values.push(row[column]);
            }
          });
          sql = sql.slice(0, -1);
          sql += ' )';
          tx.executeSql(
            sql,
            values,
            (_, rows) => {
              console.log(`*** Execute ${prefix}: ${rows.rowsAffected} records affected`);
            },
            (_, error) => {
              console.log('*** Error in executing ' + error);
            },
          );
        });
      }, // db.transaction
    );
  }); // Promise
};

export const dropTable = async tableName => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DROP TABLE IF EXISTS ' + tableName,
        [],
        (_, result) => resolve(console.log('** Drop table ' + tableName)),
        (_, error) => reject(console.log('*** Error in dropping table ' + tableName)),
      );
    });
  });
};

export const createSessionRecord = async () => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO sessions (registration_state) VALUES (?);',
      ['none'],
      (_, rows) => console.log('** Add Session Record '),
      (_, error) => console.log('*** Error in creating session record '),
    );
  });
  return null;
};

export const getApiUrl = () => {
  // https://docs.expo.io/versions/latest/distribution/release-channels
  if (__DEV__ || Constants.manifest === undefined) {
    return `${CONSTANTS.BASE_DEVELOPMENT_URL}/api`;
  }
  return `${Constants.manifest.extra.baseUrl}/api`;
};

export const syncTriggerData = (newTriggers, oldTriggers) => {
  for (const newTrigger of newTriggers) {
    const oldTrigger = _.find(oldTriggers, {id: newTrigger.id});
    if (!_.isEmpty(oldTrigger)) {
      newTrigger.questions_remaining = oldTrigger.questions_remaining;
      newTrigger.completed_at = oldTrigger.completed_at;
    }
  }
  return newTriggers;
};

// Example use of delay
// use this method to trigger a rerender in component
//  triggerRerender = () => {
//    const { queryCount } = this.state;
//    delay(this, queryCount, 3000, '*** Delay Overview pending milestone data...');
//  };

export const delay = async (theObject, queryCount, ms, message = null) => {
  if (message) console.log(message);
  await setTimeout(() => {
    theObject.setState({ queryCount: queryCount + 1 });
  }, ms);
  return null;
};

export const getUpdateSQL = data => {
  const keys = _.keys(data);
  const updateSQL = [];

  forEach(keys, key => {
    if (_.isInteger(data[key])) {
      updateSQL.push(`${key} = ${data[key]}`);
    } else {
      updateSQL.push(`${key} = '${data[key]}'`);
    }
  });
  return updateSQL;
};

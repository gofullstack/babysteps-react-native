import { confirmTables, dropTable } from './common';
import CONSTANTS from '../constants';
import schema from './notifications_schema.json';

const checkNotificationsSchema = () => {
  console.log('checkNotificationsSchema');

  // list of tables from schema
  const tables = Object.keys(schema);

  // drop tables for testing
  if (CONSTANTS.DROP_NOTIFICATIONS_TABLE) {
    tables.forEach(tableName => {
      dropTable(tableName);
    });
  }

  confirmTables(schema);

  return null;
};

export default checkNotificationsSchema;
import { confirmTables, dropTable } from './common';
import CONSTANTS from '../constants';
import schema from './notifications_schema.json';

const checkNotificationsSchema = async () => {
  console.log('*** Check Notifications Schema');

  // list of tables from schema
  const tables = Object.keys(schema);

  // drop tables for testing
  if (CONSTANTS.DROP_NOTIFICATIONS_TABLE) {
    for (const tableName of tables) {
      await dropTable(tableName);
    };
  }

  await confirmTables(schema);

  return null;
};

export default checkNotificationsSchema;

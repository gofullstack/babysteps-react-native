import { confirmTables, dropTable } from './common';

import CONSTANTS from '../constants';
import schema from './registration_schema.json';

const checkRegistrationSchema = async () => {
  console.log('*** Check Registration Schema');

  // drop tables for testing
  if (CONSTANTS.DROP_REGISTRATION_TABLES) {
    const tables = Object.keys(schema);
    for (const tableName of tables) {
      await dropTable(tableName);
    }
  }

  await confirmTables(schema);

  return null;
};

export default checkRegistrationSchema;

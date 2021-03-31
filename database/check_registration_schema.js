import { confirmTables, dropTable } from './common';

import CONSTANTS from '../constants';
import schema from './registration_schema.json';

const checkRegistrationSchema = () => {
  console.log('checkRegistrationSchema');

  // drop tables for testing
  if (CONSTANTS.DROP_REGISTRATION_TABLES) {
    const tables = Object.keys(schema);
    tables.forEach(tableName => {
      dropTable(tableName);
    });
  }

  confirmTables(schema);

  return null;
};

export default checkRegistrationSchema;

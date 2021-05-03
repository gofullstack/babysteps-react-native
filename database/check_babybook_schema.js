import axios from "axios";
import { confirmTables, dropTable } from './common';

import CONSTANTS from '../constants';
import schema from './babybook_schema.json';

const checkBabyBookSchema = async () => {
  console.log('*** Check Babybook Schema');

  // list of tables from schema
  const tables = Object.keys(schema);

  // drop tables for testing
  if (CONSTANTS.DROP_BABYBOOK_TABLES) {
    for (const tableName of tables) {
      await dropTable(tableName);
    };
  }

  await confirmTables(schema);

  return null;

};

export default checkBabyBookSchema;

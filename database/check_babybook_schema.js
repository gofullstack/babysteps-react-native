import axios from "axios";
import { confirmTables, dropTable } from './common';

import CONSTANTS from '../constants';
import schema from './babybook_schema.json';

const checkBabyBookSchema = () => {
  console.log('checkBabyBookSchema');

  // list of tables from schema
  const tables = Object.keys(schema);

  // drop tables for testing
  if (CONSTANTS.DROP_BABYBOOK_TABLES) {
    tables.forEach(tableName => {
      dropTable(tableName);
    });
  }

  confirmTables(schema);

  return null;

};

export default checkBabyBookSchema;

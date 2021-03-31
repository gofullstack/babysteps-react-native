import { confirmTables, dropTable } from './common';
import CONSTANTS from '../constants';
import schema from './milestones_schema.json';

const checkMilestonesSchema = () => {
  console.log('checkMilestonesSchema');

  // list of tables from schema
  const tables = Object.keys(schema);

  // drop tables for testing
  if (CONSTANTS.DROP_MILESTONE_TABLES) {
    tables.forEach(tableName => {
      dropTable(tableName);
    });
  }

  confirmTables(schema);

  return null;
};

export default checkMilestonesSchema;

import { confirmTables, dropTable } from './common';
import CONSTANTS from '../constants';
import schema from './milestones_schema.json';

const checkMilestonesSchema = async () => {
  console.log('*** Check Milestones Schema');

  // list of tables from schema
  const tables = Object.keys(schema);

  // drop tables for testing
  if (CONSTANTS.DROP_MILESTONE_TABLES) {
    for (const tableName of tables) {
      await dropTable(tableName);
    };
  }

  await confirmTables(schema);

  return null;
};

export default checkMilestonesSchema;

import { confirmTables, dropTable } from './common';
import CONSTANTS from '../constants';
import schema from './answers_schema.json';

const checkAnswersSchema = async () => {
  console.log('*** Check Answers Schema');

  // list of tables from schema
  const tables = Object.keys(schema);

  // drop tables for testing
  if (CONSTANTS.DROP_ANSWER_TABLE) {
    for (const tableName of tables) {
      await dropTable(TableName);
    };
  }

  await confirmTables(schema);

  return null;
};

export default checkAnswersSchema;

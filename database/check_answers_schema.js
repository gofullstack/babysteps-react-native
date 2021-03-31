import { confirmTables, dropTable } from './common';
import CONSTANTS from '../constants';
import schema from './answers_schema.json';

const checkAnswersSchema = () => {
  console.log('checkAnswersSchema');

  // list of tables from schema
  const tables = Object.keys(schema);

  // drop tables for testing
  if (CONSTANTS.DROP_ANSWER_TABLE) {
    tables.forEach(TableName => {
      dropTable(TableName);
    });
  }

  confirmTables(schema);

  return null;
};

export default checkAnswersSchema;

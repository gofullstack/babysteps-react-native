import { confirmTables, dropTable } from './common';
import CONSTANTS from '../constants';
import schema from './milestone_triggers_schema.json';

const checkMilestoneTriggersSchema = async () => {
  console.log('*** Check Milestone Triggers Schema');

  // drop tables for testing
  if (CONSTANTS.DROP_MILESTONE_TRIGGERS_TABLE) {
    await dropTable('milestone_triggers');
  }

  await confirmTables(schema);

  return null;
};

export default checkMilestoneTriggersSchema;

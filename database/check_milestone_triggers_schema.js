import { confirmTables, dropTable } from './common';
import CONSTANTS from '../constants';
import schema from './milestone_triggers_schema.json';

const checkMilestoneTriggersSchema = () => {
  console.log('checkMilestoneTriggersSchema');

  // drop tables for testing
  if (CONSTANTS.DROP_MILESTONE_TRIGGERS_TABLE) {
    dropTable('milestone_triggers');
  }

  confirmTables(schema);

  return null;
};

export default checkMilestoneTriggersSchema;

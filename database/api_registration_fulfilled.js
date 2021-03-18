import * as SQLite from 'expo-sqlite';

import {
  API_CREATE_RESPONDENT_FULFILLED,
  API_CREATE_SUBJECT_FULFILLED,
} from '../actions/types';

import { SaveSignature } from './sync_respondent_signature';
import { UploadMilestoneTriggers } from './sync_milestone_triggers';

const db = SQLite.openDatabase('babysteps.db');

export default store => next => action => {
  if (!action || !action.type) {
    return null;
  }

  if (action.type === API_CREATE_RESPONDENT_FULFILLED) {
    const data = action.payload.data;
    const sql = `UPDATE respondents SET api_id=${data.id}`;

    db.transaction(tx => {
      tx.executeSql(
        sql,
        [],
        (_, response) => {
          console.log(`Respondent API_ID updated from api`);
          SaveSignature(data.id);
        },
        (_, error) => {
          console.log(`ERROR - Respondent API_ID not updated from api: ${error}`);
        },
      );
    });
  }

  if (action.type === API_CREATE_SUBJECT_FULFILLED) {
    const data = action.payload.data;
    const sql = `UPDATE subjects SET api_id=${data.id}`;

    db.transaction(tx => {
      tx.executeSql(
        sql,
        [],
        (_, response) => {
          console.log(`Subject API_ID updated from api`);
          UploadMilestoneTriggers(data.id);
        },
        (_, error) => {
          console.log(`ERROR - Subject API_ID not updated from api: ${error}`);
        },
      );
    });
  }

  return next(action);
};

import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import isEmpty from 'lodash/isEmpty';

import { getApiUrl } from './common';

const db = SQLite.openDatabase('babysteps.db');

const apiToken = Constants.manifest.extra.apiToken;

const UploadMilestoneCalendarsCompleted = async () => {
  const baseURL = getApiUrl();
  const url = '/milestone_calendars/completed_at';
  const apiToken = Constants.manifest.extra.apiToken;
  const headers = { milestone_token: apiToken };
  const sql = 'SELECT * FROM milestone_triggers WHERE completed_at IS NOT NULL;';

  return db.transaction(tx => {
    tx.executeSql(
      sql,
      [],
      (_, response) => {
        const triggers = response.rows['_array'];
        const data = { triggers: [] };

        triggers.forEach(trigger => {
          data.triggers.push({
            task_id: trigger.task_id,
            subject_id: trigger.subject_id,
            completed_at: trigger.completed_at,
          });
        });

        if (isEmpty(data.triggers)) {
          console.log('*** No triggers to update');
          return;
        }

        axios({
          method: 'put',
          responseType: 'json',
          baseURL,
          url,
          data,
          headers,
        })
          .then(response => {
            console.log(`*** Triggers Updated: ${response.data.triggers_updated}`);
          })
          .catch(error => {
            console.log(error);
          });
      },
      (_, error) => {
        console.log(error);
      },
    );
  });
};

export default UploadMilestoneCalendarsCompleted;

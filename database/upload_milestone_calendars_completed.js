import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import { getApiUrl } from './common';

const db = SQLite.openDatabase('babysteps.db');

const apiToken = Constants.manifest.extra.apiToken;

const UploadMilestoneCalendarsCompleted = async () => {
  const baseURL = getApiUrl();
  const apiToken = Constants.manifest.extra.apiToken;
  const data = [];
  const sql = 'SELECT * FROM milestone_triggers WHERE completed_at IS NOT NULL;';
  return db.transaction(tx => {
    tx.executeSql(
      sql,
      [],
      (_, response) => {
        const triggers = response.rows['_array'];

        triggers.forEach(trigger => {
          data.push({
            task_id: trigger.task_id,
            subject_id: trigger.subject_id,
            completed_at: trigger.completed_at,
          });
        });

        axios({
          method: 'put',
          responseType: 'json',
          baseURL,
          url: '/milestone_calendars/completed_at',
          data: {triggers: data},
          headers: {
            "milestone_token": apiToken,
          },
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

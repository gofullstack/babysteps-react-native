import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';

import { getApiUrl, getMilestoneCalendar, insertRows } from './common';

const db = SQLite.openDatabase('babysteps.db');

const schema = require('./milestone_triggers_schema.json');
const apiToken = Constants.manifest.extra.apiToken;
const headers = { milestone_token: apiToken };
const baseURL = getApiUrl();

const saveTriggerData = async newTriggers => {
  const oldTriggers = await getMilestoneCalendar();
  for (const newTrigger of newTriggers) {
    const oldTrigger = find(oldTriggers, {id: newTrigger.id});
    if (!isEmpty(oldTrigger)) {
      newTrigger.questions_remaining = oldTrigger.questions_remaining;
      newTrigger.completed_at = oldTrigger.completed_at;
    }
  }
  insertRows('milestone_triggers', schema['milestone_triggers'], newTriggers);
  return null;
};

export const UploadMilestoneCalendar = async subject_id => {
  console.log('*** Begin Upload Milestone Calendar');
  const url = '/milestone_calendars';

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      responseType: 'json',
      baseURL,
      url,
      headers,
      params: { subject_id },
    })
      .then(response => {
        const newTriggers = response.data;
        saveTriggerData(newTriggers);
        console.log('*** Milestone Calendar Uploaded Successfully');
      })
      .catch(error => {
        console.log(error);
      });
  });
};

const UpdateMilestoneCalendarLastUpdated = async last_updated_at => {
  return db.transaction(tx => {
    tx.executeSql(
      `UPDATE sessions SET milestone_calendar_last_updated_at='${last_updated_at}';`,
      [],
      (_, response) => console.log('*** Session milestone_calendar_last_updated_at updated'),
      (_, error) => console.log(error),
    );
  });
}

const SyncMilestoneCalendar = (subject_id, milestone_calendar_last_updated_at) => {
  console.log('*** Begin Milestone Calendar Sync');
  const url = '/milestone_calendars/last_updated';

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      responseType: 'json',
      baseURL,
      url,
      headers,
      params: { subject_id },
    })
      .then(response => {
        const last_updated_at = response.data.last_updated_at;
        if (milestone_calendar_last_updated_at === last_updated_at) {
          UploadMilestoneCalendar(subject_id);
          UpdateMilestoneCalendarLastUpdated(last_updated_at);
        } else {
          console.log('*** Milestone Calendar up to date');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncMilestoneCalendar;

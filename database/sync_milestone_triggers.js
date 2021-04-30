import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import store from '../store';

import { apiFetchMilestoneCalendar } from '../actions/milestone_actions';

import { getApiUrl, getMilestoneCalendar, insertRows } from './common';

import CONSTANTS from '../constants';

const db = SQLite.openDatabase('babysteps.db');

const apiToken = Constants.manifest.extra.apiToken;
const headers = { milestone_token: apiToken };
const baseURL = getApiUrl();

const UpdateMilestoneCalendarLastUpdated = async last_updated_at => {
  return db.transaction(tx => {
    tx.executeSql(
      `UPDATE sessions SET milestone_calendar_last_updated_at='${last_updated_at}';`,
      [],
      (_, response) => {
        console.log('*** Session milestone_calendar_last_updated_at updated');
      },
      (_, error) => console.log(error),
    );
  });
};

const SyncMilestoneTriggers = (subject_id, milestone_calendar_last_updated_at) => {
  console.log('*** Begin Milestone Trigger Sync');
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
        const study_id = CONSTANTS.STUDY_ID;
        if (
          milestone_calendar_last_updated_at === null ||
          milestone_calendar_last_updated_at !== last_updated_at
        ) {
          store.dispatch(apiFetchMilestoneCalendar({ study_id, subject_id }));
          UpdateMilestoneCalendarLastUpdated(last_updated_at);
        } else {
          console.log('*** Milestone Triggers up to date');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncMilestoneTriggers;

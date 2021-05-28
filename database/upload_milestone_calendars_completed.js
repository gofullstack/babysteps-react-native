import axios from 'axios';
import Constants from 'expo-constants';

import isEmpty from 'lodash/isEmpty';
import reject from 'lodash/reject';

import { store } from '../store';

import { getApiUrl } from './common';

const baseURL = getApiUrl();
const url = '/milestone_calendars/completed_at';
const apiToken = Constants.manifest.extra.apiToken;
const headers = { milestone_token: apiToken };

const UploadMilestoneCalendarsCompleted = async () => {
  const state = store.getState();
  const { calendar } = state.milestones;

  if (isEmpty(calendar.data)) return;

  const triggers = reject(calendar.data, ['completed_at', null]);

  const data = { triggers: [] };

  triggers.forEach(trigger => {
    if (trigger.task_id && trigger.subject_id) {
      data.triggers.push({
        task_id: trigger.task_id,
        subject_id: trigger.subject_id,
        completed_at: trigger.completed_at,
      });
    }
  });

  if (isEmpty(data.triggers)) {
    console.log('*** No triggers to Update as Completed');
    return;
  }

  return axios({
    method: 'put',
    responseType: 'json',
    baseURL,
    url,
    data,
    headers,
  })
    .then(response => {
      console.log(`*** Triggers Updated as Completed: ${response.data.triggers_updated}`);
    })
    .catch(error => {
      console.log(error);
    });
};

export default UploadMilestoneCalendarsCompleted;

import axios from 'axios';
import Constants from 'expo-constants';

import isEmpty from 'lodash/isEmpty';

import { store } from '../store';

import { getApiUrl } from './common';

const apiToken = Constants.manifest.extra.apiToken;
const baseURL = getApiUrl();
const headers = { milestone_token: apiToken };

const executeApiCall = async (id, subject) => {
  const url = `/subjects/${id}/sync`;

  return axios({
    method: 'POST',
    responseType: 'json',
    baseURL,
    url,
    headers,
    data: { subject },
  })
    .then(response => {
      if (response.data) {
        console.log('*** Subject Synced on server');
      } else {
        console.log('*** Subject NOT Synced on server');
      }
    })
    .catch(error => {
      console.log(`*** Error: Subject Sync API call failed: ${error}`);
    });
};

const SyncSubjectByUser = async (user_id, respondent_id, subject_id) => {
  console.log('*** Begin Subject Sync');
  const url = '/subjects/by_user';

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      responseType: 'json',
      baseURL,
      url,
      headers,
      params: { user_id, subject_id },
    })
      .then(response => {
        const { subject } = response.data;

        const state = store.getState();
        const session = state.session;

        // temporary call to update screening_blood_physician_notification
        const updateSubject =
          (session.screening_blood_physician_notification === 1) !==
          subject.screening_blood_physician_notification;

        if (isEmpty(subject) || updateSubject) {

          let data = state.registration.subject.data;
          const id = data.api_id;
          delete data.api_id;

          data = {
            ...data,
            respondent_ids: [respondent_id],
          };

          // defaults
          // temporary call to update screening_blood_physician_notification
          data.screening_blood_physician_notification =
            session.screening_blood_physician_notification;
          if (!data.outcome) data.outcome = 'live_birth';
          if (!data.conception_method) data.conception_method = 'natural';

          executeApiCall(subject.api_id, data);
        } else {
          console.log('*** Subject Exists on Server');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncSubjectByUser;

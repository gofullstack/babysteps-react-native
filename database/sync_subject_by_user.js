import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import isEmpty from 'lodash/isEmpty';

import { getApiUrl } from './common';

const db = SQLite.openDatabase('babysteps.db');
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

        if (isEmpty(subject)) {
          db.transaction(tx => {
            tx.executeSql(
              `SELECT * FROM subjects LIMIT 1;`,
              [],
              (_, response) => {
                const subject = response.rows['_array'][0];
                const data = {
                  ...subject,
                  id: subject.api_id,
                  respondent_ids: [respondent_id],
                };
                delete data.api_id;
                // defaults
                if (!data.outcome) data.outcome = 'live_birth';
                if (!data.conception_method) data.conception_method = 'natural';

                executeApiCall(subject.api_id, data);
              },
              (_, error) => {
                console.log(error);
              },
            );
          });
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

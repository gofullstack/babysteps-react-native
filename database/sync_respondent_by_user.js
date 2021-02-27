import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import isEmpty from 'lodash/isEmpty';

import { getApiUrl } from './common';

const db = SQLite.openDatabase('babysteps.db');
const apiToken = Constants.manifest.extra.apiToken;
const baseURL = getApiUrl();
const headers = { milestone_token: apiToken };

const executeApiCall = async (id, respondent) => {
  const url = `/respondents/${id}/sync`;

  return axios({
    method: 'POST',
    responseType: 'json',
    baseURL,
    url,
    headers,
    data: { respondent },
  })
    .then(response => {
      if (response.data) {
        console.log('*** Respondent Synced on server');
      } else {
        console.log('*** Respondent NOT Synced on server');
      }
    })
    .catch(error => {
      console.log(`*** Error: Respondent Sync API call failed: ${error}`);
    });
};

const SyncRespondentByUser = async user_id => {
  console.log('*** Begin Respondent Sync');
  const url = '/respondents/by_user';

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      responseType: 'json',
      baseURL,
      url,
      headers,
      params: { user_id },
    })
      .then(response => {
        const { respondents } = response.data;

        if (isEmpty(respondents)) {
          db.transaction(tx => {
            tx.executeSql(
              `SELECT * FROM respondents LIMIT 1;`,
              [],
              (_, response) => {
                const respondent = response.rows['_array'][0];
                const data = {
                  ...respondent,
                  id: respondent.api_id,
                };
                delete data.api_id;
                if (!data.respondent_type) data.respondent_type = 'mother';
                //console.log({ respondent: data });
                //console.log({ session })
                executeApiCall(respondent.api_id, data);
              },
              (_, error) => {
                console.log(error);
              },
            );
          });
        } else {
          console.log('*** Respondent Exists on Server');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncRespondentByUser;

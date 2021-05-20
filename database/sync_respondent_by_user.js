import axios from 'axios';
import Constants from 'expo-constants';

import { store } from '../store';

import { getApiUrl } from './common';

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
          const state = store.getState();
          const data = state.registration.respondent.data;
          const id = data.api_id;
          delete data.api_id;
          executeApiCall(id, data);
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

import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import store from '../store';

import { updateSession } from '../actions/session_actions';
import { apiFetchConsent } from '../actions/registration_actions';

import isEmpty from 'lodash/isEmpty';

import { getApiUrl, insertRows } from './common';
import schema from '../database/registration_schema.json';

const db = SQLite.openDatabase('babysteps.db');
const apiToken = Constants.manifest.extra.apiToken;
const baseURL = getApiUrl();
const headers = { milestone_token: apiToken };

const SyncConsentVersion = async (study_id, consent_last_updated_at) => {
  console.log('*** Begin Consent Version Sync');
  const url = '/consents/last_updated';

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      responseType: 'json',
      baseURL,
      url,
      headers,
      params: { study_id },
    })
      .then(response => {
        const { last_updated_at } = response.data;
        if (
          consent_last_updated_at === null ||
          consent_last_updated_at !== last_updated_at
        ) {
          store.dispatch(apiFetchConsent(study_id));
          store.dispatch(
            updateSession({ consent_last_updated_at: last_updated_at }),
          );
        } else {
          console.log('*** Consent Version is the most recent');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncConsentVersion;

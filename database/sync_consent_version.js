import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import isEmpty from 'lodash/isEmpty';

import { getApiUrl, insertRows } from './common';
import schema from '../database/registration_schema.json';

const db = SQLite.openDatabase('babysteps.db');
const apiToken = Constants.manifest.extra.apiToken;
const baseURL = getApiUrl();
const headers = { milestone_token: apiToken };

export const GetCurrentConsentVersion = async study_id => {
  console.log('*** Begin Update Consent Version');
  const url = '/consents/current';

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
        const consent = response.data;
        consent.api_id = consent.id;
        delete consent.id;
        console.log({ consent })
        insertRows('consents', schema['consents'], consent);
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

const SyncConsentVersion = async (study_id, consent_updated_at) => {
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

        if (consent_updated_at !== last_updated_at) {
          GetCurrentConsentVersion(study_id);
        } else {
          console.log('*** Consent Version is the most recent...');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncConsentVersion;
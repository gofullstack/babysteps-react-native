import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import { getApiUrl, insertRows } from './common';

const db = SQLite.openDatabase('babysteps.db');

const schema = require('./milestones_schema.json');
const apiToken = Constants.manifest.extra.apiToken;
const headers = { milestone_token: apiToken };
const baseURL = getApiUrl();

export const UploadMilestones = async study_id => {
  console.log('*** Begin Upload Milestones')
  const url = '/milestones';

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
        Object.keys(response.data).map(name => {
          insertRows(name, schema[name], response.data[name]);
        });
        console.log('*** Milestones Uploaded Successfully');
      })
      .catch(error => {
        console.log(error);
      });
  });
};

const UpdateMilestoneLastUpdated = async last_updated_at => {
  return db.transaction(tx => {
    tx.executeSql(
      `UPDATE sessions SET milestones_last_updated_at='${last_updated_at}';`,
      [],
      (_, response) => console.log(`*** Session milestones_last_updated_at ${last_updated_at}`),
      (_, error) => console.log(error),
    );
  });
}

const SyncMilestones = (study_id, milestones_last_updated_at) => {
  console.log('*** Begin Milestones Sync');
  const url = '/milestones/last_updated';

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
        const last_updated_at = response.data.last_updated_at;
        if (milestones_last_updated_at !== last_updated_at) {
          UploadMilestones(study_id);
          UpdateMilestoneLastUpdated(last_updated_at);
        } else {
          console.log('*** Milestones are up to date');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncMilestones;

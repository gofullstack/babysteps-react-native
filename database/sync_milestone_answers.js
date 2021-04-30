import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import omit from 'lodash/omit';

import { getApiUrl } from './common';

const db = SQLite.openDatabase('babysteps.db');

const apiToken = Constants.manifest.extra.apiToken;
const headers = { milestone_token: apiToken };
const baseURL = getApiUrl();

const executeApiCall = async answers => {
  const url = '/answers/bulk_upload';

  return axios({
    method: 'POST',
    responseType: 'json',
    baseURL,
    url,
    headers,
    data: { answers },
  })
    .then(response => {
      if (response.data) {
        response.data.forEach(answer => {
          const sql = `UPDATE answers SET api_id = ${answer.id} WHERE choice_id = ${answer.choice_id}`;
          db.transaction(tx => {
            tx.executeSql(
              sql,
              [],
              (_, response) => console.log(`*** Answer API ID updated: ${answer.id}`),
              (_, error) => console.log(`*** Error: Answer API ID update failed: ${error}`),
            );
          });
        });
      } else {
        console.log('*** No answers were saved on server');
      }
    })
    .catch(error => {
      console.log(`*** Error: Update Answer API call failed: ${error}`);
    });
};

const UploadMilestoneAnswers = async data => {
  const answers = [];
  forEach(data, row => {
    const answer = omit(row, [
      'id',
      'api_id',
      'user_api_id',
      'respondent_api_id',
      'subject_api_id',
      'attachments',
    ]);
    answers.push({
      ...answer,
      user_id: row.user_api_id,
      respondent_id: row.respondent_api_id,
      subject_id: row.subject_api_id,
    });
  });
  if (isEmpty(answers)) {
    console.log('*** All Answers Exist on Server');
  } else {
    await executeApiCall(answers);
  }
};

const SyncMilestoneAnswers = subject_id => {
  console.log('*** Begin Milestone Answers Sync');
  const url = '/answers/by_subject';

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
        const { choice_ids } = response.data;
        const sql = `SELECT * FROM answers WHERE choice_id NOT IN (${choice_ids.join()}) ;`;
        db.transaction(tx => {
          tx.executeSql(
            sql,
            [],
            (_, response) => {
              const answers = response.rows['_array'];
              UploadMilestoneAnswers(answers);
            },
            (_, error) => {
              console.log(error);
            },
          );
        });
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncMilestoneAnswers;

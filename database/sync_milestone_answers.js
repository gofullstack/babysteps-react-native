import axios from 'axios';
import Constants from 'expo-constants';

import { _ } from 'lodash';

import { store } from '../store';

import { getApiUrl } from './common';

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
          store.dispatch(updateMilestoneAnswer(answer.choice_id, { id: answer.id }));
        });
      } else {
        console.log('*** No answers were saved on server');
      }
    })
    .catch(error => {
      console.log(`*** Error: Update Answer API call failed: ${error}`);
    });
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
        const state = store.getState();
        const answers = [...state.milestones.answers.data];

        _.remove(answers, answer => {
          return choice_ids.includes(answer.choice_id);
        });

        if (_.isEmpty(answers)) {
          console.log('*** All Answers Exist on Server');
          return;
        }

        _.forEach(answers, answer => {
          _.omit(answer, ['id', 'attachments']);
        });
        executeApiCall(answers);
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncMilestoneAnswers;

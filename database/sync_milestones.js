import axios from 'axios';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import Moment from 'moment';

import store from '../store';
import { updateSession } from '../actions/session_actions';
import { apiFetchMilestones } from '../actions/milestone_actions';

import { getApiUrl } from './common';

const db = SQLite.openDatabase('babysteps.db');

const baseURL = getApiUrl();
const url = '/milestones';
const apiToken = Constants.manifest.extra.apiToken;
const headers = { milestone_token: apiToken };

const SyncMilestones = (study_id, milestones_updated_at, milestones_last_updated_at) => {
  console.log('*** Begin Milestones Sync');
  const url = '/milestones/last_updated';
  const timeNow = Moment().utc();
  let requeryTime = Moment(milestones_updated_at).add(1, 'd');
  if (!requeryTime.isValid()) {
    requeryTime = Moment().subtract(1, 'd');
  }

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
        // requery if updated on server or last updated more than 1 day ago
        if (
          milestones_last_updated_at !== last_updated_at ||
          requeryTime < timeNow
        ) {
          store.dispatch(apiFetchMilestones());
          store.dispatch(
            updateSession({
              milestones_last_updated_at: last_updated_at,
              milestones_updated_at: timeNow.format('YYYY-MM-DD HH:mm:SS'),
            }),
          );
          console.log(`*** Session milestones_last_updated_at ${last_updated_at}`)
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

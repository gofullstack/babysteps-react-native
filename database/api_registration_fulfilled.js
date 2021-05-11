import * as SQLite from 'expo-sqlite';

import {
  API_CREATE_USER_FULFILLED,
  API_CREATE_RESPONDENT_FULFILLED,
  API_CREATE_SUBJECT_FULFILLED,
} from '../actions/types';

import {
  updateUser,
  updateRespondent,
  updateSubject,
} from '../actions/registration_actions';

import { SaveSignature } from './sync_respondent_signature';

const db = SQLite.openDatabase('babysteps.db');

export default store => next => action => {
  if (!action || !action.type) {
    return null;
  }

  if (action.type === API_CREATE_USER_FULFILLED) {
    const headers = action.payload.headers;
    const state = store.getState();
    const user = state.registration.user.data;
    store.dispatch(updateUser({ id: user.id, api_id: headers.user_id }));
  }

  if (action.type === API_CREATE_RESPONDENT_FULFILLED) {
    const data = action.payload.data;
    const state = store.getState();
    const respondent = state.registration.respondent.data;
    store.dispatch(updateRespondent({ id: respondent.id, api_id: data.id }));
    SaveSignature(data.id);
  }

  if (action.type === API_CREATE_SUBJECT_FULFILLED) {
    const data = action.payload.data;
    const state = store.getState();
    const subject = state.registration.subject.data;
    store.dispatch(updateSubject({ id: data.id, api_id: data.id }));
  }

  return next(action);
};

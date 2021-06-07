//import isEmpty from 'lodash/isEmpty';

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

export default store => next => action => {
  if (!action || !action.type) {
    return null;
  }

  if (action.type === API_CREATE_USER_FULFILLED) {
    const headers = action.payload.headers;
    const api_id = parseInt(headers.user_id, 10);
    store.dispatch(updateUser({ api_id }));
  }

  if (action.type === API_CREATE_RESPONDENT_FULFILLED) {
    const api_id = action.payload.data.id;
    store.dispatch(updateRespondent({ api_id }));
    SaveSignature(api_id);
  }

  if (action.type === API_CREATE_SUBJECT_FULFILLED) {
    const api_id = action.payload.data.id;
    store.dispatch(updateSubject({ api_id }));
  }

  return next(action);
};

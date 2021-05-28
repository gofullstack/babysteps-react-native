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
    const id = parseInt(headers.user_id, 10);
    store.dispatch(updateUser({ id }));
  }

  if (action.type === API_CREATE_RESPONDENT_FULFILLED) {
    const id = action.payload.data.id;
    store.dispatch(updateRespondent({ id }));
    SaveSignature(id);
  }

  if (action.type === API_CREATE_SUBJECT_FULFILLED) {
    const id = action.payload.data.id;
    store.dispatch(updateSubject({ id }));
  }

  return next(action);
};

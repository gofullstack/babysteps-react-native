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
    //const state = store.getState();
    //const user = state.registration.user.data;
    //if (!isEmpty(user)) {
      const api_id = parseInt(headers.user_id, 10);
      store.dispatch(updateUser({ api_id }));
    //}
  }

  if (action.type === API_CREATE_RESPONDENT_FULFILLED) {
    const data = action.payload.data;
    //const state = store.getState();
    //const respondent = state.registration.respondent.data;
    //if (!isEmpty(respondent)) {
      store.dispatch(updateRespondent({ api_id: data.id }));
      SaveSignature(data.id);
    //}
  }

  if (action.type === API_CREATE_SUBJECT_FULFILLED) {
    const data = action.payload.data;
    //const state = store.getState();
    //const subject = state.registration.subject.data;
    //if (!isEmpty(subject)) {
      store.dispatch(updateSubject({ api_id: data.id }));
    //}
  }

  return next(action);
};

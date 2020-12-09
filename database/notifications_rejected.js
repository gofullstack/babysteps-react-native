import React from 'react';

import moment from 'moment';

import {
  UPDATE_MOMENTARY_ASSESSMENTS_FULFILLED,
  UPDATE_NOTIFICATIONS_FULFILLED,
  UPDATE_MOMENTARY_ASSESSMENTS_REJECTED,
  UPDATE_NOTIFICATIONS_REJECTED,
} from '../actions/types';

import { updateSession } from '../actions/session_actions';

// This function resets the last updated where request fails

export default store => next => action => {

  if (!action || !action.type) {
    return null;
  }

  if (
    [
      UPDATE_MOMENTARY_ASSESSMENTS_FULFILLED,
      UPDATE_NOTIFICATIONS_FULFILLED,
    ].includes(action.type)
  ) {
    // console.log('********** updated notifications fulfilled');
  }

  if (
    [
      UPDATE_MOMENTARY_ASSESSMENTS_REJECTED,
      UPDATE_NOTIFICATIONS_REJECTED,
    ].includes(action.type)
  ) {
    updateSession({ notifications_updated_at: null });
    console.log('********** update notifications failed');
  }

  return next(action);
};

import * as SQLite from 'expo-sqlite';
import { _ } from 'lodash';

import { API_UPDATE_MILESTONE_ANSWERS_FULFILLED } from '../actions/types';
import { updateMilestoneAnswers } from '../actions/milestone_actions';

export default store => next => action => {
  if (!action || !action.type) {
    return null;
  }
  if (action.type !== API_UPDATE_MILESTONE_ANSWERS_FULFILLED) {
    return next(action);
  }
  const data = action.payload.data;
  const answers = _.map(data, answer => {
    return createAPIKeys(answer);
  });

  return store.dispatch(updateMilestoneAnswers(answers));
};

// rename field names for local table
const createAPIKeys = answer => {
  if (!_.isEmpty(answer.respondent) && answer.respondent.id) {
    answer.respondent_id = answer.respondent.id;
  }
  delete answer.respondent;
  if (!_.isEmpty(answer.subject) && answer.subject.id) {
    answer.subject_id = answer.subject.id;
  }
  delete answer.subject;
  delete answer.created_at;
  return answer;
};

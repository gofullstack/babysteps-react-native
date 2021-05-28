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
  const keys = [
    { key: 'id', newKey: 'api_id' },
    { key: 'user_id', newKey: 'user_api_id' },
  ];
  _.map(keys, keyPair => {
    if (_.includes(_.keys(answer), keyPair.key)) {
      answer[keyPair.newKey] = _.clone(answer[keyPair.key], true);
      delete answer[keyPair.key];
    }
  });
  if (!_.isEmpty(answer.respondent) && answer.respondent.id) {
    answer.respondent_api_id = answer.respondent.id;
  }
  delete answer.respondent;
  if (!_.isEmpty(answer.subject) && answer.subject.id) {
    answer.subject_api_id = answer.subject.id;
  }
  delete answer.subject;
  delete answer.created_at;
  return answer;
};

import { SQLite } from 'expo';
import { _ } from 'lodash';

import { API_UPDATE_MILESTONE_ANSWERS_FULFILLED } from '../actions/types';

const db = SQLite.openDatabase('babysteps.db');

const getUpdateSQL = data => {
  const keys = _.keys(data);
  const updateSQL = [];

  _.forEach(keys, key => {
    if (_.isInteger(data[key])) {
      updateSQL.push(`${key} = ${data[key]}`);
    } else {
      updateSQL.push(`${key} = "${data[key]}"`);
    }
  });
  return updateSQL;
};

// rename field names for local table
const createAPIKeys = answer => {
  const keys = [
    { key: 'id', newKey: 'api_id' },
    { key: 'user_id', newKey: 'user_api_id' },
    { key: 'respondent_id', newKey: 'respondent_api_id' },
    { key: 'subject_id', newKey: 'subject_api_id' },
  ];
  _.map(keys, keyPair => {
    if (_.includes(_.keys(answer), keyPair.key)) {
      answer[keyPair.newKey] = _.clone(answer[keyPair.key], true);
      delete answer[keyPair.key];
    }
  });
  return answer;
};

export default store => next => action => {
  if (action.type !== API_UPDATE_MILESTONE_ANSWERS_FULFILLED) {
    return next(action);
  }

  return _.map(action.payload.data, answer => {
    answer = createAPIKeys(answer);
    const sql = `UPDATE answers SET ${getUpdateSQL(answer).join(', ')} WHERE answers.choice_id = ${answer.choice_id}`;
    db.transaction(tx => {
      tx.executeSql(sql, [],
        (_, response) => console.log(`Answer for choice ${answer.choice_id} updated from api`),
        (_, error) => console.log(`ERROR - Answer for choice ${answer.choice_id} not updated from api: ${error}`),
      );
    });
  }); // map(data)
};
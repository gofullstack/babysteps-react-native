import { applyMiddleware, createStore, compose } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';

import api from '../database/api';
import apiRegistrationFulfilled from '../database/api_registration_fulfilled';
import apiAnswersFulfilled from '../database/api_answers_fulfilled';
import apiMilestoneTasksFulfilled from '../database/api_milestone_tasks_fulfilled';
import notificationsRejected from '../database/notifications_rejected';

import reducers from '../reducers';

let composeEnhancers = compose;
if (__DEV__) {
  // help with chrome develper toods
  composeEnhancers = window.REDUX_DEVTOOLS_EXTENSION_COMPOSE || compose;
}

const logger = createLogger();

const store = createStore(
  reducers,
  compose(
    applyMiddleware(
      promise(),
      thunk,
      logger,
      api,
      apiRegistrationFulfilled,
      apiMilestoneTasksFulfilled,
      apiAnswersFulfilled,
      notificationsRejected,
    ),
  ),
);
export default store;

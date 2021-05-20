import { applyMiddleware, createStore, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';

import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../database/api';
import apiRegistrationFulfilled from '../database/api_registration_fulfilled';
import apiAnswersFulfilled from '../database/api_answers_fulfilled';
import apiMilestoneTasksFulfilled from '../database/api_milestone_tasks_fulfilled';
import notificationsRejected from '../database/notifications_rejected';

import rootReducers from '../reducers';

const persistConfig = {
  timeout: 0,
  key: 'babySteps',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
};

const persistedReducers = persistReducer(persistConfig, rootReducers);

let composeEnhancers = compose;
if (__DEV__) {
  // help with chrome develper toods
  composeEnhancers = window.REDUX_DEVTOOLS_EXTENSION_COMPOSE || compose;
}

const logger = createLogger();

export const store = createStore(
  persistedReducers,
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

export const persistor = persistStore(store);

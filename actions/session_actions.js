import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import { _ } from 'lodash';

import { insertRows, getApiUrl } from '../database/common';

import schema from '../database/registration_schema.json';

import Constants from 'expo-constants';

import {
  API_TOKEN_REFRESH_PENDING,
  API_TOKEN_REFRESH_FULFILLED,
  API_TOKEN_REFRESH_REJECTED,
  API_TOKEN_REFRESH_FAILED,

  RESET_SESSION,
  SESSION_SYNC_MESSAGE,

  FETCH_SESSION_PENDING,
  FETCH_SESSION_FULFILLED,
  FETCH_SESSION_REJECTED,

  UPDATE_SESSION_PENDING,
  UPDATE_SESSION_FULFILLED,
  UPDATE_SESSION_REJECTED,

  UPDATE_CONNECTION_TYPE,

  UPDATE_SESSION_PENDING_ACTIONS_PENDING,
  UPDATE_SESSION_PENDING_ACTIONS_FULFILLED,
  UPDATE_SESSION_PENDING_ACTIONS_REJECTED,

  DISPATCH_SESSION_PENDING_ACTIONS_PENDING,
  DISPATCH_SESSION_PENDING_ACTIONS_FULFILLED,
  DISPATCH_SESSION_PENDING_ACTIONS_REJECTED,

  API_FETCH_SIGNIN_PENDING,
  API_FETCH_SIGNIN_FULFILLED,
  API_FETCH_SIGNIN_REJECTED,

  API_FETCH_CONSENT_LAST_UPDATED_PENDING,
  API_FETCH_CONSENT_LAST_UPDATED_FULFILLED,
  API_FETCH_CONSENT_LAST_UPDATED_REJECTED,

  API_FETCH_MILESTONES_LAST_UPDATED_PENDING,
  API_FETCH_MILESTONES_LAST_UPDATED_FULFILLED,
  API_FETCH_MILESTONES_LAST_UPDATED_REJECTED,

  API_FETCH_MILESTONE_CALENDAR_LAST_UPDATED_PENDING,
  API_FETCH_MILESTONE_CALENDAR_LAST_UPDATED_FULFILLED,
  API_FETCH_MILESTONE_CALENDAR_LAST_UPDATED_REJECTED,

} from './types';

const db = SQLite.openDatabase('babysteps.db');

const Pending = type => {
  return { type };
};

const Response = (type, payload, session = {}) => {
  return { type, payload, session };
};

export const resetSession = () => {
  return function(dispatch) {
    dispatch(Pending(RESET_SESSION));
  };
};

export const fetchSession = () => {
  return function(dispatch) {
    dispatch(Pending(FETCH_SESSION_PENDING));
    return db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM sessions LIMIT 1;',
        [],
        (_, response) => dispatch(Response(FETCH_SESSION_FULFILLED, response)),
        (_, error) => dispatch(Response(FETCH_SESSION_REJECTED, error)),
      );
    });
  };
};

const sendSessionUpdate = (dispatch, data) => {
  dispatch(Pending(UPDATE_SESSION_PENDING));

  const keys = _.keys(data);
  const updateSQL = [];
  _.forEach(keys, key => {
    if (typeof data[key] === 'boolean') {
      const boolean = data[key] ? 1 : 0;
      updateSQL.push(`${key} = ${boolean}`);
    } else {
      updateSQL.push(`${key} = '${data[key]}'`);
    }
  });

  return db.transaction(tx => {
    tx.executeSql(
      `UPDATE sessions SET ${updateSQL.join(', ')};`,
      [],
      (_, response) => dispatch(Response(UPDATE_SESSION_FULFILLED, response, data)),
      (_, error) => dispatch(Response(UPDATE_SESSION_REJECTED, error)),
    );
  });
};

export const updateSession = data => {
  return function(dispatch) {
    sendSessionUpdate(dispatch, data);
  };
};

export const apiUpdateSession = (dispatch, data) => {
  return sendSessionUpdate(dispatch, data);
};

export const apiTokenRefresh = (dispatch, session) => {
  return dispatch({
    type: API_TOKEN_REFRESH_PENDING,
    payload: {
      session,
      data: {
        email: session.email,
        password: session.password,
      },
    }, // payload
    meta: {
      offline: {
        effect: {
          method: 'POST',
          url: '/user_session',
          fulfilled: API_TOKEN_REFRESH_FULFILLED,
          rejected: API_TOKEN_REFRESH_REJECTED,
        },
      },
    }, // meta
  });
};

export const apiDisptachTokenRefresh = session => {
  return function(dispatch) {
    apiTokenRefresh(dispatch, session);
  };
};

export const apiTokenRefreshFailed = () => {
  return function(dispatch) {
    dispatch(Pending(API_TOKEN_REFRESH_FAILED));
  };
};

export const updatePendingActions = (dispatch, actions) => {
  dispatch(Pending(UPDATE_SESSION_PENDING_ACTIONS_PENDING));
  return db.transaction(tx => {
    tx.executeSql(
      'UPDATE sessions SET pending_actions = ?;',
      [JSON.stringify(actions)],
      (_, response) => dispatch(Response(UPDATE_SESSION_PENDING_ACTIONS_FULFILLED, actions)),
      (_, error) => dispatch(Response(UPDATE_SESSION_PENDING_ACTIONS_REJECTED, error)),
    );
  });
};

export const dispatchPendingActions = pending_actions => {
  return function(dispatch) {
    dispatch(Pending(DISPATCH_SESSION_PENDING_ACTIONS_PENDING));
    _.forEach(pending_actions, action => {
      dispatch(decodePendingAction(action));
    });

    return db.transaction(tx => {
      tx.executeSql(
        'UPDATE sessions SET pending_actions = ?;',
        [JSON.stringify([])],
        (_, response) => dispatch(Response(DISPATCH_SESSION_PENDING_ACTIONS_FULFILLED, response)),
        (_, error) => dispatch(Response(DISPATCH_SESSION_PENDING_ACTIONS_REJECTED, error)),
      );
    });
  };
};

export const decodePendingAction = action => {
  switch (action.type) {
    case 'api_create_milestone_answer_pending': {
      if (action.payload && action.payload.data && action.payload.data._parts) {
        const formData = new FormData();
        action.payload.data._parts.forEach(part => {
          formData.append(...part);
        });
        action.payload.data = formData;
      }
    }
  }
  return action;
};

export const updateConnectionType = type => {
  return function(dispatch) {
    dispatch(Response(UPDATE_CONNECTION_TYPE, type));
  };
};

// this fetches acknowledgement of user from api
export const apiFetchSignin = (email, password) => {

  return dispatch => {
    dispatch(Pending(API_FETCH_SIGNIN_PENDING));
    const baseURL = getApiUrl();

    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        responseType: 'json',
        baseURL,
        url: '/user_session',
        data: {
          email,
          password,
        },
      })
        .then(response => {
          let data = response.data.data;
          data.api_id = data.id;
          delete data.id;

          db.transaction(tx => {
            tx.executeSql(
              'UPDATE sessions SET email = ?, password = ?;',
              [email, password],
              (_, response) => console.log('*** Fetch Sign In: save session successful'),
              (_, error) => dispatch(Response(API_FETCH_SIGNIN_REJECTED, error)),
            );
          });

          insertRows('users', schema['users'], [data]);
          dispatch(
            Response(API_FETCH_SIGNIN_FULFILLED, response, { email, password }),
          );
        })
        .catch(error => {
          dispatch(Response(API_FETCH_SIGNIN_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const apiFetchConsentLastUpdated = study_id => {

  return dispatch => {
    dispatch(Pending(API_FETCH_CONSENT_LAST_UPDATED_PENDING));
    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        responseType: 'json',
        baseURL,
        url: '/consents/last_updated',
        params: { study_id },
        headers: {
          "milestone_token": apiToken,
        },
      })
        .then(response => {
          dispatch(Response(API_FETCH_CONSENT_LAST_UPDATED_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_FETCH_CONSENT_LAST_UPDATED_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const apiFetchMilestonesLastUpdated = study_id => {

  return dispatch => {
    dispatch(Pending(API_FETCH_MILESTONES_LAST_UPDATED_PENDING));
    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        responseType: 'json',
        baseURL,
        url: '/milestones/last_updated',
        params: { study_id },
        headers: {
          "milestone_token": apiToken,
        },
      })
        .then(response => {
          dispatch(Response(API_FETCH_MILESTONES_LAST_UPDATED_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_FETCH_MILESTONES_LAST_UPDATED_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const apiFetchMilestoneCalendarLastUpdated = subject_id => {

  return dispatch => {
    dispatch(Pending(API_FETCH_MILESTONE_CALENDAR_LAST_UPDATED_PENDING));
    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        responseType: 'json',
        baseURL,
        url: '/milestone_calendars/last_updated',
        params: { subject_id },
        headers: {
          "milestone_token": apiToken,
        },
      })
        .then(response => {
          dispatch(Response(API_FETCH_MILESTONE_CALENDAR_LAST_UPDATED_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_FETCH_MILESTONE_CALENDAR_LAST_UPDATED_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};
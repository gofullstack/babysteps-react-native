import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import axios from 'axios';
import { _ } from 'lodash';

import { store } from '../store';

import { getApiUrl } from '../database/common';

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

  UPDATE_SESSION_FULFILLED,

  UPDATE_SESSION_PENDING_ACTIONS_PENDING,
  UPDATE_SESSION_PENDING_ACTIONS_FULFILLED,
  UPDATE_SESSION_PENDING_ACTIONS_REJECTED,

  API_FETCH_SIGNIN_PENDING,
  API_FETCH_SIGNIN_FULFILLED,
  API_FETCH_SIGNIN_REJECTED,

  CREATE_USER_FULFILLED,
} from './types';

const db = SQLite.openDatabase('babysteps.db');

const Pending = type => {
  return { type };
};

const Response = (type, payload, session = {}) => {
  return { type, payload, session };
};

export const resetSession = () => {
  return dispatch => {
    dispatch(Pending(RESET_SESSION));
  };
};

export const fetchSession = () => {
  return dispatch => {
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

export const updateSession = data => {
  return dispatch => {
    dispatch(Response(UPDATE_SESSION_FULFILLED, data));
  };
};

export const apiUpdateSession = (dispatch, data) => {
  return dispatch => {
    dispatch(Response(UPDATE_SESSION_FULFILLED, data));
  };
};

export const apiTokenRefresh = (dispatch, session) => {
  const { email, password } = session;
  const url = '/user_session';

  return dispatch({
    type: API_TOKEN_REFRESH_PENDING,
    payload: {
      data: { email, password },
    },
    meta: {
      offline: {
        effect: {
          method: 'POST',
          url,
          fulfilled: API_TOKEN_REFRESH_FULFILLED,
          rejected: API_TOKEN_REFRESH_REJECTED,
        },
      },
    }, // meta
  });
};

export const apiDispatchTokenRefresh = session => {
  return function(dispatch) {
    apiTokenRefresh(dispatch, session);
  };
};

export const apiTokenRefreshFailed = () => {
  return function(dispatch) {
    dispatch(Pending(API_TOKEN_REFRESH_FAILED));
  };
};

export const updatePendingActions = actions => {
  const dispatch = store.dispatch;
  dispatch(Pending(UPDATE_SESSION_PENDING_ACTIONS_PENDING));
  return function(dispatch) {
    dispatch(Response(UPDATE_SESSION_PENDING_ACTIONS_FULFILLED, JSON.stringify(actions)));
  };
};

export const dispatchPendingActions = pending_actions => {
  return function(dispatch) {
    dispatch(Pending(UPDATE_SESSION_PENDING_ACTIONS_PENDING));
    _.forEach(pending_actions, action => {
      dispatch(decodePendingAction(action));
    });
    dispatch(Response(DISPATCH_SESSION_PENDING_ACTIONS_FULFILLED));
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

// this fetches acknowledgement of user from api
export const apiFetchSignin = (email, password) => {

  return dispatch => {
    dispatch(Pending(API_FETCH_SIGNIN_PENDING));
    const baseURL = getApiUrl();
    const url = '/user_session';
    const data = { email, password };

    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        responseType: 'json',
        baseURL,
        url,
        data,
      })
        .then(response => {
          const { data } = response.data;
          const user = { ...data, email, password };
          dispatch(Response(API_FETCH_SIGNIN_FULFILLED, response, user));
          dispatch(Response(CREATE_USER_FULFILLED, user));
        })
        .catch(error => {
          dispatch(Response(API_FETCH_SIGNIN_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

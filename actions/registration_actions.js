import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import axios from "axios";

import { _ } from 'lodash';

import { apiTokenRefresh } from './session_actions';

import { insertRows, getApiUrl, getUpdateSQL } from '../database/common';
import schema from '../database/registration_schema.json';

import Constants from 'expo-constants';
import CONSTANTS from '../constants';

import {

  FETCH_USER_PENDING,
  FETCH_USER_FULFILLED,
  FETCH_USER_REJECTED,

  CREATE_USER_FULFILLED,

  UPDATE_USER_FULFILLED,

  API_CREATE_USER_PENDING,
  API_CREATE_USER_FULFILLED,
  API_CREATE_USER_REJECTED,

  RESET_RESPONDENT,

  FETCH_RESPONDENT_PENDING,
  FETCH_RESPONDENT_FULFILLED,
  FETCH_RESPONDENT_REJECTED,

  CREATE_RESPONDENT_FULFILLED,

  UPDATE_RESPONDENT_FULFILLED,

  API_CREATE_RESPONDENT_PENDING,
  API_CREATE_RESPONDENT_FULFILLED,
  API_CREATE_RESPONDENT_REJECTED,

  API_UPDATE_RESPONDENT_PENDING,
  API_UPDATE_RESPONDENT_FULFILLED,
  API_UPDATE_RESPONDENT_REJECTED,

  API_FETCH_USER_RESPONDENT_PENDING,
  API_FETCH_USER_RESPONDENT_FULFILLED,
  API_FETCH_USER_RESPONDENT_REJECTED,

  API_FETCH_RESPONDENT_ATTACHMENTS_PENDING,
  API_FETCH_RESPONDENT_ATTACHMENTS_FULFILLED,
  API_FETCH_RESPONDENT_ATTACHMENTS_REJECTED,

  RESET_SUBJECT,

  FETCH_SUBJECT_PENDING,
  FETCH_SUBJECT_FULFILLED,
  FETCH_SUBJECT_REJECTED,

  CREATE_SUBJECT_PENDING,
  CREATE_SUBJECT_FULFILLED,
  CREATE_SUBJECT_REJECTED,

  UPDATE_SUBJECT_PENDING,
  UPDATE_SUBJECT_FULFILLED,
  UPDATE_SUBJECT_REJECTED,

  API_CREATE_SUBJECT_PENDING,
  API_CREATE_SUBJECT_FULFILLED,
  API_CREATE_SUBJECT_REJECTED,

  API_UPDATE_SUBJECT_PENDING,
  API_UPDATE_SUBJECT_FULFILLED,
  API_UPDATE_SUBJECT_REJECTED,

  API_FETCH_USER_SUBJECT_PENDING,
  API_FETCH_USER_SUBJECT_FULFILLED,
  API_FETCH_USER_SUBJECT_REJECTED,

  API_SYNC_REGISTRATION_PENDING,
  API_SYNC_REGISTRATION_FULFILLED,
  API_SYNC_REGISTRATION_REJECTED,

  API_SYNC_SIGNATURE_PENDING,
  API_SYNC_SIGNATURE_FULFILLED,
  API_SYNC_SIGNATURE_REJECTED,

  FETCH_CONSENT_PENDING,
  FETCH_CONSENT_FULFILLED,
  FETCH_CONSENT_REJECTED,

  API_FETCH_CONSENT_PENDING,
  API_FETCH_CONSENT_FULFILLED,
  API_FETCH_CONSENT_REJECTED,

} from './types';

const db = SQLite.openDatabase('babysteps.db');

const Pending = type => {
  return { type };
};

const Response = (type, payload, formData = {}) => {
  return { type, payload, formData };
};

export const fetchRegistrationData = () => {
  // Thunk middleware knows how to handle functions.
  return function(dispatch) {
    fetchUser()
      .then(() => {
        fetchRespondent();
      })
      .then(() => {
        fetchSubject();
      });
  };
};

export const fetchUser = () => {
  return function(dispatch) {
    dispatch(Pending(FETCH_USER_PENDING));

    return db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM users LIMIT 1;`,
        [],
        (_, response) => {
          dispatch( Response(FETCH_USER_FULFILLED, response));
        },
        (_, error) => {
          dispatch(Response(FETCH_USER_REJECTED, error));
        },
      );
    });
  };
};

export const createUser = data => {
  return function(dispatch) {
    dispatch(Response(CREATE_USER_FULFILLED, data));
  };
};

export const updateUser = data => {
  return function(dispatch) {
    dispatch(Response(UPDATE_USER_FULFILLED, data));
  };
};

export const apiCreateUser = data => {
  return function(dispatch) {
    dispatch(Pending(API_CREATE_USER_PENDING));
    const baseURL = getApiUrl();
    const url = '/user_registration';

    return axios({
      method: 'POST',
      responseType: 'json',
      baseURL,
      url,
      data,
    })
      .then(response => {
        dispatch(Response(API_CREATE_USER_FULFILLED, response, data));
      })
      .catch(error => {
        dispatch(Response(API_CREATE_USER_REJECTED, error));
      });
  };
};

export const fetchRespondent = () => {
  return function(dispatch) {
    dispatch(Pending(FETCH_RESPONDENT_PENDING));

    return db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM respondents LIMIT 1;`,
        [],
        (_, response) => {
          dispatch(Response(FETCH_RESPONDENT_FULFILLED, response));
        },
        (_, error) => {
          dispatch(Response(FETCH_RESPONDENT_REJECTED, error));
        },
      );
    });
  };
};

export const resetRespondent = () => {
  return function(dispatch) {
    dispatch(Pending(RESET_RESPONDENT));
  };
};

export const createRespondent = data => {
  return function(dispatch) {
    dispatch(Response(CREATE_RESPONDENT_FULFILLED, data));
  };
};

export const apiCreateRespondent = respondent => {
  delete respondent.api_id;

  return function(dispatch) {
    dispatch({
      type: API_CREATE_RESPONDENT_PENDING,
      payload: {
        data: {
          respondent,
        },
      },
      meta: {
        offline: {
          effect: {
            method: 'POST',
            url: '/respondents',
            fulfilled: API_CREATE_RESPONDENT_FULFILLED,
            rejected: API_CREATE_RESPONDENT_REJECTED,
          },
        },
      },
    });
  };
};

export const updateRespondent = data => {
  return function(dispatch) {
    dispatch(Response(UPDATE_RESPONDENT_FULFILLED, data));
  };
};

export const apiUpdateRespondent = (session, respondent) => {
  const api_id = respondent.api_id;
  delete respondent.id;
  delete respondent.api_id;

  return function(dispatch) {
    dispatch({
      type: API_UPDATE_RESPONDENT_PENDING,
      payload: {
        data: {
          respondent,
        },
        session,
      },
      meta: {
        offline: {
          effect: {
            method: 'PUT',
            url: `/respondents/${api_id}`,
            fulfilled: API_UPDATE_RESPONDENT_FULFILLED,
            rejected: API_UPDATE_RESPONDENT_REJECTED,
          },
        },
      },
    });

  }; // return dispatch
};

export const resetSubject = () => {
  return function(dispatch) {
    dispatch(Pending(RESET_SUBJECT));
  };
};

export const fetchSubject = () => {
  return function(dispatch) {
    dispatch(Pending(FETCH_SUBJECT_PENDING));

    return db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM subjects LIMIT 1;`,
        [],
        (_, response) => dispatch(Response(FETCH_SUBJECT_FULFILLED, response)),
        (_, error) => dispatch(Response(FETCH_SUBJECT_REJECTED, error)),
      );
    });
  };
};

export const createSubject = data => {
  return function(dispatch) {
    dispatch(Response(CREATE_SUBJECT_FULFILLED, data));
  };
};

export const apiCreateSubject = (study_id, subject) => {
  //delete data.id;
  delete subject.api_id;

  return function(dispatch) {
    dispatch({
      type: API_CREATE_SUBJECT_PENDING,
      payload: {
        data: {
          study_id,
          subject,
        },
      },
      meta: {
        offline: {
          effect: {
            method: 'POST',
            url: '/subjects',
            fulfilled: API_CREATE_SUBJECT_FULFILLED,
            rejected: API_CREATE_SUBJECT_REJECTED,
          },
        },
      },
    });
  };
};

export const updateSubject = data => {
  return function(dispatch) {
    dispatch(Response(UPDATE_SUBJECT_FULFILLED, data));
  };
};

export const apiUpdateSubject = (session, study_id, subject) => {
  const api_id = subject.api_id;
  delete subject.id;
  delete subject.api_id;

  return function(dispatch) {
    dispatch({
      type: API_UPDATE_SUBJECT_PENDING,
      payload: {
        data: {
          study_id,
          subject,
        },
        session,
      },
      meta: {
        offline: {
          effect: {
            method: 'PUT',
            url: `/subjects/${api_id}`,
            fulfilled: API_UPDATE_SUBJECT_FULFILLED,
            rejected: API_UPDATE_SUBJECT_REJECTED,
          },
        },
      },
    });
  };
};

// this fetches respondent and subject from api based on user id
export const apiSyncRegistration = user_id => {
  return dispatch => {
    dispatch(Pending(API_SYNC_REGISTRATION_PENDING));
    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;
    const headers = { milestone_token: apiToken };

    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        responseType: 'json',
        baseURL,
        url: '/sync_registration',
        headers,
        data: {
          user_id,
        },
      })
        .then(response => {
          if (response.status !== 404) {
            const data = response.data;
            if (data.respondents) {
              const respondents = data.respondents;
              // respondent id becomes api id in sqlite
              respondents[0].api_id = respondents[0].id;
              insertRows('respondents', schema['respondents'], respondents);
            }
            if (data.subjects) {
              const subjects = data.subjects;
              // subject id becomes api id in sqlite
              subjects[0].api_id = subjects[0].id;
              insertRows('subjects', schema['subjects'], subjects);
            }
          }
          dispatch(Response(API_SYNC_REGISTRATION_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_SYNC_REGISTRATION_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const apiSyncSignature = user_id => {
  return function(dispatch) {
    dispatch(Pending(API_SYNC_SIGNATURE_PENDING));
    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;
    const fileUri = FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY + '/signature.png';
    const headers = { milestone_token: apiToken };

    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        responseType: 'json',
        baseURL,
        url: '/sync_signature',
        headers,
        data: {
          user_id,
        },
      })
        .then(response => {
          const imageUrls = response.data;
          if (imageUrls.status !== 404) {
            FileSystem.downloadAsync(imageUrls[0], fileUri)
              .then(response => {
                dispatch(Response(API_SYNC_SIGNATURE_FULFILLED, response));
              })
              .catch(error => {
                dispatch(Response(API_SYNC_SIGNATURE_REJECTED, error));
              });
          } else {
            dispatch(Response(API_SYNC_SIGNATURE_FULFILLED, response));
          }
        })
        .catch(error => {
          dispatch(Response(API_SYNC_SIGNATURE_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const fetchConsent = () => {
  return function(dispatch) {
    dispatch(Pending(FETCH_CONSENT_PENDING));

    return db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM consents LIMIT 1;`,
        [],
        (_, response) => {
          dispatch(Response(FETCH_CONSENT_FULFILLED, response));
        },
        (_, error) => {
          dispatch(Response(FETCH_CONSENT_REJECTED, error));
        },
      );
    });
  };
};

export const apiFetchConsent = study_id => {

  return dispatch => {
    dispatch(Pending(API_FETCH_CONSENT_PENDING));
    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;
    const headers = { milestone_token: apiToken };
    const url = '/consents/current';

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        responseType: 'json',
        baseURL,
        url,
        headers,
        params: { study_id },
      })
        .then(response => {
          const consent = response.data;
          consent.api_id = consent.id;
          dispatch(Response(API_FETCH_CONSENT_FULFILLED, consent));
        })
        .catch(error => {
          dispatch(Response(API_FETCH_CONSENT_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

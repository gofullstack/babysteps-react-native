import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import axios from "axios";

import { _ } from 'lodash';

import { apiTokenRefresh } from './session_actions';

import { insertRows, getApiUrl } from '../database/common';
import schema from '../database/registration_schema.json';

import Constants from 'expo-constants';
import CONSTANTS from '../constants';

import {

  FETCH_USER_PENDING,
  FETCH_USER_FULFILLED,
  FETCH_USER_REJECTED,

  CREATE_USER_PENDING,
  CREATE_USER_FULFILLED,
  CREATE_USER_REJECTED,

  UPDATE_USER_PENDING,
  UPDATE_USER_FULFILLED,
  UPDATE_USER_REJECTED,

  API_CREATE_USER_PENDING,
  API_CREATE_USER_FULFILLED,
  API_CREATE_USER_REJECTED,

  RESET_RESPONDENT,

  FETCH_RESPONDENT_PENDING,
  FETCH_RESPONDENT_FULFILLED,
  FETCH_RESPONDENT_REJECTED,

  CREATE_RESPONDENT_PENDING,
  CREATE_RESPONDENT_FULFILLED,
  CREATE_RESPONDENT_REJECTED,

  UPDATE_RESPONDENT_PENDING,
  UPDATE_RESPONDENT_FULFILLED,
  UPDATE_RESPONDENT_REJECTED,

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

  API_SAVE_SIGNATURE_PENDING,
  API_SAVE_SIGNATURE_FULFILLED,
  API_SAVE_SIGNATURE_REJECTED,

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

} from './types';

const db = SQLite.openDatabase('babysteps.db');

const Pending = type => {
  return { type };
};

const Response = (type, payload, formData={}) => {
  return { type, payload, formData }
};

const getUpdateSQL = data => {
  const keys = _.keys(data);
  const updateSQL = [];

  _.forEach(keys, key => {
    if (_.isInteger(data[key])) {
      updateSQL.push(`${key} = ${data[key]}`);
    } else {
      updateSQL.push(`${key} = '${data[key]}'`);
    }
  });
  return updateSQL;
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

export const createUser = user => {
  return function (dispatch) {
    dispatch(Pending(CREATE_USER_PENDING));

    return db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM users;',
        [],
        (_, rows) => console.log('** Clear users table'),
        (_, error) => console.log('*** Error in clearing users table'),
      );
      tx.executeSql(
        'INSERT INTO users (api_id, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?);',
        [
          user.api_id,
          user.email,
          user.password,
          user.first_name,
          user.last_name,
        ],
        (_, response) => {
          dispatch(Response(CREATE_USER_FULFILLED, response, user));
        },
        (_, error) => {
          dispatch(Response(CREATE_USER_REJECTED, error));
        },
      );
    });
  };
};

export const updateUser = data => {
  return function(dispatch) {
    dispatch(Pending(UPDATE_USER_PENDING));
    const id = data.id;
    delete data.id;
    const updateSQL = getUpdateSQL(data);

    return db.transaction(tx => {
      tx.executeSql(
        `UPDATE users SET ${updateSQL.join(', ')} WHERE id = ${id};`,
        [],
        (_, response) => {
          dispatch(Response(UPDATE_USER_FULFILLED, response, data));
        },
        (_, error) => {
          dispatch(Response(UPDATE_USER_REJECTED, error));
        },
      );
    });
  };
};

export const apiCreateUser = user => {
  return function(dispatch) {
    dispatch(Pending(API_CREATE_USER_PENDING));
    const baseURL = getApiUrl();

    return axios({
      method: 'POST',
      responseType: 'json',
      baseURL,
      url: '/user_registration',
      data: user,
    })
      .then(response => {
        dispatch(Response(API_CREATE_USER_FULFILLED, response, user));
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

export const createRespondent = respondent => {
  return function(dispatch) {
    dispatch(Pending(CREATE_RESPONDENT_PENDING));
    const sql = 'INSERT INTO respondents ( \
      user_id, \
      respondent_type, \
      first_name, \
      last_name, \
      middle_name, \
      address_1, \
      address_2, \
      city, \
      state, \
      zip_code, \
      country_code, \
      email, \
      home_phone, \
      other_phone, \
      date_of_birth, \
      drivers_license_number, \
      marital_status, \
      weight, \
      height, \
      tos_id, \
      irb_id, \
      accepted_tos_at \
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    const values = [
      respondent.user_id,
      respondent.respondent_type,
      respondent.first_name,
      respondent.last_name,
      respondent.middle_name,
      respondent.address_1,
      respondent.address_2,
      respondent.city,
      respondent.state,
      respondent.zip_code,
      'USA',
      respondent.email,
      respondent.home_phone,
      respondent.other_phone,
      respondent.date_of_birth,
      respondent.drivers_license_number,
      respondent.marital_status,
      respondent.weight,
      respondent.height,
      respondent.tos_id,
      respondent.irb_id,
      respondent.accepted_tos_at,
    ];
    return db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM respondents',
        [],
        (_, rows) => console.log('** Clear respondents table'),
        (_, error) => console.log('*** Error in clearing respondents table'),
      );
      tx.executeSql(
        sql,
        values,
        (_, response) => {
          dispatch(Response(CREATE_RESPONDENT_FULFILLED, response, respondent));
        },
        (_, error) => {
          dispatch(Response(CREATE_RESPONDENT_REJECTED, error));
        },
      );
    });
  };
};

export const apiCreateRespondent = (session, data) => {
  //delete data.id;
  delete data.api_id;

  return function(dispatch) {
    dispatch({
      type: API_CREATE_RESPONDENT_PENDING,
      payload: {
        data: {
          respondent: data,
        },
        session,
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
    dispatch(Pending(UPDATE_RESPONDENT_PENDING));
    delete data.id;
    const updateSQL = getUpdateSQL(data);

    return db.transaction(tx => {
      tx.executeSql(
        `UPDATE respondents SET ${updateSQL.join(', ')};`,
        [],
        (_, response) => {
          dispatch(Response(UPDATE_RESPONDENT_FULFILLED, response, data));
        },
        (_, error) => {
          dispatch(Response(UPDATE_RESPONDENT_REJECTED, error));
        },
      );
    });
  };
};

export const apiUpdateRespondent = (session, data) => {
  const api_id = data.api_id;
  delete data.id;
  delete data.api_id;

  return function(dispatch) {
    dispatch({
      type: API_UPDATE_RESPONDENT_PENDING,
      payload: {
        data: {
          respondent: data,
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

export const apiSaveSignature = (api_id, uri) => {
  return function(dispatch) {

    dispatch(Pending(API_SAVE_SIGNATURE_PENDING));

    const formData = new FormData();
    formData.append('respondent[attachments][]', {
      uri,
      name: 'signature.png',
      type: 'image/png',
    });

    const baseURL = getApiUrl();
    const url = `/respondents/${api_id}/update_attachment`;
    const apiToken = Constants.manifest.extra.apiToken;
    const headers = { milestone_token: apiToken };

    axios({
      method: 'PUT',
      responseType: 'json',
      baseURL,
      url,
      headers,
      data: formData,
    })
      .then(response => {
        dispatch(Response(API_SAVE_SIGNATURE_FULFILLED, response));
      })
      .catch(error => {
        dispatch(Response(API_SAVE_SIGNATURE_REJECTED, error));
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

export const createSubject = subject => {
  return function(dispatch) {
    dispatch(Pending(CREATE_SUBJECT_PENDING));

    const sql =
      'INSERT INTO subjects ( \
        first_name, \
        last_name, \
        middle_name, \
        gender, \
        conception_method, \
        expected_date_of_birth, \
        date_of_birth, \
        days_premature, \
        screening_blood, \
        screening_blood_notification, \
        screening_blood_other, \
        video_presentation, \
        video_sharing \
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';

    const values = [
      subject.first_name,
      subject.last_name,
      subject.middle_name,
      subject.gender,
      subject.conception_method,
      subject.expected_date_of_birth,
      subject.date_of_birth,
      subject.days_premature,
      subject.screening_blood,
      subject.screening_blood_notification,
      subject.screening_blood_other,
      subject.video_presentation,
      subject.video_sharing,
    ];

    return db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM subjects',
        [],
        (_, rows) => console.log('** Clear subjects table'),
        (_, error) => console.log('*** Error in clearing subjects table'),
      );
      tx.executeSql(
        sql,
        values,
        (_, response) => {
          dispatch(Response(CREATE_SUBJECT_FULFILLED, response, subject));
        },
        (_, error) => {
          dispatch(Response(CREATE_SUBJECT_REJECTED, error));
        },
      );
    });
  };
};

export const apiCreateSubject = (session, data) => {
  //delete data.id;
  delete data.api_id;

  return function(dispatch) {
    dispatch({
      type: API_CREATE_SUBJECT_PENDING,
      payload: {
        data: {
          subject: data,
        },
        session,
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
    dispatch(Pending(UPDATE_SUBJECT_PENDING));
    delete data.id;
    const updateSQL = getUpdateSQL(data);

    return db.transaction(tx => {
      tx.executeSql(
        `UPDATE subjects SET ${updateSQL.join(', ')};`,
        [],
        (_, response) => {
          dispatch(Response(UPDATE_SUBJECT_FULFILLED, response, data));
        },
        (_, error) => {
          dispatch(Response(UPDATE_SUBJECT_REJECTED, error));
        },
      );
    });
  };
};

export const apiUpdateSubject = (session, data) => {
  const api_id = data.api_id;
  delete data.id;
  delete data.api_id;

  return function(dispatch) {
    dispatch({
      type: API_UPDATE_SUBJECT_PENDING,
      payload: {
        data: {
          subject: data,
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

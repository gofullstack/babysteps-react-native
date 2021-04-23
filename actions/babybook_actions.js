import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

import { insertRows, getApiUrl } from '../database/common';
import schema from '../database/babybook_schema.json';

import forEach from 'lodash/forEach';
import omit from 'lodash/omit';
import keys from 'lodash/keys';
import values from 'lodash/values';

import Constants from 'expo-constants';
import CONSTANTS from '../constants';

import {
  RESET_BABYBOOK_ENTRIES,

  FETCH_BABYBOOK_ENTRIES_PENDING,
  FETCH_BABYBOOK_ENTRIES_FULFILLED,
  FETCH_BABYBOOK_ENTRIES_REJECTED,

  CREATE_BABYBOOK_ENTRY_PENDING,
  CREATE_BABYBOOK_ENTRY_FULFILLED,
  CREATE_BABYBOOK_ENTRY_REJECTED,

  UPDATE_BABYBOOK_ENTRY_PENDING,
  UPDATE_BABYBOOK_ENTRY_FULFILLED,
  UPDATE_BABYBOOK_ENTRY_REJECTED,

  API_CREATE_BABYBOOK_ENTRY_PENDING,
  API_CREATE_BABYBOOK_ENTRY_FULFILLED,
  API_CREATE_BABYBOOK_ENTRY_REJECTED,

  API_SYNC_BABYBOOK_ENTRIES_PENDING,
  API_SYNC_BABYBOOK_ENTRIES_FULFILLED,
  API_SYNC_BABYBOOK_ENTRIES_REJECTED,

} from './types';

import VideoFormats from '../constants/VideoFormats';
import ImageFormats from '../constants/ImageFormats';
import AudioFormats from '../constants/AudioFormats';

const db = SQLite.openDatabase('babysteps.db');

const Pending = type => {
  return { type };
};

const Response = (type, payload, formData = {}) => {
  return { type, payload, formData };
};

export const resetBabyBookEntries = () => {
  return function(dispatch) {
    dispatch(Pending(RESET_BABYBOOK_ENTRIES));
  };
};

export const fetchBabyBookEntries = () => {
  return function(dispatch) {

    dispatch(Pending(FETCH_BABYBOOK_ENTRIES_PENDING));

    return (
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM babybook_entries;', [],
          (_, response) => {dispatch(Response(FETCH_BABYBOOK_ENTRIES_FULFILLED, response)) },
          (_, error) => {dispatch(Response(FETCH_BABYBOOK_ENTRIES_REJECTED, error))}
        );
      })
    )
  };
};

const parseImageMetaData = (data, image) => {
  const newDir = FileSystem.documentDirectory + CONSTANTS.BABYBOOK_DIRECTORY;

  data.file_name = image.filename ? image.filename : image.uri.split('/').pop();

  data.uri = newDir + '/' + data.file_name;

  data.choice = null;
  if (image.choice_id) {
    data.choice_id = image.choice_id;
  }

  if (!data.title && image.title) {
    data.title = image.title;
  }

  if (image.content_type) {
    data.file_type = image.content_type;
  } else {
    const uriParts = image.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    data.file_type = {
      ...VideoFormats,
      ...ImageFormats,
    }[fileType];
  }
  return data;
};

export const createBabyBookEntry = (data, image) => {
  data = parseImageMetaData(data, image);
  return function(dispatch) {
    dispatch(Pending(CREATE_BABYBOOK_ENTRY_PENDING));

    if (!data.created_at) {
      data.created_at = new Date().toISOString();
    }

    return FileSystem.copyAsync({ from: image.uri, to: data.uri })
      .then(() => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO babybook_entries (user_id, choice_id, title, detail, cover, file_name, file_type, uri, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
            [
              data.user_id,
              data.choice_id,
              data.title,
              data.detail,
              data.cover,
              data.file_name,
              data.file_type,
              data.uri,
              data.created_at,
            ],
            (_, response) => {
              dispatch(Response(CREATE_BABYBOOK_ENTRY_FULFILLED, response, data));
            },
            (_, error) => {
              dispatch(Response(CREATE_BABYBOOK_ENTRY_REJECTED, error));
            },
          );
        });
      })
      .catch(error => {
        dispatch(Response(CREATE_BABYBOOK_ENTRY_REJECTED, error));
      });
  }; // dispatch
};

export const updateBabyBookEntry = (id, data, image = null) => {
  return function(dispatch) {
    dispatch(Pending(UPDATE_BABYBOOK_ENTRY_PENDING));

    delete data.id;

    const keys = keys(data);
    const values = values(data);
    let updateSQL = [];

    forEach(keys, key => {
      updateSQL.push(key + " = '" + data[key] + "'");
    });

    updateSQL = `UPDATE babybook_entries SET ${updateSQL.join(', ')} WHERE babybook_entries.id = ${id};`

    return db.transaction(tx => {
      tx.executeSql(
        updateSQL,
        [],
        (_, response) => {
          dispatch(Response(UPDATE_BABYBOOK_ENTRY_FULFILLED, response, data));
        },
        (_, error) => {
          dispatch(Response(UPDATE_BABYBOOK_ENTRY_REJECTED, error))
        }
      );
    })
  };
};

export const apiCreateBabyBookEntry = (session, data, image = null) => {

  const formData = new FormData();

  data = parseImageMetaData(data, image);
  data.user_id = session.user_api_id;

  // only upload files for entries not originating from answers
  if (data.file_name && !data.choice_id) {
    formData.append(`babybook_entry[attachment]`, {
      uri: data.uri,
      name: data.file_name,
      type: data.file_type,
    });
  }

  forEach(data, (value, key) => {
    const name = `babybook_entry[${key}]`;
    formData.append(name, value);
  });

  return dispatch => {
    dispatch({
      type: API_CREATE_BABYBOOK_ENTRY_PENDING,
      payload: {
        data: formData,
        session,
      },
      meta: {
        offline: {
          effect: {
            method: 'POST',
            url: '/babybooks',
            fulfilled: API_CREATE_BABYBOOK_ENTRY_FULFILLED,
            rejected: API_CREATE_BABYBOOK_ENTRY_REJECTED,
          },
        },
      },
    });
  }; // return dispatch
};

export const apiSyncBabybookEntries = (user_id) => {
  return dispatch => {
    dispatch(Pending(API_SYNC_BABYBOOK_ENTRIES_PENDING));
    const baseURL = getApiUrl();
    const fileUri = FileSystem.documentDirectory + CONSTANTS.BABYBOOK_DIRECTORY;
    const apiToken = Constants.manifest.extra.apiToken;

    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        responseType: 'json',
        baseURL,
        url: '/sync_babybook_entries',
        headers: {
          milestone_token: apiToken,
        },
        data: {
          user_id,
        },
      })
        .then(response => {
          const entries = response.data.babybook_entries;
          entries.forEach(entry => {
            entry.api_id = entry.id;
            entry.user_api_id = entry.user_id;
            entry.file_name = entry.filename;
            entry.file_type = entry.content_type;
            entry.uri = `${fileUri}/${entry.filename}`;

            FileSystem.downloadAsync(entry.url, entry.uri)
              .then(response => {
                console.log(`*** Babybook Attachment sync'd ${entry.filename}`);
              })
              .catch(error => {
                dispatch(Response(API_SYNC_BABYBOOK_ENTRIES_REJECTED, error));
              });

            delete entry.filename;
            delete entry.content_type;
            delete entry.key;
            delete entry.metadata;
            delete entry.updated_at;
            delete entry.byte_size;
            delete entry.checksum;
            delete entry.url;
          }); // forEach
          // primary key on sqlite becomes id from api
          insertRows('babybook_entries', schema.babybook_entries, entries);
          dispatch(Response(API_SYNC_BABYBOOK_ENTRIES_FULFILLED, entries));
        })
        .catch(error => {
          dispatch(Response(API_SYNC_BABYBOOK_ENTRIES_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

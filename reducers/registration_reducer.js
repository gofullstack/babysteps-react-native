import {

  FETCH_SESSION_PENDING,
  FETCH_SESSION_FULFILLED,
  FETCH_SESSION_REJECTED,

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

  API_FETCH_USER_RESPONDENT_PENDING,
  API_FETCH_USER_RESPONDENT_FULFILLED,
  API_FETCH_USER_RESPONDENT_REJECTED,

  API_CREATE_RESPONDENT_PENDING,
  API_CREATE_RESPONDENT_FULFILLED,
  API_CREATE_RESPONDENT_REJECTED,

  API_UPDATE_RESPONDENT_PENDING,
  API_UPDATE_RESPONDENT_FULFILLED,
  API_UPDATE_RESPONDENT_REJECTED,

  API_SAVE_SIGNATURE_PENDING,
  API_SAVE_SIGNATURE_FULFILLED,
  API_SAVE_SIGNATURE_REJECTED,

  FETCH_SUBJECT_PENDING,
  FETCH_SUBJECT_FULFILLED,
  FETCH_SUBJECT_REJECTED,

  RESET_SUBJECT,

  CREATE_SUBJECT_PENDING,
  CREATE_SUBJECT_FULFILLED,
  CREATE_SUBJECT_REJECTED,

  UPDATE_SUBJECT_PENDING,
  UPDATE_SUBJECT_FULFILLED,
  UPDATE_SUBJECT_REJECTED,

  API_FETCH_USER_SUBJECT_PENDING,
  API_FETCH_USER_SUBJECT_FULFILLED,
  API_FETCH_USER_SUBJECT_REJECTED,

  API_CREATE_SUBJECT_PENDING,
  API_CREATE_SUBJECT_FULFILLED,
  API_CREATE_SUBJECT_REJECTED,

  API_UPDATE_SUBJECT_PENDING,
  API_UPDATE_SUBJECT_FULFILLED,
  API_UPDATE_SUBJECT_REJECTED,

  API_SYNC_REGISTRATION_PENDING,
  API_SYNC_REGISTRATION_FULFILLED,
  API_SYNC_REGISTRATION_REJECTED,

  API_SYNC_SIGNATURE_PENDING,
  API_SYNC_SIGNATURE_FULFILLED,
  API_SYNC_SIGNATURE_REJECTED,

} from '../actions/types';

const initialState = {
  user: {
    fetching: false,
    fetched: false,
    data: { id: null },
    error: null,
  },
  apiUser: {
    fetching: false,
    fetched: false,
    error: null,
  },
  respondent: {
    fetching: false,
    fetched: false,
    data: {},
    error: null,
  },
  apiRespondent: {
    fetching: false,
    fetched: false,
    data: {},
    error: null,
  },
  apiSignature: {
    fetching: false,
    fetched: false,
    error: null,
  },
  subject: {
    fetching: false,
    fetched: false,
    data: {},
    error: null,
  },
  apiSubject: {
    fetching: false,
    fetched: false,
    data: {},
    error: null,
  },
};

const reducer = (state = initialState, action, formData = {}) => {
  switch (action.type) {
    // FETCH USER
    case FETCH_USER_PENDING: {
      return {
        ...state,
        user: {
          ...state.user,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case FETCH_USER_FULFILLED: {
      const data = action.payload.rows['_array'][0];
      return {
        ...state,
        user: {
          ...state.user,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case FETCH_USER_REJECTED: {
      return {
        ...state,
        user: {
          ...state.user,
          fetching: false,
          error: action.payload,
        },
      };
    }

    // CREATE USER
    case CREATE_USER_PENDING: {
      return {
        ...state,
        user: {
          ...state.user,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case CREATE_USER_FULFILLED: {
      return {
        ...state,
        user: {
          ...state.user,
          fetching: false,
          fetched: true,
          data: {
            ...action.formData,
            id: action.payload.insertId,
          },
        },
      };
    }
    case CREATE_USER_REJECTED: {
      return {
        ...state,
        user: {
          ...state.user,
          fetching: false,
          error: action.payload,
        },
      };
    }

    case UPDATE_USER_PENDING: {
      return {
        ...state,
        user: {
          ...state.user,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case UPDATE_USER_FULFILLED: {
      const formData = action.formData;
      const data = { ...state.user.data, ...formData };
      return {
        ...state,
        user: {
          ...state.user,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case UPDATE_USER_REJECTED: {
      return {
        ...state,
        user: {
          ...state.user,
          fetching: false,
          fetched: false,
          data: {},
          error: action.payload,
        },
      };
    }

    case API_CREATE_USER_PENDING: {
      return {
        ...state,
        apiUser: {
          ...state.apiUser,
          fetching: true,
          fetched: false,
          error: null,
        },
        user: {
          ...state.user,
          fetching: false,
          fetched: false,
          error: null,
        },
      };
    }
    case API_CREATE_USER_FULFILLED: {
      const headers = action.payload.headers;
      const accessToken = (headers['access-token']) ? headers['access-token'] : state.auth.accessToken;
      return {
        ...state,
        apiUser: {
          ...state.apiUser,
          fetching: false,
          fetched: true,
          error: null,
          data: action.formData,
        },
        auth: {
          ...state.auth,
          accessToken: accessToken,
          client: headers.client,
          uid: headers.uid,
          user_id: headers.user_id,
        },
      };
    }
    case API_CREATE_USER_REJECTED: {
      let error = 'unknown';
      if (action.payload.response) {
        error = action.payload.response.data.errors.full_messages;
      } else {
        error = action.payload.message;
      }
      return {
        ...state,
        apiUser: {
          ...state.apiUser,
          fetching: false,
          error,
        },
      };
    }

    case RESET_RESPONDENT: {
      return {
        ...state,
        respondent: {
          ...state.respondent,
          fetching: false,
          fetched: false,
          error: null,
        },
        apiRespondent: {
          ...state.apiRespondent,
          fetching: false,
          fetched: false,
          error: null,
        },
      };
    }

    // FETCH RESPONDENT
    case FETCH_RESPONDENT_PENDING: {
      return {
        ...state,
        respondent: {
          ...state.respondent,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case FETCH_RESPONDENT_FULFILLED: {
      const data = action.payload.rows['_array'][0];
      return {
        ...state,
        respondent: {
          ...state.respondent,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case FETCH_RESPONDENT_REJECTED: {
      return {
        ...state,
        respondent: {
          ...state.respondent,
          fetching: false,
          error: action.payload,
        },
      };
    }

    // CREATE RESPONDENT
    case CREATE_RESPONDENT_PENDING: {
      return {
        ...state,
        respondent: {
          ...state.respondent,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case CREATE_RESPONDENT_FULFILLED: {
      const data = action.formData;
      return {
        ...state,
        respondent: {
          ...state.respondent,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case CREATE_RESPONDENT_REJECTED: {
      return {
        ...state,
        respondent: {
          ...state.respondent,
          fetching: false,
          error: action.payload,
        },
      };
    }

    // CREATE RESPONDENT
    case UPDATE_RESPONDENT_PENDING: {
      return {
        ...state,
        respondent: {
          ...state.respondent,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case UPDATE_RESPONDENT_FULFILLED: {
      const data = Object.assign({}, state.respondent.data, action.formData);
      return {
        ...state,
        respondent: {
          ...state.respondent,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case UPDATE_RESPONDENT_REJECTED: {
      return {
        ...state,
        respondent: {
          ...state.respondent,
          fetching: false,
          error: action.payload,
        },
      };
    }


    case API_FETCH_USER_RESPONDENT_PENDING: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: true,
          fetched: false,
          error: null,
          data: {},
        },
      };
    }
    case API_FETCH_USER_RESPONDENT_FULFILLED: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: false,
          fetched: true,
          data: {},
        },
      };
    }
    case API_FETCH_USER_RESPONDENT_REJECTED: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: false,
          fetched: false,
          error: action.payload,
          data: {},
        },
      };
    }
    // API_CREATE_RESPONDENT
    case API_CREATE_RESPONDENT_PENDING: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_CREATE_RESPONDENT_FULFILLED: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: false,
          fetched: true,
          data: action.payload.data,
        },
      };
    }
    case API_CREATE_RESPONDENT_REJECTED: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    // API_UPDATE_RESPONDENT
    case API_UPDATE_RESPONDENT_PENDING: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_UPDATE_RESPONDENT_FULFILLED: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: false,
          fetched: true,
          error: null,
          data: action.payload.data,
        },
      };
    }
    case API_UPDATE_RESPONDENT_REJECTED: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    // API_SAVE_SIGNATURE
    case API_SAVE_SIGNATURE_PENDING: {
      return {
        ...state,
        apiSignature: {
          ...state.apiSignature,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_SAVE_SIGNATURE_FULFILLED: {
      return {
        ...state,
        apiSignature: {
          ...state.apiSignature,
          fetching: false,
          fetched: true,
        }
      };
    }
    case API_SAVE_SIGNATURE_REJECTED: {
      return {
        ...state,
        apiSignature: {
          ...state.apiSignature,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    // RESET SUBJECT
    case RESET_SUBJECT: {
      return {
        ...state,
        subject: {
          ...state.subject,
          fetching: false,
          fetched: false,
          error: null,
        },
        apiSubject: {
          ...state.apiSubject,
          fetching: false,
          fetched: false,
          error: null,
        },
      };
    }

    // FETCH SUBJECT
    case FETCH_SUBJECT_PENDING: {
      return {
        ...state,
        subject: {
          ...state.subject,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case FETCH_SUBJECT_FULFILLED: {
      const data = action.payload.rows['_array'][0];
      return {
        ...state,
        subject: {
          ...state.subject,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case FETCH_SUBJECT_REJECTED: {
      return {
        ...state,
        subject: {
          ...state.subject,
          fetching: false,
          error: action.payload,
        } 
      };
    }

    // CREATE SUBJECT
    case CREATE_SUBJECT_PENDING: {
      return {
        ...state,
        subject: {
          ...state.subject,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case CREATE_SUBJECT_FULFILLED: {
      return {
        ...state,
        subject: {
          ...state.subject,
          fetching: false,
          fetched: true,
          data: action.formData,
        },
      };
    }
    case CREATE_SUBJECT_REJECTED: {
      return {
        ...state,
        subject: {
          ...state.subject,
          fetching: false,
          error: action.payload,
        },
      };
    }

    // UPDATE SUBJECT
    case UPDATE_SUBJECT_PENDING: {
      return {
        ...state,
        subject: {
          ...state.subject,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case UPDATE_SUBJECT_FULFILLED: {
      const data = {...state.subject.data, ...action.formData};
      return {
        ...state,
        subject: {
          ...state.subject,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case UPDATE_SUBJECT_REJECTED: {
      return {
        ...state,
        subject: {
          ...state.subject,
          fetching: false,
          error: action.payload,
        },
      };
    }

    case API_CREATE_SUBJECT_PENDING: {
      return {
        ...state,
        apiSubject: {
          ...state.apiSubject,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_CREATE_SUBJECT_FULFILLED: {
      const data = action.payload.data;
      return {
        ...state,
        apiSubject: {
          ...state.apiSubject,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case API_CREATE_SUBJECT_REJECTED: {
      return {
        ...state,
        apiSubject: {
          ...state.apiSubject,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    // API_UPDATE_SUBJECT
    case API_UPDATE_SUBJECT_PENDING: {
      return {
        ...state,
        apiSubject: {
          ...state.apiSubject,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_UPDATE_SUBJECT_FULFILLED: {
      const data = action.payload.data;
      return {
        ...state,
        apiSubject: {
          ...state.apiSubject,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case API_UPDATE_SUBJECT_REJECTED: {
      return {
        ...state,
        apiSubject: {
          ...state.apiSubject,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    // API_UPDATE_SUBJECT
    case API_FETCH_USER_SUBJECT_PENDING: {
      return {
        ...state,
        apiSubject: {
          ...state.apiSubject,
          fetching: true,
          fetched: false,
          error: null,
          data: {},
        },
      };
    }
    case API_FETCH_USER_SUBJECT_FULFILLED: {
      const data = action.payload.data;
      return {
        ...state,
        apiSubject: {
          ...state.apiSubject,
          fetching: false,
          fetched: true,
          error: null,
          data: {},
        },
      };
    }
    case API_FETCH_USER_SUBJECT_REJECTED: {
      return {
        ...state,
        apiSubject: {
          ...state.apiSubject,
          fetching: false,
          fetched: false,
          error: action.payload,
          data: {},
        },
      };
    }

    case API_SYNC_REGISTRATION_PENDING: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_SYNC_REGISTRATION_FULFILLED: {
      const data = action.payload.data;
      let respondent = {};
      if (data.respondents) respondent = data.respondents[0];
      let subject = {};
      if (data.subjects) subject = data.subjects[0];
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: false,
          fetched: true,
          error: null,
        },
        respondent: {
          ...state.respondent,
          data: respondent,
        },
        subject: {
          ...state.subject,
          data: subject,
        },
      };
    }
    case API_SYNC_REGISTRATION_REJECTED: {
      return {
        ...state,
        apiRespondent: {
          ...state.apiRespondent,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case API_SYNC_SIGNATURE_PENDING: {
      return {
        ...state,
        apiSignature: {
          ...state.apiSignature,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_SYNC_SIGNATURE_FULFILLED: {
      return {
        ...state,
        apiSignature: {
          ...state.apiSignature,
          fetching: false,
          fetched: true,
          error: null,
        },
      };
    }
    case API_SYNC_SIGNATURE_REJECTED: {
      return {
        ...state,
        apiSignature: {
          ...state.apiSignature,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    default: {
      return state;
    }
  }
};

export default reducer;

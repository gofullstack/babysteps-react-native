import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';

import axios from 'axios';

import forEach from 'lodash/forEach';
import omit from 'lodash/omit';
import keys from 'lodash/keys';

import { getApiUrl } from '../database/common';

import CONSTANTS from '../constants';

import {
  SESSION_SYNC_MESSAGE,

  FETCH_MILESTONES_PENDING,
  FETCH_MILESTONES_FULFILLED,
  FETCH_MILESTONES_REJECTED,

  RESET_API_MILESTONES,

  API_FETCH_MILESTONES_PENDING,
  API_FETCH_MILESTONES_FULFILLED,
  API_FETCH_MILESTONES_REJECTED,

  FETCH_MILESTONE_GROUPS_PENDING,
  FETCH_MILESTONE_GROUPS_FULFILLED,
  FETCH_MILESTONE_GROUPS_REJECTED,

  RESET_MILESTONE_CALENDAR,

  FETCH_MILESTONE_CALENDAR_PENDING,
  FETCH_MILESTONE_CALENDAR_FULFILLED,
  FETCH_MILESTONE_CALENDAR_REJECTED,

  UPDATE_MILESTONE_CALENDAR_FULFILLED,

  RESET_API_MILESTONE_CALENDAR,

  API_NEW_MILESTONE_CALENDAR_PENDING,
  API_NEW_MILESTONE_CALENDAR_FULFILLED,
  API_NEW_MILESTONE_CALENDAR_REJECTED,

  API_FETCH_MILESTONE_CALENDAR_PENDING,
  API_FETCH_MILESTONE_CALENDAR_FULFILLED,
  API_FETCH_MILESTONE_CALENDAR_REJECTED,

  API_CREATE_MILESTONE_CALENDAR_PENDING,
  API_CREATE_MILESTONE_CALENDAR_FULFILLED,
  API_CREATE_MILESTONE_CALENDAR_REJECTED,

  API_UPDATE_MILESTONE_CALENDAR_PENDING,
  API_UPDATE_MILESTONE_CALENDAR_FULFILLED,
  API_UPDATE_MILESTONE_CALENDAR_REJECTED,

  FETCH_MILESTONE_TASKS_PENDING,
  FETCH_MILESTONE_TASKS_FULFILLED,
  FETCH_MILESTONE_TASKS_REJECTED,

  FETCH_MILESTONE_SECTIONS_PENDING,
  FETCH_MILESTONE_SECTIONS_FULFILLED,
  FETCH_MILESTONE_SECTIONS_REJECTED,

  RESET_MILESTONE_QUESTIONS,

  FETCH_MILESTONE_QUESTIONS_PENDING,
  FETCH_MILESTONE_QUESTIONS_FULFILLED,
  FETCH_MILESTONE_QUESTIONS_REJECTED,

  RESET_MILESTONE_CHOICES,

  FETCH_MILESTONE_CHOICES_PENDING,
  FETCH_MILESTONE_CHOICES_FULFILLED,
  FETCH_MILESTONE_CHOICES_REJECTED,

  RESET_MILESTONE_ANSWERS,

  FETCH_MILESTONE_ANSWERS_PENDING,
  FETCH_MILESTONE_ANSWERS_FULFILLED,
  FETCH_MILESTONE_ANSWERS_REJECTED,

  CREATE_MILESTONE_ANSWER_PENDING,
  CREATE_MILESTONE_ANSWER_FULFILLED,
  CREATE_MILESTONE_ANSWER_REJECTED,

  UPDATE_MILESTONE_ANSWER_FULFILLED,
  UPDATE_MILESTONE_ANSWERS_FULFILLED,

  API_CREATE_MILESTONE_ANSWER_PENDING,
  API_CREATE_MILESTONE_ANSWER_FULFILLED,
  API_CREATE_MILESTONE_ANSWER_REJECTED,

  API_UPDATE_MILESTONE_ANSWERS_PENDING,
  API_UPDATE_MILESTONE_ANSWERS_FULFILLED,
  API_UPDATE_MILESTONE_ANSWERS_REJECTED,

  API_SYNC_MILESTONE_ANSWERS_PENDING,
  API_SYNC_MILESTONE_ANSWERS_FULFILLED,
  API_SYNC_MILESTONE_ANSWERS_REJECTED,

  DELETE_MILESTONE_ANSWER_FULFILLED,

  RESET_MILESTONE_ATTACHMENTS,

  FETCH_MILESTONE_ATTACHMENTS_PENDING,
  FETCH_MILESTONE_ATTACHMENTS_FULFILLED,
  FETCH_MILESTONE_ATTACHMENTS_REJECTED,

  CREATE_MILESTONE_ATTACHMENT_PENDING,
  CREATE_MILESTONE_ATTACHMENT_FULFILLED,
  CREATE_MILESTONE_ATTACHMENT_REJECTED,

  UPDATE_MILESTONE_ATTACHMENT_FULFILLED,

  DELETE_MILESTONE_ATTACHMENT_FULFILLED,

  API_FETCH_ANSWER_ATTACHMENTS_PENDING,
  API_FETCH_ANSWER_ATTACHMENTS_FULFILLED,
  API_FETCH_ANSWER_ATTACHMENTS_REJECTED,

  FETCH_OVERVIEW_TIMELINE_PENDING,
  FETCH_OVERVIEW_TIMELINE_FULFILLED,
  FETCH_OVERVIEW_TIMELINE_REJECTED,

} from './types';

const db = SQLite.openDatabase('babysteps.db');

const Pending = type => {
  return { type };
};

const Response = (type, payload, formData = {}) => {
  return { type, payload, formData };
};

const getUpdateSQL = data => {
  const allKeys = keys(data);
  const updateSQL = [];

  forEach(allKeys, key => {
    if (_.isInteger(data[key])) {
      updateSQL.push(`${key} = ${data[key]}`);
    } else {
      updateSQL.push(`${key} = '${data[key]}'`);
    }
  });
  return updateSQL;
};

export const fetchMilestones = () => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONES_PENDING));

    return db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM milestones;', [],
        (_, response) => { dispatch( Response(FETCH_MILESTONES_FULFILLED, response)) },
        (_, error) => { dispatch( Response(FETCH_MILESTONES_REJECTED, error)) }
      );
    });
  };
};

export const resetApiMilestones = () => {
  return dispatch => {
    dispatch(Pending(RESET_API_MILESTONES));
  };
};

// this fetches all milestone and related tables
export const apiFetchMilestones = () => {
  return dispatch => {
    dispatch(Pending(API_FETCH_MILESTONES_PENDING));
    const baseURL = getApiUrl();
    const url = '/milestones';
    const apiToken = Constants.manifest.extra.apiToken;
    const headers = { milestone_token: apiToken };
    const study_id = CONSTANTS.STUDY_ID;

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
          dispatch(Response(API_FETCH_MILESTONES_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_FETCH_MILESTONES_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const fetchMilestoneGroups = () => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_GROUPS_PENDING));
    return db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM milestone_groups;',
        [],
        (_, response) => {
          dispatch(Response(FETCH_MILESTONE_GROUPS_FULFILLED, response));
        },
        (_, error) => {
          dispatch(Response(FETCH_MILESTONE_GROUPS_REJECTED, error));
        },
      );
    });
  };
};

export const resetMilestoneCalendar = () => {
  return dispatch => {
    dispatch(Pending(RESET_MILESTONE_CALENDAR));
  };
};

export const fetchMilestoneCalendar = (pregnancy_period = null) => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_CALENDAR_PENDING));
    let sql = 'SELECT * FROM milestone_triggers ';
    // sql += 'WHERE momentary_assessment = 0 ';
    if (pregnancy_period) {
      sql += `WHERE pregnancy_period = '${pregnancy_period}' `;
    }
    sql += 'ORDER BY milestone_triggers.notify_at;';
    return db.transaction(tx => {
      tx.executeSql(
        sql,
        [],
        (_, response) => {
          dispatch(Response(FETCH_MILESTONE_CALENDAR_FULFILLED, response));
        },
        (_, error) => {
          dispatch(Response(FETCH_MILESTONE_CALENDAR_REJECTED, error));
        },
      );
    });
  };
};

export const updateMilestoneCalendar = (task_id, entry) => {
  const response = { task_id, entry };
  return dispatch => {
    dispatch(Response(UPDATE_MILESTONE_CALENDAR_FULFILLED, response));
  };
};

export const resetApiMilestoneCalendar = () => {
  return dispatch => {
    dispatch(Pending(RESET_API_MILESTONE_CALENDAR));
  };
};

export const apiNewMilestoneCalendar = params => {
  return dispatch => {
    dispatch(Pending(API_NEW_MILESTONE_CALENDAR_PENDING));

    if (CONSTANTS.COMPRESS_MILESTONE_CALENDAR) {
      params.testing = 'true';
    }

    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        responseType: 'json',
        baseURL,
        url: '/milestone_calendars/new',
        params,
        headers: { milestone_token: apiToken },
      })
        .then(response => {
          dispatch(Response(API_NEW_MILESTONE_CALENDAR_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_NEW_MILESTONE_CALENDAR_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const apiFetchMilestoneCalendar = params => {
  return dispatch => {
    dispatch(Pending(API_FETCH_MILESTONE_CALENDAR_PENDING));

    if (CONSTANTS.COMPRESS_MILESTONE_CALENDAR) {
      params.testing = 'true';
    }

    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;
    const headers = { milestone_token: apiToken };
    const url = '/milestone_calendars';

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        responseType: 'json',
        baseURL,
        url,
        headers,
        params,
      })
        .then(response => {
          dispatch(Response(API_FETCH_MILESTONE_CALENDAR_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_FETCH_MILESTONE_CALENDAR_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const apiCreateMilestoneCalendar = data => {
  return dispatch => {
    dispatch(Pending(API_CREATE_MILESTONE_CALENDAR_PENDING));
    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;
    const headers = { milestone_token: apiToken };
    const url = '/milestone_calendars';

    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        responseType: 'json',
        baseURL,
        url,
        headers,
        data,
      })
        .then(response => {
          dispatch(Response(API_CREATE_MILESTONE_CALENDAR_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_CREATE_MILESTONE_CALENDAR_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const apiUpdateMilestoneCalendar = (id, data) => {
  return dispatch => {
    dispatch(Pending(API_UPDATE_MILESTONE_CALENDAR_PENDING));
    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;
    const headers = { milestone_token: apiToken };
    const url = `/milestone_calendars/${id}`;

    return new Promise((resolve, reject) => {
      axios({
        method: 'put',
        responseType: 'json',
        baseURL,
        url,
        headers,
        data,
      })
        .then(response => {
          dispatch(Response(API_UPDATE_MILESTONE_CALENDAR_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_UPDATE_MILESTONE_CALENDAR_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const fetchMilestoneTasks = () => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_TASKS_PENDING));
    const sql = 'SELECT * FROM tasks';

    return db.transaction(tx => {
      tx.executeSql(
        sql,
        [],
        (_, response) => {
          dispatch(Response(FETCH_MILESTONE_TASKS_FULFILLED, response));
        },
        (_, error) => {
          dispatch(Response(FETCH_MILESTONE_TASKS_REJECTED, error));
        },
      );
    });
  };
};

export const fetchMilestoneSections = (params = {}) => {
  return dispatch => {
    dispatch( Pending(FETCH_MILESTONE_SECTIONS_PENDING) );
    var sql = 'SELECT * FROM sections';
    if (params.task_id) {
      sql += ` WHERE sections.task_id = ${params.task_id}`;
    }
    sql += ' ORDER BY sections.position;';

    return (
      db.transaction(tx => {
        tx.executeSql(
          sql, [],
          (_, response) => {dispatch(Response(FETCH_MILESTONE_SECTIONS_FULFILLED, response))},
          (_, error) => { dispatch( Response(FETCH_MILESTONE_SECTIONS_REJECTED, error))}
        );
      })
    );
  };
};

export const resetMilestoneQuestions = () => {
  return function (dispatch) {
     dispatch(Pending(RESET_MILESTONE_QUESTIONS));
  }
}

export const fetchMilestoneQuestions = (params = {}) => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_QUESTIONS_PENDING));
    const sql = `SELECT * FROM questions ORDER BY section_id, position;`;
    //    ops.input_type, \
    //    ops.rn_input_type, \
    //    ta.attachment_url, \
    //    ta.content_type \
    //  FROM questions AS qs \
    //  INNER JOIN option_groups AS ops ON qs.option_group_id = ops.id \
    //  INNER JOIN sections AS ss ON qs.section_id = ss.id \
    //  LEFT JOIN task_attachments AS ta ON ss.task_id = ta.task_id \
    //  WHERE ss.id = '${params['section_id']}' \
    //  ORDER BY qs.position;`;

    return (
      db.transaction(tx => {
        tx.executeSql(
          sql, [],
          (_, response) => {dispatch(Response(FETCH_MILESTONE_QUESTIONS_FULFILLED, response))},
          (_, error) => {dispatch(Response(FETCH_MILESTONE_QUESTIONS_REJECTED, error))}
        );
      })
    );
  };
};

export const resetMilestoneChoices = () => {
  return dispatch => {
    dispatch(Pending(RESET_MILESTONE_CHOICES));
  };
};

export const fetchMilestoneChoices = () => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_CHOICES_PENDING));

    const sql = 'SELECT * FROM choices ORDER BY question_id, position';

    //let question_ids = null;

    //if (params.question_ids) {
    //  question_ids = `( ${params.question_ids.join(', ')} )`;
    //}

    //let sql = 'SELECT cs.*, og.rn_input_type FROM choices AS cs';
    //sql += ' LEFT JOIN option_groups AS og ON og.id = cs.option_group_id';
    //if (question_ids) {
    //  sql += ` WHERE cs.question_id IN ${question_ids}`;
    //}
    //sql += ' ORDER BY cs.question_id, cs.position;';

    return db.transaction(tx => {
      tx.executeSql(
        sql,
        [],
        (_, response) => {dispatch(Response(FETCH_MILESTONE_CHOICES_FULFILLED, response))},
        (_, error) => {dispatch(Response(FETCH_MILESTONE_CHOICES_REJECTED, error))}
      );
    });
  };
};

export const resetMilestoneAnswers = () => {
  return dispatch => {
    dispatch(Pending(RESET_MILESTONE_ANSWERS));
  };
};

export const fetchMilestoneAnswers = (params = {}) => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_ANSWERS_PENDING));

    let sql = 'SELECT * FROM answers';

    if (params.section_id) {
      sql += ` WHERE answers.section_id = ${params.section_id}`;
    } else if (params.api_id === 'empty') {
      sql += ` WHERE COALESCE(answers.api_id, '') = ''`;
    } else if (params.api_id) {
      sql += ` WHERE answers.api_id = ${params.api_id}`;
    }
    sql += ' ORDER BY section_id, question_id, choice_id;';

    return db.transaction(tx => {
      tx.executeSql(
        sql,
        [],
        (_, response) => {
          dispatch(Response(FETCH_MILESTONE_ANSWERS_FULFILLED, response));
        },
        (_, error) => {
          dispatch(Response(FETCH_MILESTONE_ANSWERS_REJECTED, error));
        },
      );
    });

  };
};


export const createMilestoneAnswer = answer => {
  return dispatch => {
    dispatch(Response(CREATE_MILESTONE_ANSWER_FULFILLED, answer));
  }; // dispatch
};

export const updateMilestoneAnswer = (choice_id, data) => {
  return dispatch => {
   dispatch( Response(UPDATE_MILESTONE_ANSWER_FULFILLED, {choice_id, data}))
  };
};

export const updateMilestoneAnswers = answers => {
  return dispatch => {
   dispatch( Response(UPDATE_MILESTONE_ANSWERS_FULFILLED, answers))
  };
};

export const apiCreateMilestoneAnswer = (session, data) => {
  const formData = new FormData();
  let answer = omit(data, [
    'api_id',
    'user_api_id',
    'respondent_api_id',
    'subject_api_id',
    'attachments',
  ]);
  if (data.api_id) {
    answer.id = data.api_id;
  }
  answer = {
    ...answer,
    user_id: data.user_api_id,
    respondent_id: data.respondent_api_id,
    subject_id: data.subject_api_id,
  };
  forEach(answer, (value, key) => {
    const name = `answer[${key}]`;
    formData.append(name, value);
  });
  if (data.attachments) {
    forEach(data.attachments, (att, index) => {
      formData.append(`answer[attachments][]`, {
        uri: att.uri,
        name: att.filename,
        type: att.content_type,
      });
    });
  }

  return dispatch => {
    dispatch({
      type: API_CREATE_MILESTONE_ANSWER_PENDING,
      payload: {
        data: formData,
        session,
        multipart: true,
      },
      meta: {
        offline: {
          effect: {
            method: 'POST',
            url: '/answers',
            fulfilled: API_CREATE_MILESTONE_ANSWER_FULFILLED,
            rejected: API_CREATE_MILESTONE_ANSWER_REJECTED,
          },
        },
      },
    });
  }; // return dispatch
};

export const apiUpdateMilestoneAnswers = (session, data) => {
  // can not submit attachments on bulk update
  const answers = [];
  forEach(data, row => {
    const answer = omit(row, [
      'id',
      'api_id',
      'user_api_id',
      'respondent_api_id',
      'subject_api_id',
      'attachments',
    ]);
    if (row.api_id) {
      answer.id = row.api_id;
    }
    answers.push({
      ...answer,
      user_id: row.user_api_id,
      respondent_id: row.respondent_api_id,
      subject_id: row.subject_api_id,
    });
  });

  return dispatch => {
    const apiToken = Constants.manifest.extra.apiToken;
    const headers = { milestone_token: apiToken };
    dispatch({
      type: API_UPDATE_MILESTONE_ANSWERS_PENDING,
      payload: {
        data: { answers },
        session,
      },
      meta: {
        offline: {
          effect: {
            method: 'POST',
            url: '/answers/bulk_upload',
            headers,
            fulfilled: API_UPDATE_MILESTONE_ANSWERS_FULFILLED,
            rejected: API_UPDATE_MILESTONE_ANSWERS_REJECTED,
          },
        },
      },
    });
  }; // return dispatch
};

export const apiSyncMilestoneAnswers = user_id => {
  return dispatch => {
    dispatch(Pending(API_SYNC_MILESTONE_ANSWERS_PENDING));
    const baseURL = getApiUrl();
    const apiToken = Constants.manifest.extra.apiToken;
    const fileUri = FileSystem.documentDirectory + CONSTANTS.ATTACHMENTS_DIRECTORY;
    const headers = { milestone_token: apiToken };

    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        responseType: 'json',
        baseURL,
        url: '/sync_answers',
        headers,
        data: {
          user_id,
        },
      })
        .then(response => {
          const answers = response.data.answers;
          answers.forEach(answer => {
            answer.api_id = answer.id;
            answer.respondent_api_id = answer.respondent_id;
            answer.subject_api_id = answer.subject_id;
            answer.user_api_id = answer.user_id;
          });
          // primary key on sqlite becomes id from api

          const attachments = response.data.attachments;

          attachments.forEach(attachment => {
            attachment.api_id = attachment.id;
            attachment.uri = `${fileUri}/${attachment.filename}`;
            FileSystem.downloadAsync(attachment.url, attachment.uri)
              .then(response => {
                console.log(`*** Answer Attachment sync'd ${attachment.filename}`);
              })
              .catch(error => {
                dispatch(Response(API_SYNC_MILESTONE_ANSWERS_REJECTED, error));
              });
          });
          dispatch(Response(API_SYNC_MILESTONE_ANSWERS_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_SYNC_MILESTONE_ANSWERS_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const deleteMilestoneAnswer = choice_id => {
  return dispatch => {
    dispatch(Response(DELETE_MILESTONE_ANSWER_FULFILLED, { choice_id }));
  };
};

export const resetMilestoneAttachments = () => {
  return dispatch => {
    dispatch(Pending(RESET_MILESTONE_ATTACHMENTS));
  };
};

export const fetchMilestoneAttachments = (params = {}) => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_ATTACHMENTS_PENDING));

    let sql = 'SELECT * FROM attachments';
    if (params.section_id) {
      sql += ` WHERE attachments.section_id = ${params.section_id}`;
    }
    sql += ' ORDER BY choice_id;';

    return db.transaction(tx => {
      tx.executeSql(
        sql,
        [],
        (_, response) => {
          dispatch(Response(FETCH_MILESTONE_ATTACHMENTS_FULFILLED, response));
        },
        (_, error) => {
          dispatch(Response(FETCH_MILESTONE_ATTACHMENTS_REJECTED, error));
        },
      );
    });
  };
};

export const createMilestoneAttachment = attachment => {
  return dispatch => {
    dispatch(Response(CREATE_MILESTONE_ATTACHMENT_FULFILLED, attachment));
  };
};

export const updateMilestoneAttachment = attachment => {
  return dispatch => {
    dispatch(Response(UPDATE_MILESTONE_ATTACHMENT_FULFILLED, attachment));
  };
};

export const deleteMilestoneAttachment = choice_id => {
  return dispatch => {
    dispatch(Response(DELETE_MILESTONE_ATTACHMENT_FULFILLED, { choice_id }));
  };
};

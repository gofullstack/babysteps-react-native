import { SQLite } from 'expo';
import axios from 'axios';
import url from 'url';

import map from 'lodash/map';
import forEach from 'lodash/forEach';
import omit from 'lodash/omit';
import keys from 'lodash/keys';

import { insertRows } from '../database/common';
import { setNotifications } from '../notifications';
import schema from '../database/milestones_schema.json';
import trigger_schema from '../database/milestone_triggers_schema.json';

import CONSTANTS from '../constants';

import {

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

  FETCH_MILESTONE_CALENDAR_PENDING,
  FETCH_MILESTONE_CALENDAR_FULFILLED,
  FETCH_MILESTONE_CALENDAR_REJECTED,

  UPDATE_MILESTONE_CALENDAR_PENDING,
  UPDATE_MILESTONE_CALENDAR_FULFILLED,
  UPDATE_MILESTONE_CALENDAR_REJECTED,

  RESET_API_MILESTONE_CALENDAR,

  API_CREATE_MILESTONE_CALENDAR_PENDING,
  API_CREATE_MILESTONE_CALENDAR_FULFILLED,
  API_CREATE_MILESTONE_CALENDAR_REJECTED,

  API_FETCH_MILESTONE_CALENDAR_PENDING,
  API_FETCH_MILESTONE_CALENDAR_FULFILLED,
  API_FETCH_MILESTONE_CALENDAR_REJECTED,

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

  UPDATE_MILESTONE_ANSWERS_PENDING,
  UPDATE_MILESTONE_ANSWERS_FULFILLED,
  UPDATE_MILESTONE_ANSWERS_REJECTED,

  API_CREATE_MILESTONE_ANSWER_PENDING,
  API_CREATE_MILESTONE_ANSWER_FULFILLED,
  API_CREATE_MILESTONE_ANSWER_REJECTED,

  API_UPDATE_MILESTONE_ANSWERS_PENDING,
  API_UPDATE_MILESTONE_ANSWERS_FULFILLED,
  API_UPDATE_MILESTONE_ANSWERS_REJECTED,

  FETCH_MILESTONE_ATTACHMENTS_PENDING,
  FETCH_MILESTONE_ATTACHMENTS_FULFILLED,
  FETCH_MILESTONE_ATTACHMENTS_REJECTED,

  CREATE_MILESTONE_ATTACHMENT_PENDING,
  CREATE_MILESTONE_ATTACHMENT_FULFILLED,
  CREATE_MILESTONE_ATTACHMENT_REJECTED,

  UPDATE_MILESTONE_ATTACHMENT_PENDING,
  UPDATE_MILESTONE_ATTACHMENT_FULFILLED,
  UPDATE_MILESTONE_ATTACHMENT_REJECTED,

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
    return (
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM milestones;', [],
          (_, response) => { dispatch( Response(FETCH_MILESTONES_FULFILLED, response))},
          (_, error) => {dispatch( Response(FETCH_MILESTONES_REJECTED, error))}
        );
      })
    );
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
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        responseType: 'json',
        baseURL: CONSTANTS.BASE_URL,
        url: '/milestones',
        headers: {
          "milestone_token": CONSTANTS.MILESTONE_TOKEN,
        }
      })
      .then( response => {
        Object.keys(response.data).map( name => {
          insertRows(name, schema[name], response.data[name])
        })
        dispatch(Response(API_FETCH_MILESTONES_FULFILLED, response))
      })
      .catch(error => {
         dispatch(Response(API_FETCH_MILESTONES_REJECTED, error))
      });
    }); // return Promise

  }; // return dispatch
};

export const fetchMilestoneGroups = () => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_GROUPS_PENDING));
    return (
      db.transaction(tx => {
        tx.executeSql( 
          'SELECT * FROM milestone_groups;', [],
          (_, response) => {dispatch(Response(FETCH_MILESTONE_GROUPS_FULFILLED, response))},
          (_, error) => {dispatch(Response(FETCH_MILESTONE_GROUPS_REJECTED, error))}
        );
      })
    )
  };
};

export const fetchMilestoneCalendar = () => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_CALENDAR_PENDING));
    return (
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM milestone_triggers ORDER BY milestone_triggers.notify_at;', [],
          (_, response) => {dispatch(Response(FETCH_MILESTONE_CALENDAR_FULFILLED, response))},
          (_, error) => {dispatch(Response(FETCH_MILESTONE_CALENDAR_REJECTED, error))}
        );
      })
    )
  };

};

export const updateMilestoneCalendar = (task_id) => {
  return dispatch => {
    dispatch(Pending(UPDATE_MILESTONE_CALENDAR_PENDING));
    const completed_at = new Date().toISOString();
    const sql = 'UPDATE milestone_triggers SET completed_at = ? WHERE task_id = ?;';
    return (
      db.transaction(tx => {
        tx.executeSql(
          sql, [completed_at, task_id],
          (_, response) => { 
            dispatch( Response(UPDATE_MILESTONE_CALENDAR_FULFILLED, response) );
          },
          (_, error) => { 
            dispatch( Response(UPDATE_MILESTONE_CALENDAR_REJECTED, error) ) 
          }
        );
      })
    );
  };
};

export const resetApiMilestoneCalendar = () => {
  return dispatch => {
    dispatch(Pending(RESET_API_MILESTONE_CALENDAR));
  };
};

export const apiCreateMilestoneCalendar = params => {
  return dispatch => {
    dispatch(Pending(API_CREATE_MILESTONE_CALENDAR_PENDING));

    if (CONSTANTS.COMPRESS_MILESTONE_CALENDAR) {
      params.testing = 'true';
    }

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        responseType: 'json',
        baseURL: CONSTANTS.BASE_URL,
        url: '/milestone_calendars/new',
        params,
        headers: { milestone_token: CONSTANTS.MILESTONE_TOKEN },
      })
        .then(response => {
          insertRows('milestone_triggers', trigger_schema.milestone_triggers, response.data);
          dispatch(Response(API_CREATE_MILESTONE_CALENDAR_FULFILLED, response));
        })
        .catch(error => {
          dispatch(Response(API_CREATE_MILESTONE_CALENDAR_REJECTED, error));
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

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        responseType: 'json',
        baseURL: CONSTANTS.BASE_URL,
        url: '/milestone_calendars',
        params,
        headers: { milestone_token: CONSTANTS.MILESTONE_TOKEN },
      })
        .then(response => {
          insertRows('milestone_triggers', trigger_schema.milestone_triggers, response.data);
          dispatch(Response(API_FETCH_MILESTONE_CALENDAR_FULFILLED, response));
          setNotifications(response.data);
        })
        .catch(error => {
          dispatch(Response(API_FETCH_MILESTONE_CALENDAR_REJECTED, error));
        });
    }); // return Promise
  }; // return dispatch
};

export const apiUpdateMilestoneCalendar = (id, data) => {
  return dispatch => {
    dispatch(Pending(API_UPDATE_MILESTONE_CALENDAR_PENDING));

    return new Promise((resolve, reject) => {
      axios({
        method: 'put',
        responseType: 'json',
        baseURL: CONSTANTS.BASE_URL,
        url: `/milestone_calendars/${id}`,
        data,
        headers: { milestone_token: CONSTANTS.MILESTONE_TOKEN },
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
    let sql = 'SELECT ts.*, mg.position AS milestone_group_position, mg.visible AS milestone_group_visible, ms.milestone_group_id, ms.position AS milestone_position, ms.always_visible AS milestone_always_visible, ms.title AS milestone_title, ms.momentary_assessment AS momentary_assessment, ms.response_scale AS response_scale, ta.attachment_url as attachment_url, ta.content_type as attachment_content_type FROM tasks AS ts';
    sql += ' INNER JOIN milestones AS ms ON ms.id = ts.milestone_id';
    sql += ' INNER JOIN milestone_groups AS mg ON mg.id = ms.milestone_group_id';
    sql += ' LEFT JOIN task_attachments AS ta ON ts.id = ta.task_id';
    sql += ' ORDER BY milestone_group_position, milestone_position, position;';

    return (
      db.transaction(tx => {
        tx.executeSql(
          sql, [],
          (_, response) => {dispatch(Response(FETCH_MILESTONE_TASKS_FULFILLED, response))},
          (_, error) => {dispatch(Response(FETCH_MILESTONE_TASKS_REJECTED, error))}
        );
      })
    );
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
    var sql = 'SELECT qs.*, ops.input_type, ops.rn_input_type, ta.attachment_url, ta.content_type FROM questions AS qs';
    sql += ' INNER JOIN option_groups AS ops ON qs.option_group_id = ops.id';
    sql += ' INNER JOIN sections AS ss ON qs.section_id = ss.id';
    sql += ' LEFT JOIN task_attachments AS ta ON ss.task_id = ta.task_id';
    sql += ' WHERE ss.id = ' + params['section_id'];
    sql += ' ORDER BY qs.position;';

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

export const fetchMilestoneChoices = (params = {}) => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_CHOICES_PENDING));

    const question_ids = `( ${params.question_ids.join(', ')} )`;

    let sql = 'SELECT * FROM choices';
    if (question_ids) {
      sql += ` WHERE question_id IN ${question_ids}`;
    }
    sql += ' ORDER BY question_id, position;';

    return (
      db.transaction(tx => {
        tx.executeSql(
          sql, [],
          (_, response) => {dispatch(Response(FETCH_MILESTONE_CHOICES_FULFILLED, response))},
          (_, error) => {dispatch(Response(FETCH_MILESTONE_CHOICES_REJECTED, error))}
        );
      })
    );
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
    }
    sql += ' ORDER BY question_id, choice_id;';

    return (
      db.transaction(tx => {
        tx.executeSql(
          sql, [],
          (_, response) => {dispatch(Response(FETCH_MILESTONE_ANSWERS_FULFILLED, response))},
          (_, error) => {dispatch(Response(FETCH_MILESTONE_ANSWERS_REJECTED, error))}
        );
      })
    );
  };
};

const answerFields = [
  'api_id',
  'user_id',
  'user_api_id',
  'respondent_id',
  'respondent_api_id',
  'subject_id',
  'subject_api_id',
  'milestone_id',
  'task_id',
  'section_id',
  'question_id',
  'choice_id',
  'answer_numeric',
  'answer_boolean',
  'answer_text',
  'score',
];

const attachmentFields = [
  'api_id',
  'section_id',
  'choice_id',
  'answer_id',
  'filename',
  'width',
  'height',
  'content_type',
  'uri',
  'url',
];

parseFields = (object, fields) => {
  delete object.id;
  let row = [];
  map(fields, field => {
    if (object[field] === undefined || object[field] === null) {
      row.push('null');
    } else if (field === 'answer_text') {
      row.push(`'${object[field]}'`);
    } else if (field === 'answer_numeric') {
      row.push(object[field]);
    } else if (field === 'answer_boolean') {
      if (object[field] === true) {
        row.push(1);
      } else {
        row.push(0);
      }
    } else if (typeof object[field] === 'string') {
      row.push(`'${object[field]}'`);
    } else {
      row.push(object[field]);
    }
  });
  return row.join(', ');
};

export const createMilestoneAnswer = answer => {
  return dispatch => {
    dispatch(Pending(CREATE_MILESTONE_ANSWER_PENDING));
    const values = this.parseFields(answer, answerFields);
    const sql =`INSERT INTO answers ( ${answerFields.join(', ')} ) VALUES (${values});`;

    return (
      db.transaction(tx => {
        tx.executeSql(
          sql, [],
          (_, response) => dispatch(Response(CREATE_MILESTONE_ANSWER_FULFILLED, response)),
          (_, error) => dispatch(Response(CREATE_MILESTONE_ANSWER_REJECTED, error))
        );
      }) // transaction
    ) // return
  }; // dispatch
};

export const updateMilestoneAnswers = (section, answers) => {
  return dispatch => {
    dispatch(Pending(UPDATE_MILESTONE_ANSWERS_PENDING));

    const values = [];
    let row = '';
    map(answers, answer => {
      row = this.parseFields(answer, answerFields);
      values.push(`( ${row} )`);
    });

    const sql = `INSERT INTO answers ( ${answerFields.join(', ')} ) VALUES ${values.join(', ')};`;

    return (
      db.transaction(tx => {
        tx.executeSql( 'DELETE FROM answers WHERE section_id = ?', [section.id], 
          (_, rows) => console.log('** Clear answers table for section ' + section.title ), 
          (_, error) => console.log('*** Error in clearing answers table for section ' + section.title )
        );
        tx.executeSql( 
          sql, [],
          (_, response) => { dispatch( Response(UPDATE_MILESTONE_ANSWERS_FULFILLED, response, answers) ) },
          (_, error) => { dispatch( Response(UPDATE_MILESTONE_ANSWERS_REJECTED, error) ) }
        );
      })
    );
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
      formData.append(`answer[attachments][${index}]`, {
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

export const apiUpdateMilestoneAnswers = (session, section_id, data) => {
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
    dispatch({
      type: API_UPDATE_MILESTONE_ANSWERS_PENDING,
      payload: {
        data: { answers },
        session,
      },
      meta: {
        offline: {
          effect: {
            method: 'PUT',
            url: '/answers/bulk_update/' + section_id,
            fulfilled: API_UPDATE_MILESTONE_ANSWERS_FULFILLED,
            rejected: API_UPDATE_MILESTONE_ANSWERS_REJECTED,
          },
        },
      },
    });
  }; // return dispatch
};

export const fetchMilestoneAttachments = (params = {}) => {
  return dispatch => {
    dispatch(Pending(FETCH_MILESTONE_ATTACHMENTS_PENDING));

    let sql = 'SELECT * FROM attachments';
    if (params.section_id) {
      sql += ` WHERE attachments.section_id = ${params.section_id}`;
    }
    sql += ' ORDER BY choice_id;';

    return (
      db.transaction(tx => {
        tx.executeSql(
          sql, [],
          (_, response) => {dispatch(Response(FETCH_MILESTONE_ATTACHMENTS_FULFILLED, response))},
          (_, error) => {dispatch(Response(FETCH_MILESTONE_ATTACHMENTS_REJECTED, error))}
        );
      })
    );
  };
};

export const createMilestoneAttachment = attachment => {
  return dispatch => {
    dispatch(Pending(CREATE_MILESTONE_ATTACHMENT_PENDING));

    const values = this.parseFields(attachment, attachmentFields);
    const sql =`INSERT INTO attachments ( ${attachmentFields.join(', ')} ) VALUES (${values});`;

    return (
      db.transaction(tx => {
        tx.executeSql(
          sql, [],
          (_, response) => dispatch(Response(CREATE_MILESTONE_ATTACHMENT_FULFILLED, response)),
          (_, error) => dispatch(Response(CREATE_MILESTONE_ATTACHMENT_REJECTED, error))
        );
      }) // transaction
    ) // return
  }; // dispatch
};

export const updateMilestoneAttachment = attachment => {
  return dispatch => {
    dispatch(Pending(UPDATE_MILESTONE_ATTACHMENT_PENDING));

    const choice_id = attachment.choice_id;
    const values = this.parseFields(attachment, attachmentFields);
    const sql = `INSERT INTO attachments ( ${attachmentFields.join(', ')} ) VALUES (${values});`;

    return (
      db.transaction(tx => {
         tx.executeSql( 'DELETE FROM attachments WHERE choice_id = ?', [choice_id],
          (_, response) => console.log('** Clear attachments table for choice ' + choice_id),
          (_, error) => console.log('*** Error in clearing attachments table for choice ' + choice_id)
        );
        tx.executeSql(
          sql, [],
          (_, response) => dispatch(Response(UPDATE_MILESTONE_ATTACHMENT_FULFILLED, response)),
          (_, error) => dispatch(Response(UPDATE_MILESTONE_ATTACHMENT_REJECTED, error))
        );
      }) // transaction
    ) // return
  }; // dispatch
};

export const fetchOverViewTimeline = () => {
  return dispatch => {
    dispatch(Pending(FETCH_OVERVIEW_TIMELINE_PENDING));

    let sql =
      'SELECT DISTINCT \
        ss.task_id AS task_id, \
        ss.title AS title, \
        mts.id AS milestone_trigger_id, \
        cs.id AS choice_id, \
        ans.id AS answer_id, \
        cs.overview_timeline AS overview_timeline, \
        mts.notify_at AS notify_at, \
        mts.available_start_at, \
        mts.available_end_at, \
        ats.id AS attachment_id, \
        ats.filename AS filename, \
        ats.content_type AS content_type, \
        ats.uri AS uri, \
        ats.url AS url \
      FROM choices AS cs';
    sql += ' INNER JOIN questions AS qs ON qs.id = cs.question_id';
    sql += ' INNER JOIN sections AS ss ON ss.id = qs.section_id';
    sql += ' INNER JOIN milestone_triggers AS mts ON ss.task_id = mts.task_id';
    sql += ' LEFT JOIN answers AS ans ON ans.choice_id = cs.id';
    sql += ' LEFT JOIN attachments AS ats ON ans.choice_id = ats.choice_id';
    sql += " WHERE cs.overview_timeline IN ('during_pregnancy', 'birth', 'post_birth')";
    sql += ' ORDER BY mts.notify_at;';

    return db.transaction(tx => {
      tx.executeSql(
        sql,
        [],
        (_, response) => {
          dispatch(Response(FETCH_OVERVIEW_TIMELINE_FULFILLED, response));
        },
        (_, error) => {
          dispatch(Response(FETCH_OVERVIEW_TIMELINE_REJECTED, error));
        },
      );
    });
  };
};

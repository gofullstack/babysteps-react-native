import { _ } from 'lodash';

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

  RESET_MILESTONE_CALENDAR,

  FETCH_MILESTONE_CALENDAR_PENDING,
  FETCH_MILESTONE_CALENDAR_FULFILLED,
  FETCH_MILESTONE_CALENDAR_REJECTED,

  UPDATE_MILESTONE_CALENDAR_PENDING,
  UPDATE_MILESTONE_CALENDAR_FULFILLED,
  UPDATE_MILESTONE_CALENDAR_REJECTED,

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

  UPDATE_MILESTONE_ANSWERS_PENDING,
  UPDATE_MILESTONE_ANSWERS_FULFILLED,
  UPDATE_MILESTONE_ANSWERS_REJECTED,

  API_FETCH_MILESTONE_CHOICE_ANSWERS_PENDING,
  API_FETCH_MILESTONE_CHOICE_ANSWERS_FULFILLED,
  API_FETCH_MILESTONE_CHOICE_ANSWERS_REJECTED,

  API_CREATE_MILESTONE_ANSWER_PENDING,
  API_CREATE_MILESTONE_ANSWER_FULFILLED,
  API_CREATE_MILESTONE_ANSWER_REJECTED,

  API_UPDATE_MILESTONE_ANSWERS_PENDING,
  API_UPDATE_MILESTONE_ANSWERS_FULFILLED,
  API_UPDATE_MILESTONE_ANSWERS_REJECTED,

  API_SYNC_MILESTONE_ANSWERS_PENDING,
  API_SYNC_MILESTONE_ANSWERS_FULFILLED,
  API_SYNC_MILESTONE_ANSWERS_REJECTED,

  DELETE_MILESTONE_ANSWERS_PENDING,
  DELETE_MILESTONE_ANSWERS_FULFILLED,
  DELETE_MILESTONE_ANSWERS_REJECTED,

  RESET_MILESTONE_ATTACHMENTS,

  FETCH_MILESTONE_ATTACHMENTS_PENDING,
  FETCH_MILESTONE_ATTACHMENTS_FULFILLED,
  FETCH_MILESTONE_ATTACHMENTS_REJECTED,

  CREATE_MILESTONE_ATTACHMENT_PENDING,
  CREATE_MILESTONE_ATTACHMENT_FULFILLED,
  CREATE_MILESTONE_ATTACHMENT_REJECTED,

  UPDATE_MILESTONE_ATTACHMENT_PENDING,
  UPDATE_MILESTONE_ATTACHMENT_FULFILLED,
  UPDATE_MILESTONE_ATTACHMENT_REJECTED,

  DELETE_MILESTONE_ATTACHMENT_PENDING,
  DELETE_MILESTONE_ATTACHMENT_FULFILLED,
  DELETE_MILESTONE_ATTACHMENT_REJECTED,

  FETCH_OVERVIEW_TIMELINE_PENDING,
  FETCH_OVERVIEW_TIMELINE_FULFILLED,
  FETCH_OVERVIEW_TIMELINE_REJECTED,

} from '../actions/types';

const initialState = {
  milestones: {
    fetching: false,
    fetched: false,
    data: [],
    error: null,
  },
  api_milestones: {
    rebuild: false,
    fetching: false,
    fetched: false,
    error: null,
  },
  groups: {
    fetching: false,
    fetched: false,
    data: [],
    error: null,
  },
  calendar: {
    fetching: false,
    fetched: false,
    data: [],
    error: null,
  },
  api_calendar: {
    fetching: false,
    fetched: false,
    error: null,
  },
  tasks: {
    fetching: false,
    fetched: false,
    data: [],
    error: null,
  },
  sections: {
    fetching: false,
    fetched: false,
    data: [],
    error: null,
  },
  questions: {
    fetching: false,
    fetched: false,
    data: [],
    error: null,
  },
  choices: {
    fetching: false,
    fetched: false,
    data: [],
    error: null,
  },
  answer: {
    fetching: false,
    fetched: false,
    data: [],
    error: null,
  },
  answers: {
    fetching: false,
    fetched: false,
    data: [],
    error: null,
  },
  apiAnswer: {
    fetching: false,
    fetched: false,
    error: null,
    data: [],
  },
  apiAnswers: {
    fetching: false,
    fetched: false,
    error: null,
    data: [],
  },
  attachment: {
    fetching: false,
    fetched: false,
    error: null,
  },
  attachments: {
    fetching: false,
    fetched: false,
    error: null,
    data: [],
  },
  overview_timeline: {
    fetching: false,
    fetched: false,
    error: null,
    data: [],
  },
};

const reducer = (state = initialState, action, formData = []) => {
  switch (action.type) {
    case FETCH_MILESTONES_PENDING: {
      return {
        ...state,
        milestones: {
          ...state.milestones,
          fetching: true,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case FETCH_MILESTONES_FULFILLED: {
      const data = action.payload.rows['_array'];
      return {
        ...state,
        milestones: {
          ...state.milestones,
          fetching: false,
          fetched: true,
          error: null,
          data,
        },
      };
    }
    case FETCH_MILESTONES_REJECTED: {
      return {
        ...state,
        milestones: {
          ...state.milestones,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case RESET_API_MILESTONES: {
      return {
        ...state,
        api_milestones: {
          fetching: false,
          fetched: false,
          error: null,
        },
      };
    }

    case API_FETCH_MILESTONES_PENDING: {
      return {
        ...state,
        api_milestones: {
          ...state.api_milestones,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_FETCH_MILESTONES_FULFILLED: {
      const data = action.payload.data;
      return {
        ...state,
        api_milestones: {
          ...state.api_milestones,
          fetching: false,
          fetched: true,
          error: null,
        },
        groups: {
          ...state.groups,
          fetching: false,
          fetched: true,
          error: null,
          data: data.milestone_groups,
        },
        milestones: {
          ...state.milestones,
          fetching: false,
          fetched: true,
          error: null,
          data: data.milestones,
        },
        tasks: {
          ...state.tasks,
          fetching: false,
          fetched: true,
          error: null,
          data: data.tasks,
        },
        sections: {
          ...state.sections,
          fetching: false,
          fetched: true,
          error: null,
          data: data.sections,
        },
        questions: {
          ...state.questions,
          fetching: false,
          fetched: true,
          error: null,
          data: data.questions,
        },
        choices: {
          ...state.choices,
          fetching: false,
          fetched: true,
          error: null,
          data: data.choices,
        },
      };
    }
    case API_FETCH_MILESTONES_REJECTED: {
      return {
        ...state,
        api_milestones: {
          ...state.api_milestones,
          fetching: false,
          error: action.payload,
        },
      };
    }

    case FETCH_MILESTONE_GROUPS_PENDING: {
      return {
        ...state,
        groups: {
          ...state.groups,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case FETCH_MILESTONE_GROUPS_FULFILLED: {
      const data = action.payload.rows['_array'];
      return {
        ...state,
        groups: {
          ...state.groups,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case FETCH_MILESTONE_GROUPS_REJECTED: {
      return {
        ...state,
        groups: {
          ...state.groups,
          fetching: false,
          error: action.payload,
        },
      };
    }

    case RESET_MILESTONE_CALENDAR: {
      return {
        ...state,
        calendar: {
          fetching: false,
          fetched: false,
          error: null,
          data: [],
        },
        api_calendar: {
          fetching: false,
          fetched: false,
          error: null,
        },
      };
    }

    case FETCH_MILESTONE_CALENDAR_PENDING: {
      return {
        ...state,
        calendar: {
          ...state.calendar,
          fetching: true,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case FETCH_MILESTONE_CALENDAR_FULFILLED: {
      const data = action.payload.rows['_array'];
      return {
        ...state,
        calendar: {
          ...state.calendar,
          fetching: false,
          fetched: true,
          data,
        },
      };
    }
    case FETCH_MILESTONE_CALENDAR_REJECTED: {
      return {
        ...state,
        calendar: {
          ...state.calendar,
          fetching: false,
          error: action.payload,
        },
      };
    }

    case RESET_API_MILESTONE_CALENDAR: {
      return {
        ...state,
        api_calendar: {
          fetching: false,
          fetched: false,
          error: null,
        },
      };
    }

    case API_NEW_MILESTONE_CALENDAR_PENDING: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_NEW_MILESTONE_CALENDAR_FULFILLED: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: false,
          fetched: true,
          error: null,
        },
        calendar: {
          ...state.calendar,
          fetching: false,
          fetched: true,
          error: null,
          data: action.payload.data,
        },
      };
    }
    case API_NEW_MILESTONE_CALENDAR_REJECTED: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case API_FETCH_MILESTONE_CALENDAR_PENDING: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_FETCH_MILESTONE_CALENDAR_FULFILLED: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: false,
          fetched: true,
          error: null,
        },
        calendar: {
          ...state.calendar,
          fetching: false,
          fetched: true,
          error: null,
          data: action.payload.data,
        },
      };
    }
    case API_FETCH_MILESTONE_CALENDAR_REJECTED: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case API_CREATE_MILESTONE_CALENDAR_PENDING: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_CREATE_MILESTONE_CALENDAR_FULFILLED: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: false,
          fetched: true,
          error: null,
        },
      };
    }
    case API_CREATE_MILESTONE_CALENDAR_REJECTED: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case API_UPDATE_MILESTONE_CALENDAR_PENDING: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_UPDATE_MILESTONE_CALENDAR_FULFILLED: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: false,
          fetched: true,
          error: null,
        },
      };
    }
    case API_UPDATE_MILESTONE_CALENDAR_REJECTED: {
      return {
        ...state,
        api_calendar: {
          ...state.api_calendar,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case FETCH_MILESTONE_TASKS_PENDING: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          fetching: true,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case FETCH_MILESTONE_TASKS_FULFILLED: {
      const data = action.payload.rows['_array'];
      return {
        ...state,
        tasks: {
          ...state.tasks,
          fetching: false,
          fetched: true,
          error: null,
          data,
        },
      };
    }
    case FETCH_MILESTONE_TASKS_REJECTED: {
      return {
        ...state,
        tasks: {
          ...state.tasks,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case FETCH_MILESTONE_SECTIONS_PENDING: {
      return {
        ...state,
        sections: {
          ...state.sections,
          fetching: true,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case FETCH_MILESTONE_SECTIONS_FULFILLED: {
      const data = action.payload.rows['_array'];
      return {
        ...state,
        sections: {
          ...state.sections,
          fetching: false,
          fetched: true,
          error: null,
          data,
        },
      };
    }
    case FETCH_MILESTONE_SECTIONS_REJECTED: {
      return {
        ...state,
        sections: {
          ...state.sections,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case RESET_MILESTONE_QUESTIONS: {
      return {
        ...state,
        questions: {
          fetching: false,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }

    case FETCH_MILESTONE_QUESTIONS_PENDING: {
      return {
        ...state,
        questions: {
          ...state.questions,
          fetching: true,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case FETCH_MILESTONE_QUESTIONS_FULFILLED: {
      const data = action.payload.rows['_array'];
      return {
        ...state,
        questions: {
          ...state.questions,
          fetching: false,
          fetched: true,
          error: null,
          data,
        },
      };
    }
    case FETCH_MILESTONE_QUESTIONS_REJECTED: {
      return {
        ...state,
        questions: {
          ...state.questions,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case RESET_MILESTONE_CHOICES: {
      return {
        ...state,
        choices: {
          fetching: false,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }

    case FETCH_MILESTONE_CHOICES_PENDING: {
      return {
        ...state,
        choices: {
          ...state.choices,
          fetching: true,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case FETCH_MILESTONE_CHOICES_FULFILLED: {
      const data = action.payload.rows['_array'];
      return {
        ...state,
        choices: {
          ...state.choices,
          fetching: false,
          fetched: true,
          error: null,
          data,
        },
      };
    }
    case FETCH_MILESTONE_CHOICES_REJECTED: {
      return {
        ...state,
        choices: {
          ...state.choices,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case RESET_MILESTONE_ANSWERS: {
      return {
        ...state,
        answers: {
          fetching: false,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }

    case FETCH_MILESTONE_ANSWERS_PENDING: {
      return {
        ...state,
        answers: {
          ...state.answers,
          fetching: true,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case FETCH_MILESTONE_ANSWERS_FULFILLED: {
      let data = action.payload.rows['_array'];
      _.map(data, answer => {
        answer.answer_boolean =
          answer.answer_boolean === 1 || answer.answer_boolean === 'true';
      });
      return {
        ...state,
        answers: {
          ...state.answers,
          fetching: false,
          fetched: true,
          error: null,
          data,
        },
      };
    }
    case FETCH_MILESTONE_ANSWERS_REJECTED: {
      return {
        ...state,
        answers: {
          ...state.answers,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case CREATE_MILESTONE_ANSWER_PENDING: {
      return {
        ...state,
        answer: {
          ...state.answer,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case CREATE_MILESTONE_ANSWER_FULFILLED: {
      return {
        ...state,
        answer: {
          ...state.answer,
          fetching: false,
          fetched: true,
          error: null,
        },
      };
    }
    case CREATE_MILESTONE_ANSWER_REJECTED: {
      return {
        ...state,
        answer: {
          ...state.answer,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case UPDATE_MILESTONE_ANSWERS_PENDING: {
      return {
        ...state,
        answers: {
          ...state.answers,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case UPDATE_MILESTONE_ANSWERS_FULFILLED: {
      return {
        ...state,
        answers: {
          ...state.answers,
          fetching: false,
          fetched: true,
          error: null,
          data: action.formData,
        },
      };
    }
    case UPDATE_MILESTONE_ANSWERS_REJECTED: {
      return {
        ...state,
        answers: {
          ...state.answers,
          fetching: false,
          error: action.payload,
        },
      };
    }

    case API_FETCH_MILESTONE_CHOICE_ANSWERS_PENDING: {
      return {
        ...state,
        apiAnswers: {
          ...state.apiAnswers,
          fetching: true,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case API_FETCH_MILESTONE_CHOICE_ANSWERS_FULFILLED: {
      const data = action.payload.data;
      return {
        ...state,
        apiAnswers: {
          ...state.apiAnswers,
          fetching: false,
          fetched: true,
          error: null,
          data,
        },
      };
    }
    case API_FETCH_MILESTONE_CHOICE_ANSWERS_REJECTED: {
      const error = action.payload;
      return {
        ...state,
        apiAnswers: {
          ...state.apiAnswers,
          fetching: false,
          fetched: false,
          error,
          data: [],
        },
      };
    }

    case API_CREATE_MILESTONE_ANSWER_PENDING: {
      return {
        ...state,
        apiAnswer: {
          ...state.apiAnswer,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_CREATE_MILESTONE_ANSWER_FULFILLED: {
      const data = action.payload.data;
      return {
        ...state,
        apiAnswer: {
          ...state.apiAnswer,
          fetching: false,
          fetched: true,
          error: null,
          data,
        },
      };
    }
    case API_CREATE_MILESTONE_ANSWER_REJECTED: {
      const error = action.payload;
      return {
        ...state,
        apiAnswer: {
          ...state.apiAnswer,
          fetching: false,
          fetched: false,
          error,
        },
      };
    }

    case API_UPDATE_MILESTONE_ANSWERS_PENDING: {
      return {
        ...state,
        apiAnswers: {
          ...state.apiAnswers,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_UPDATE_MILESTONE_ANSWERS_FULFILLED: {
      const data = action.payload.data;
      return {
        ...state,
        apiAnswers: {
          ...state.apiAnswers,
          fetching: false,
          fetched: true,
          error: null,
        },
      };
    }
    case API_UPDATE_MILESTONE_ANSWERS_REJECTED: {
      const error = action.payload;
      return {
        ...state,
        apiAnswers: {
          ...state.apiAnswers,
          fetching: false,
          fetched: false,
          error,
        },
      };
    }

    case API_SYNC_MILESTONE_ANSWERS_PENDING: {
      return {
        ...state,
        apiAnswers: {
          ...state.apiAnswers,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case API_SYNC_MILESTONE_ANSWERS_FULFILLED: {
      return {
        ...state,
        apiAnswers: {
          ...state.apiAnswers,
          fetching: false,
          fetched: true,
          error: null,
        },
      };
    }
    case API_SYNC_MILESTONE_ANSWERS_REJECTED: {
      return {
        ...state,
        apiAnswers: {
          ...state.apiAnswers,
          fetching: false,
          fetched: false,
          error,
        },
      };
    }

    case DELETE_MILESTONE_ANSWERS_PENDING: {
      return {
        ...state,
        answers: {
          ...state.answers,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case DELETE_MILESTONE_ANSWERS_FULFILLED: {
      return {
        ...state,
        answers: {
          ...state.answers,
          fetching: false,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case DELETE_MILESTONE_ANSWERS_REJECTED: {
      return {
        ...state,
        answers: {
          ...state.answers,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case RESET_MILESTONE_ATTACHMENTS: {
      return {
        ...state,
        attachments: {
          fetching: false,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }

    case FETCH_MILESTONE_ATTACHMENTS_PENDING: {
      return {
        ...state,
        attachments: {
          ...state.attachments,
          fetching: true,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case FETCH_MILESTONE_ATTACHMENTS_FULFILLED: {
      const data = action.payload.rows['_array'];
      return {
        ...state,
        attachments: {
          ...state.attachments,
          fetching: false,
          fetched: true,
          error: null,
          data,
        },
      };
    }
    case FETCH_MILESTONE_ATTACHMENTS_REJECTED: {
      return {
        ...state,
        attachments: {
          ...state.attachments,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case CREATE_MILESTONE_ATTACHMENT_PENDING: {
      return {
        ...state,
        attachment: {
          ...state.attachment,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case CREATE_MILESTONE_ATTACHMENT_FULFILLED: {
      return {
        ...state,
        attachment: {
          ...state.attachment,
          fetching: false,
          fetched: true,
          error: null,
        },
      };
    }
    case CREATE_MILESTONE_ATTACHMENT_REJECTED: {
      return {
        ...state,
        attachment: {
          ...state.attachment,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case UPDATE_MILESTONE_ATTACHMENT_PENDING: {
      return {
        ...state,
        attachment: {
          ...state.attachment,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case UPDATE_MILESTONE_ATTACHMENT_FULFILLED: {
      return {
        ...state,
        attachment: {
          ...state.attachment,
          fetching: false,
          fetched: true,
          error: null,
        },
      };
    }
    case UPDATE_MILESTONE_ATTACHMENT_REJECTED: {
      return {
        ...state,
        attachment: {
          ...state.attachment,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case DELETE_MILESTONE_ATTACHMENT_PENDING: {
      return {
        ...state,
        attachment: {
          ...state.attachment,
          fetching: true,
          fetched: false,
          error: null,
        },
      };
    }
    case DELETE_MILESTONE_ATTACHMENT_FULFILLED: {
      return {
        ...state,
        attachment: {
          ...state.attachment,
          fetching: false,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case DELETE_MILESTONE_ATTACHMENT_REJECTED: {
      return {
        ...state,
        attachment: {
          ...state.attachment,
          fetching: false,
          fetched: false,
          error: action.payload,
        },
      };
    }

    case FETCH_OVERVIEW_TIMELINE_PENDING: {
      return {
        ...state,
        overview_timeline: {
          ...state.overview_timeline,
          fetching: true,
          fetched: false,
          error: null,
          data: [],
        },
      };
    }
    case FETCH_OVERVIEW_TIMELINE_FULFILLED: {
      const data = action.payload.rows['_array'];
      return {
        ...state,
        overview_timeline: {
          ...state.overview_timeline,
          fetching: false,
          fetched: true,
          error: null,
          data,
        },
      };
    }
    case FETCH_OVERVIEW_TIMELINE_REJECTED: {
      return {
        ...state,
        overview_timeline: {
          ...state.overview_timeline,
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

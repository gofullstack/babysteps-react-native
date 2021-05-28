import {
  SHOW_MOMENTARY_ASSESSMENT,
  HIDE_MOMENTARY_ASSESSMENT,
} from '../actions/types';

const initialState = {
  show_momentary_assessment: false,
  momentary_assessment: {
    fetching: false,
    fetched: false,
    error: null,
    data: {},
  },
};

const reducer = (state = initialState, action, formData = []) => {
  switch (action.type) {
    case SHOW_MOMENTARY_ASSESSMENT: {
      return {
        ...state,
        show_momentary_assessment: true,
        momentary_assessment: {
          ...state.momentary_assessment,
          fetching: false,
          fetched: false,
          error: null,
          data: action.payload,
        },
      };
    }
    case HIDE_MOMENTARY_ASSESSMENT: {
      return {
        ...state,
        show_momentary_assessment: false,
        momentary_assessment: {
          ...state.momentary_assessment,
          fetching: false,
          fetched: false,
          error: null,
          data: action.payload,
          answer: formData,
        },
      };
    }

    default: {
      return state;
    }
  }
};

export default reducer;

import { SHOW_MOMENTARY_ASSESSMENT, HIDE_MOMENTARY_ASSESSMENT } from './types';

const Pending = type => {
  return { type };
};

const Response = (type, payload, formData = {}) => {
  return { type, payload, formData };
};

export const showMomentaryAssessment = data => {
  return dispatch => {
    dispatch(Response(SHOW_MOMENTARY_ASSESSMENT, data));
  };
};

export const hideMomentaryAssessment = (data, formData) => {
  return dispatch => {
    dispatch(Response(HIDE_MOMENTARY_ASSESSMENT, data, formData));
  };
};

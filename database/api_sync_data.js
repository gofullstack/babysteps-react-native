import { PureComponent } from 'react';
import { AppState } from 'react-native';
import * as FileSystem from 'expo-file-system';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import {
  updateSession,
  fetchSession,
  apiDisptachTokenRefresh,
} from '../actions/session_actions';
import {
  resetMilestoneAnswers,
  fetchMilestoneAnswers,
  fetchMilestoneAttachments,
  apiFetchChoiceAnswers,
  apiFetchAnswerAttachments,
} from '../actions/milestone_actions';
import {
  fetchUser,
  fetchRespondent,
  fetchSubject,
  apiFetchUserRespondents,
  apiFetchRespondentAttachments,
  apiSaveSignature,
  apiFetchUserSubject,
} from '../actions/registration_actions';

import UploadMilestoneAnswers from './upload_milestone_answers';
import UploadMilestoneCalendarsCompleted from './upload_milestone_calendars_completed';

import { delay } from './common';

import CONSTANTS from '../constants';
import States from '../actions/states';

class ApiSyncData extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      appState: AppState.currentState,
      apiRefreshTokenSubmitted: false,
      uploadAnswersSubmitted: false,
      uploadAttachmentsSubmitted: false,
      userRespondentApiUpdated: false,
      userChoiceAnswersUpdated: false,
      respondentAttachmentsApiUpdated: false,
      userSubjectApiUpdated: false,
      uploadCalendarsCompletedSubmitted: false,
    };

    this.props.fetchSession();
    this.props.fetchUser();
    this.props.fetchRespondent();
    this.props.fetchSubject();
    this.props.fetchMilestoneAnswers();
    this.props.fetchMilestoneAttachments();
  }

  componentDidMount() {
    console.log('*** API Data Sync');
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const user = this.props.registration.user.data;
    const subject = this.props.registration.subject.data;
    const respondent = this.props.registration.respondent.data;
    const { apiRespondent, apiSubject } = this.props.registration;
    const { apiAnswers, answers, attachments } = this.props.milestones;
    const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;

    const {
      apiRefreshTokenSubmitted,
      userRespondentApiUpdated,
      respondentAttachmentsApiUpdated,
      userSubjectApiUpdated,
      userChoiceAnswersUpdated,
      uploadAnswersSubmitted,
      uploadAttachmentsSubmitted,
      uploadCalendarsCompletedSubmitted,
    } = this.state;

    if (
      !session.fetching &&
      !session.fetching_token &&
      !apiRefreshTokenSubmitted
    ) {
      this.props.apiDisptachTokenRefresh(session);
      this.setState({ apiRefreshTokenSubmitted: true });
    }
     // rebuild respondent and subject on server
    if (inStudy && !session.fetching && session.fetched) {
      if (!isEmpty(respondent) && !userRespondentApiUpdated) {
        this.props.apiFetchUserRespondents(session);
        this.setState({ userRespondentApiUpdated: true });
      }
      if (
        userRespondentApiUpdated &&
        !apiRespondent.fetching &&
        apiRespondent.fetched &&
        !isEmpty(apiRespondent.data) &&
        !respondentAttachmentsApiUpdated
      ) {
        this.props.apiFetchRespondentAttachments(respondent.api_id);
        this.setState({ respondentAttachmentsApiUpdated: true });
      }

      if (
        !isEmpty(respondent) && respondent.api_id &&
        !isEmpty(subject) && subject.api_id &&
        !userSubjectApiUpdated
      ) {
        this.props.apiFetchUserSubject(session, respondent.api_id, subject.api_id);
        this.setState({ userSubjectApiUpdated: true });
      }
    }

    if (inStudy && !isEmpty(subject) && subject.api_id) {

      if (!userChoiceAnswersUpdated) {
        this.props.apiFetchChoiceAnswers(session, subject.api_id);
        this.setState({ userChoiceAnswersUpdated: true });
      }

      // upload any missing answers
      if (
        !uploadAnswersSubmitted &&
        !answers.fetching &&
        answers.fetched &&
        !isEmpty(answers.data)
      ) {
        UploadMilestoneAnswers(answers.data);
        this.props.resetMilestoneAnswers();
        this.setState({ uploadAnswersSubmitted: true });
      }

      // upload any attachments not yet uploaded
      if (
        !uploadAttachmentsSubmitted &&
        !attachments.fetching &&
        attachments.fetched &&
        !isEmpty(attachments.data) &&
        session.connectionType === 'wifi'
      ) {
        this._uploadAttachments(attachments.data);
        this.setState({ uploadAttachmentsSubmitted: true });
      }

      // upload completed datestamps for calender entries
      if (uploadAnswersSubmitted && !uploadCalendarsCompletedSubmitted) {
        UploadMilestoneCalendarsCompleted();
        this.setState({ uploadCalendarsCompletedSubmitted: true });
      }
    }

  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    const { appState } = this.state;
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      this.setState({
        appState: nextAppState,
        apiRefreshTokenSubmitted: false,
        uploadAnswersSubmitted: false,
        uploadAttachmentsSubmitted: false,
        userRespondentApiUpdated: false,
        userChoiceAnswersUpdated: false,
        respondentAttachmentsApiUpdated: false,
        userSubjectApiUpdated: false,
        uploadCalendarsCompletedSubmitted: false,
      });
    }
  };

  _uploadAttachments = async attachments => {
    await delay(10000, '*** wait for answers to be updated...');
    for (const attachment of attachments) {
      this.props.apiFetchAnswerAttachments(attachment);
      const delayMessage = '*** check if attachment uploaded...';
      await delay(3000, delayMessage);
    }
  };

  _saveSignature = async api_id => {
    const uri = FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY + '/signature.png';
    const signatureFile = await FileSystem.getInfoAsync(uri, {size: true});
    if (signatureFile.exists) {
      this.props.apiSaveSignature(api_id, uri);
    } else {
      console.log('no signature available');
    } // signatureFile exists
  };

  render() {
    return null;
  }
}

const mapStateToProps = ({
  session,
  milestones,
  registration,
}) => ({
  session,
  milestones,
  registration,
});
const mapDispatchToProps = {
  updateSession,
  fetchSession,
  apiDisptachTokenRefresh,
  fetchUser,
  fetchRespondent,
  fetchSubject,
  resetMilestoneAnswers,
  fetchMilestoneAnswers,
  apiFetchAnswerAttachments,
  fetchMilestoneAttachments,
  apiFetchUserRespondents,
  apiFetchRespondentAttachments,
  apiSaveSignature,
  apiFetchUserSubject,
  apiFetchChoiceAnswers,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ApiSyncData);

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
  fetchUser,
  fetchRespondent,
  fetchSubject,
} from '../actions/registration_actions';

import SyncRespondentByUser from './sync_respondent_by_user';
import SyncRespondentSignature from './sync_respondent_signature';
import SyncSubjectByUser from './sync_subject_by_user';
import SyncMilestoneAnswers from './sync_milestone_answers';
import SyncMilestoneAttachments from './sync_milestone_attachments';
import UploadMilestoneCalendarsCompleted from './upload_milestone_calendars_completed';

import { delay } from './common';

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
      respondentAttachmentsApiUpdated: false,
      userSubjectApiUpdated: false,
      uploadCalendarsCompletedSubmitted: false,
    };

    this.props.fetchSession();
    this.props.fetchUser();
    this.props.fetchRespondent();
    this.props.fetchSubject();
  }

  componentDidMount() {
    console.log('*** API Data Sync');
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const { user, respondent, subject } = this.props.registration;
    const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;

    const {
      apiRefreshTokenSubmitted,
      userRespondentApiUpdated,
      respondentAttachmentsApiUpdated,
      userSubjectApiUpdated,
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
    if (inStudy && user.fetched && !isEmpty(user.data) && user.data.api_id) {
      const user_api_id = user.data.api_id;

      if (!userRespondentApiUpdated) {
        SyncRespondentByUser(user_api_id);
        this.setState({ userRespondentApiUpdated: true });
      }

      if (
        userRespondentApiUpdated &&
        respondent.fetched &&
        !isEmpty(respondent.data) &&
        respondent.data.api_id
      ) {
        const respondent_api_id = respondent.data.api_id;

        if (!respondentAttachmentsApiUpdated) {
          SyncRespondentSignature(respondent_api_id);
          this.setState({ respondentAttachmentsApiUpdated: true });
        }

        if (subject.fetched && !isEmpty(subject.data) && subject.data.api_id) {
          const subject_api_id = subject.data.api_id;

          if (!userSubjectApiUpdated) {
            SyncSubjectByUser(user_api_id, respondent_api_id, subject_api_id);
            this.setState({ userSubjectApiUpdated: true });
          }

          if (!uploadAnswersSubmitted) {
            SyncMilestoneAnswers(subject_api_id);
            this.setState({ uploadAnswersSubmitted: true });
          }

          // upload any attachments not yet uploaded
          if (
            uploadAnswersSubmitted &&
            !uploadAttachmentsSubmitted &&
            session.connectionType === 'wifi'
          ) {
            this._uploadAttachments(subject_api_id);
            this.setState({ uploadAttachmentsSubmitted: true });
          }

          // upload completed datestamps for calender entries
          if (uploadAnswersSubmitted && !uploadCalendarsCompletedSubmitted) {
            UploadMilestoneCalendarsCompleted();
            this.setState({ uploadCalendarsCompletedSubmitted: true });
          }
        } // subject fetched
      } // respondent fetched
    } // inStudy
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
        respondentAttachmentsApiUpdated: false,
        userSubjectApiUpdated: false,
        uploadCalendarsCompletedSubmitted: false,
      });
    } else {
      this.setState({ appState: nextAppState });
    }
  };

  _uploadAttachments = async subject_api_id => {
    await delay(10000, '*** Wait for answers to be updated before syncing attachments...');
    SyncMilestoneAttachments(subject_api_id);
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
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ApiSyncData);

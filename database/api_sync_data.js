import { Component } from 'react';
import { AppState } from 'react-native';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import {
  updateSession,
  fetchSession,
  apiDispatchTokenRefresh,
} from '../actions/session_actions';
import {
  fetchUser,
  fetchRespondent,
  fetchSubject,
} from '../actions/registration_actions';

import SyncMilestones from './sync_milestones';
import SyncRespondentByUser from './sync_respondent_by_user';
import SyncRespondentSignature from './sync_respondent_signature';
import SyncSubjectByUser from './sync_subject_by_user';
import SyncMilestoneTriggers from './sync_milestone_triggers';
import SyncMilestoneAnswers from './sync_milestone_answers';
import SyncMilestoneAttachments from './sync_milestone_attachments';
import SyncBabybookEntryAttachments from './sync_babybook_entries';
import UploadMilestoneCalendarsCompleted from './upload_milestone_calendars_completed';

import CONSTANTS from '../constants';
import States from '../actions/states';

class ApiSyncData extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appState: AppState.currentState,
      apiSyncData: false,
      apiRefreshTokenSubmitted: false,
      userRespondentApiUpdated: false,
      respondentAttachmentsApiUpdated: false,
      userSubjectApiUpdated: false,
      uploadMilestonesSubmitted: false,
      uploadMilestoneTriggersSubmitted: false,
      uploadAnswersSubmitted: false,
      uploadAttachmentsSubmitted: false,
      uploadCalendarsCompletedSubmitted: false,
      uploadBabybookEntriesSubmitted: false,
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

  shouldComponentUpdate(nextProps, nextState) {
    const session = this.props.session;
    const { user, respondent, subject } = this.props.registration;
    return (
      !session.fetching &&
      !user.fetching &&
      !respondent.fetching &&
      !subject.fetching
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const { user, respondent, subject } = this.props.registration;
    const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;

    const {
      apiRefreshTokenSubmitted,
      apiSyncData,
      userRespondentApiUpdated,
      respondentAttachmentsApiUpdated,
      userSubjectApiUpdated,
      uploadMilestonesSubmitted,
      uploadMilestoneTriggersSubmitted,
      uploadAnswersSubmitted,
      uploadAttachmentsSubmitted,
      uploadBabybookEntriesSubmitted,
      uploadCalendarsCompletedSubmitted,
    } = this.state;

    if (
      session.fetched &&
      !session.fetching_token &&
      session.email &&
      session.password &&
      !apiRefreshTokenSubmitted
    ) {
      this.props.apiDispatchTokenRefresh(session);
      this.setState({
        apiSyncData: true,
        apiRefreshTokenSubmitted: true,
      });
    }

    // rebuild respondent and subject on server
    if (inStudy && apiSyncData) {

      if (!uploadMilestonesSubmitted) {
        SyncMilestones(CONSTANTS.STUDY_ID, session.milestones_last_updated_at);
        this.setState({ uploadMilestonesSubmitted: true });
      }

      if (!isEmpty(user.data) && user.data.api_id) {
        const user_api_id = user.data.api_id;

        if (!userRespondentApiUpdated) {
          SyncRespondentByUser(user_api_id);
          this.setState({ userRespondentApiUpdated: true });
        }

        if (
          !isEmpty(respondent.data) &&
          respondent.data.api_id &&
          userRespondentApiUpdated
        ) {
          const respondent_api_id = respondent.data.api_id;

          if (
            !respondentAttachmentsApiUpdated // &&
            //session.connectionType === 'wifi'
          ) {
            SyncRespondentSignature(respondent_api_id);
            this.setState({ respondentAttachmentsApiUpdated: true });
          }

          if (!isEmpty(subject.data) && subject.data.api_id) {
            const subject_api_id = subject.data.api_id;

            if (!userSubjectApiUpdated) {
              SyncSubjectByUser(user_api_id, respondent_api_id, subject_api_id);
              this.setState({ userSubjectApiUpdated: true });
            }

            if (!uploadMilestoneTriggersSubmitted) {
              SyncMilestoneTriggers(subject_api_id, session.milestone_calendar_last_updated_at);
              this.setState({ uploadMilestoneTriggersSubmitted: true });
            }

            if (!uploadAnswersSubmitted) {
              SyncMilestoneAnswers(subject_api_id);
              this.setState({ uploadAnswersSubmitted: true });
            }

            // upload any attachments not yet uploaded
            if (
              !uploadAttachmentsSubmitted // &&
              // session.connectionType === 'wifi'
            ) {
              SyncMilestoneAttachments();
              this.setState({ uploadAttachmentsSubmitted: true });
            }

            // upload completed datestamps for calender entries
            if (!uploadCalendarsCompletedSubmitted) {
              UploadMilestoneCalendarsCompleted();
              this.setState({ uploadCalendarsCompletedSubmitted: true });
            }

          } // subject fetched
        } // respondent fetched
      } // user fetched
      if (!uploadBabybookEntriesSubmitted) {
        // disabled
        // need to accomodate where answer attachment is updated
        //SyncBabybookEntryAttachments();
        this.setState({ uploadBabybookEntriesSubmitted: true });
      }
    } // inStudy && apiSyncData
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    const { appState } = this.state;
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      this.setState({
        appState: nextAppState,
        apiSyncData: true,
        uploadAnswersSubmitted: false,
        uploadAttachmentsSubmitted: false,
        uploadMilestoneTriggersSubmitted: false,
      });
    } else {
      this.setState({ appState: nextAppState });
    }
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
  apiDispatchTokenRefresh,
  fetchUser,
  fetchRespondent,
  fetchSubject,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ApiSyncData);

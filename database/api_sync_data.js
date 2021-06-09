import { Component } from 'react';
import { AppState } from 'react-native';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import {
  updateSession,
  apiDispatchTokenRefresh,
} from '../actions/session_actions';

import SyncConsentVersion from './sync_consent_version';
import SyncConsentSignature from './sync_consent_signature';
import SyncMilestones from './sync_milestones';
import SyncRespondentByUser from './sync_respondent_by_user';
//import SyncRespondentSignature from './sync_respondent_signature';
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
      updateConsentVersionSubmitted: false,
      updateConsentSignatureSubmitted: false,
      userSubjectApiUpdated: false,
      uploadMilestonesSubmitted: false,
      uploadMilestoneTriggersSubmitted: false,
      uploadAnswersSubmitted: false,
      uploadAttachmentsSubmitted: false,
      uploadCalendarsCompletedSubmitted: false,
      uploadBabybookEntriesSubmitted: false,
    };

  }

  componentDidMount() {
    console.log('*** API Data Sync');
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const { user, respondent, subject, consent } = this.props.registration;
    const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;

    const {
      apiRefreshTokenSubmitted,
      apiSyncData,
      userRespondentApiUpdated,
      updateConsentSignatureSubmitted,
      updateConsentVersionSubmitted,
      userSubjectApiUpdated,
      uploadMilestonesSubmitted,
      uploadMilestoneTriggersSubmitted,
      uploadAnswersSubmitted,
      uploadAttachmentsSubmitted,
      uploadBabybookEntriesSubmitted,
      uploadCalendarsCompletedSubmitted,
    } = this.state;

    if (
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

    if (!updateConsentVersionSubmitted) {
      SyncConsentVersion(
        CONSTANTS.STUDY_ID,
        session.consent_update_at,
        session.consent_last_updated_at,
      );
      this.setState({ updateConsentVersionSubmitted: true });
    }

    if (!uploadMilestonesSubmitted) {
      SyncMilestones(
        CONSTANTS.STUDY_ID,
        session.milestones_updated_at,
        session.milestones_last_updated_at,
      );
      this.setState({ uploadMilestonesSubmitted: true });
    }

    // rebuild respondent and subject on server
    if (inStudy && apiSyncData) {

      if (!isEmpty(user.data) && user.data.id) {
        const user_id = user.data.id;

        if (!userRespondentApiUpdated) {
          SyncRespondentByUser(user_id);
          this.setState({ userRespondentApiUpdated: true });
        }

        if (
          !isEmpty(respondent.data) &&
          respondent.data.id &&
          userRespondentApiUpdated
        ) {
          const respondent_id = respondent.data.id;

          if (
            !updateConsentSignatureSubmitted &&
            !isEmpty(consent.data) &&
            consent.data.version_id // &&
            //session.connectionType === 'wifi'
          ) {
            SyncConsentSignature(consent.data.version_id, respondent_id);
            this.setState({ updateConsentSignatureSubmitted: true });
          }

          if (!isEmpty(subject.data) && subject.data.id) {
            const subject_id = subject.data.id;

            if (!userSubjectApiUpdated) {
              SyncSubjectByUser(user_id, respondent_id, subject_id);
              this.setState({ userSubjectApiUpdated: true });
            }

            if (!uploadMilestoneTriggersSubmitted) {
              SyncMilestoneTriggers(subject_id, session.milestone_calendar_last_updated_at);
              this.setState({ uploadMilestoneTriggersSubmitted: true });
            }

            if (!uploadAnswersSubmitted) {
              SyncMilestoneAnswers(subject_id);
              this.setState({ uploadAnswersSubmitted: true });
            }

            // upload any attachments not yet uploaded
            if (
              uploadAnswersSubmitted &&
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
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    const { appState } = this.state;
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      this.setState({
        appState: nextAppState,
        apiSyncData: true,
        uploadMilestonesSubmitted: false,
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

const mapStateToProps = ({ session, milestones, registration }) => ({
  session,
  milestones,
  registration,
});

const mapDispatchToProps = {
  updateSession,
  apiDispatchTokenRefresh,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ApiSyncData);

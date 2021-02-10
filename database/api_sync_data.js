import { PureComponent } from 'react';
import { AppState } from 'react-native';
import * as FileSystem from 'expo-file-system';

import isEmpty from 'lodash/isEmpty';
import _ from 'lodash';

import { connect } from 'react-redux';
import {
  updateSession,
  fetchSession,
  apiDisptachTokenRefresh,
} from '../actions/session_actions';
import {
  fetchMilestoneAnswers,
  deleteMilestoneAnswer,
  fetchMilestoneAttachments,
  apiFetchChoiceAnswers,
  apiFetchAnswerAttachments,
  updateMilestoneAttachment,
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

import { delay, addColumn } from './common';

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
      cleanDuplicateAnswersSubmitted: false,
      confirmImageAttachmentsSubmitted: false,
    };

    this.props.fetchSession();
    this.props.fetchUser();
    this.props.fetchRespondent();
    this.props.fetchSubject();
    this.props.fetchMilestoneAnswers();
    this.props.fetchMilestoneAttachments();
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    // temporary code for backward compatibility

    addColumn('sessions', 'push_token', 'text');
    addColumn('sessions', 'milestones_updated_at', 'text');
    addColumn('sessions', 'milestones_last_updated_at', 'text');
    addColumn('sessions', 'milestone_calendar_updated_at', 'text');
    addColumn('sessions', 'milestone_calendar_last_updated_at', 'text');
    addColumn('sessions', 'current_group_index', 'integer');
    addColumn('attachments', 'size', 'integer');
    addColumn('attachments', 'uploaded', 'integer');
    addColumn('attachments', 'checksum', 'string');
    addColumn('babybook_entries', 'choice_id', 'integer');
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
      cleanDuplicateAnswersSubmitted,
      confirmImageAttachmentsSubmitted,
    } = this.state;

    if(
      !answers.fetching &&
      answers.fetched &&
      !isEmpty(answers.data) &&
      !cleanDuplicateAnswersSubmitted
    ) {
      this._cleanDuplicateAnswers();
      this.setState({ cleanDuplicateAnswersSubmitted: true });
      this.props.fetchMilestoneAnswers();
      return;
    }

    if(
      !answers.fetching &&
      answers.fetched &&
      !attachments.fetching &&
      attachments.fetched &&
      !isEmpty(attachments.data) &&
      !confirmImageAttachmentsSubmitted
    ) {
      this._confirmAttachments();
      this.setState({ confirmImageAttachmentsSubmitted: true });
      this.props.fetchMilestoneAttachments();
      return;
    }

    if (
      !session.fetching &&
      !session.fetching_token &&
      !apiRefreshTokenSubmitted
    ) {
      this.props.apiDisptachTokenRefresh(session);
      this.setState({ apiRefreshTokenSubmitted: true });
    }
     // rebuild respondent and subject on server
    if (inStudy && session.access_token && !session.fetching && session.fetched) {
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
        !isEmpty(respondent) &&
        !isEmpty(subject) &&
        userRespondentApiUpdated &&
        !apiRespondent.fetching &&
        apiRespondent.fetched &&
        !isEmpty(apiRespondent.data) &&
        !userSubjectApiUpdated
      ) {
        this.props.apiFetchUserSubject(session, respondent.api_id, subject.api_id);
        this.setState({ userSubjectApiUpdated: true });
      }
    }

    if (
      inStudy &&
      !apiSubject.fetching &&
      apiSubject.fetched &&
      !isEmpty(apiSubject.data)
    ) {

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

  _cleanDuplicateAnswers = () => {
    const { answers, attachments } = this.props.milestones;
    if (!isEmpty(answers.data)) {
      const choice_ids = _.groupBy(answers.data, 'choice_id');
      _.map(choice_ids, choice_id => {
        if (choice_id.length > 1) {
          choice_id = _.orderBy(choice_id, ['id'], ['desc']);
          const saveAnswerID = choice_id[0].id;
          _.map(choice_id, answer => {
            if (answer.id === saveAnswerID) {
              const attachment = _.find(attachments.data, ['choice_id', answer.choice_id]);
              if (attachment) {
                attachment.answer_id = answer.id;
                this.props.updateMilestoneAttachment(attachment);
              }
            } else {
              this.props.deleteMilestoneAnswer(answer.id);
            }
          });
        }
      });
    }
  };

  _confirmAttachments = async () => {
    const { attachments, answers } = this.props.milestones;
    // confirm image exists
    if (!isEmpty(attachments.data)) {
      for (const item of attachments.data) {

        // associate answer
        if (!item.answer_id) {
          const answer = _.find(answers.data, ['choice_id', item.choice_id]);
          if (answer) {
            item.answer_id = answer.id;
          }
        }

        if (item.uri) {
          let resultFile = await FileSystem.getInfoAsync(item.uri);
          if (!resultFile.exists) {
            // file not found or otherwise defective
            console.log(`*** attachment not found or otherwise defective - ID: ${item.id}, URI: ${item.uri}`);
            item = {
              ...item,
              uri: null,
              filename: null,
              height: null,
              width: null,
              uploaded: 0,
            };
          }
        } // if item.uri

        this.props.updateMilestoneAttachment(item);
      } // for attachments.data
    } // if !isEmpty(attachments.data)
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
  fetchMilestoneAnswers,
  deleteMilestoneAnswer,
  apiFetchAnswerAttachments,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
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
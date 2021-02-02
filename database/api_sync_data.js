import { PureComponent } from 'react';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import { updateSession, fetchSession } from '../actions/session_actions';
import {
  resetMilestoneAnswers,
  fetchMilestoneAnswers,
  fetchMilestoneAttachments,
  apiFetchChoiceAnswers,
  apiFetchAnswerAttachments,
} from '../actions/milestone_actions';
import {
  resetRespondent,
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
      uploadAnswers: [],
      uploadAnswersSubmitted: false,
      uploadAttachments: [],
      uploadAttachmentsSubmitted: false,
      userRespondentApiUpdated: false,
      respondentAttachmentsApiUpdated: false,
      userSubjectApiUpdated: false,
      uploadCalendarsCompletedSubmitted: false,
    };

    this.props.fetchSession();
    this.props.resetRespondent();
    this.props.fetchMilestoneAnswers({ api_id: 'empty' });
    this.props.fetchMilestoneAttachments();
  }

  componentDidMount() {
    // temporary code for backward compatibility
    addColumn('sessions', 'current_group_index', 'integer');
    addColumn('attachments', 'size', 'integer');
    addColumn('attachments', 'uploaded', 'integer');
    addColumn('attachments', 'checksum', 'string');
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const subject = this.props.registration.subject.data;
    const respondent = this.props.registration.respondent.data;
    const { apiRespondent, apiSubject } = this.props.registration;
    const attachments = this.props.milestones.attachments;
    const answers = this.props.milestones.answers;
    const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;
    const {
      userRespondentApiUpdated,
      respondentAttachmentsApiUpdated,
      userSubjectApiUpdated,
      uploadAnswers,
      uploadAnswersSubmitted,
      uploadAttachments,
      uploadAttachmentsSubmitted,
      uploadCalendarsCompletedSubmitted,
    } = this.state;

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
        !respondentAttachmentsApiUpdated
      ) {
        this.props.apiFetchRespondentAttachments(respondent.api_id);
        this.setState({ respondentAttachmentsApiUpdated: true });
      }

      if (
        !isEmpty(subject) &&
        userRespondentApiUpdated &&
        !apiRespondent.fetching &&
        apiRespondent.fetched &&
        !userSubjectApiUpdated
      ) {
        this.props.apiFetchUserSubject(session, subject.api_id);
        this.props.apiFetchChoiceAnswers(session, subject.api_id);
        this.setState({ userSubjectApiUpdated: true });
      }
    }

    if (
      inStudy &&
      !answers.fetching &&
      answers.fetched &&
      !isEmpty(answers.data) &&
      !uploadAnswersSubmitted
    ) {
      this.setState({ uploadAnswers: answers.data });
    }
    // upload any answers with no api_id
    if (
      inStudy &&
      !isEmpty(uploadAnswers) &&
      session.connectionType === 'wifi'
    ) {
      UploadMilestoneAnswers(uploadAnswers);
      this.props.resetMilestoneAnswers();
      this.setState({
        uploadAnswersSubmitted: true,
        uploadAnswers: [],
      });
    }

    if (
      inStudy &&
      !attachments.fetching &&
      attachments.fetched &&
      !isEmpty(attachments.data) &&
      !uploadAttachmentsSubmitted
    ) {
      this.setState({ uploadAttachments: attachments.data });
    }
    // upload directly to AWS any attachments not yet uploaded
    if (
      inStudy &&
      !isEmpty(uploadAttachments) &&
      session.connectionType === 'wifi'
    ) {
      this._uploadAttachments(uploadAttachments);
      this.setState({
        uploadAttachmentsSubmitted: true,
        uploadAttachments: [],
      });
    }
    if (inStudy && !uploadCalendarsCompletedSubmitted) {
      UploadMilestoneCalendarsCompleted();
      this.setState({ uploadCalendarsCompletedSubmitted: true });
    }
  }

  _uploadAttachments = async attachments => {
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
  };
};

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
  resetMilestoneAnswers,
  fetchMilestoneAnswers,
  apiFetchAnswerAttachments,
  fetchMilestoneAttachments,
  resetRespondent,
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
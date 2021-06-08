import { Component } from 'react';
import { AppState } from 'react-native';

import * as FileSystem from 'expo-file-system';

import { _ } from 'lodash';

import { connect } from 'react-redux';
import { fetchSession, updateSession } from '../actions/session_actions';
import {
  fetchUser,
  updateUser,
  fetchRespondent,
  updateRespondent,
  fetchSubject,
  updateSubject,
} from '../actions/registration_actions';
import {
  fetchMilestoneCalendar,
  resetMilestoneAnswers,
  fetchMilestoneAnswers,
  updateMilestoneAnswer,
  deleteMilestoneAnswer,
  resetMilestoneAttachments,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
  deleteMilestoneAttachment,
} from '../actions/milestone_actions';

import { fetchBabyBookEntries } from '../actions/babybook_actions';

import CONSTANTS from '../constants';

class CheckDataIntegrity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appState: AppState.currentState,
      // TEMPORARY: PULL DATA FROM SQLITE IF ALREADY REGISTERED
      stateFetchedFromSQLite: false,
      //
      sessionUpdated: false,
      registrationUpdated: false,
      signatureFileUpdated: false,
      cleanDuplicateAnswersSubmitted: false,
      cleanDuplicateAttachmentsSubmitted: false,
      // THIS PERMENANTLY AND REPEATEDLY REMOVES ALL ANSWER DATA
      resetAnswers: false,
      //
      answersReset: false,
    };
  }

  componentDidMount = async () => {
    console.log('*** Checking Data Integrity');
    AppState.addEventListener('change', this.handleAppStateChange);
  };

  componentDidUpdate(prevProps, prevState) {
    const { answers, attachments } = this.props.milestones;
    const {
      stateFetchedFromSQLite,
      sessionUpdated,
      registrationUpdated,
      signatureFileUpdated,
      cleanDuplicateAnswersSubmitted,
      cleanDuplicateAttachmentsSubmitted,
      resetAnswers,
      answersReset,
    } = this.state;

    if (!stateFetchedFromSQLite) {
      this.fetchStateFromSQLite();
      this.setState({ stateFetchedFromSQLite: true });
      return;
    }

    if (!registrationUpdated) {
      this.confirmRegistrationAttributes();
      this.setState({ registrationUpdated: true });
      return;
    }

    if (!sessionUpdated) {
      this.confirmSessionAttributes();
      this.setState({ sessionUpdated: true });
      return;
    }

    if (!signatureFileUpdated) {
      // backward compatibility
      // create copy to migrate to consent versions
      this.copySignatureFile();
      this.setState({ signatureFileUpdated: true });
    }

    if (__DEV__ && resetAnswers && !answersReset) {
      this.props.resetMilestoneAnswers();
      this.props.resetMilestoneAttachments();
      this.setState({ answersReset: true });
      return;
    }

    if (!_.isEmpty(answers.data) && !cleanDuplicateAnswersSubmitted) {
      this.cleanDuplicateAnswers();
      this.setState({ cleanDuplicateAnswersSubmitted: true });
      return;
    }

    if (
      cleanDuplicateAnswersSubmitted &&
      !_.isEmpty(attachments.data) &&
      !cleanDuplicateAttachmentsSubmitted
    ) {
      this.cleanDuplicateAttachments();
      this.setState({ cleanDuplicateAttachmentsSubmitted: true });
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    const { appState } = this.state;
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      this.setState({
        appState: nextAppState,
        sessionUpdated: false,
        registrationUpdated: false,
      });
    } else {
      this.setState({ appState: nextAppState });
    }
  };

  fetchStateFromSQLite = () => {
    console.log('*** Begin Fetch From SQLite');
    const session = this.props.session;
    const { user, respondent, subject } = this.props.registration;
    const { calendar, answers, attachments } = this.props.milestones;
    const { entries } = this.props.babybook;

    if (!session.email) {
      this.props.fetchSession();
    }
    if (_.isEmpty(user.data)) {
      this.props.fetchUser();
    }
    if (_.isEmpty(respondent.data)) {
      this.props.fetchRespondent();
    }
    if (_.isEmpty(subject.data)) {
      this.props.fetchSubject();
    }
    if (_.isEmpty(calendar.data)) {
      this.props.fetchMilestoneCalendar();
    }
    if (_.isEmpty(answers.data)) {
      this.props.fetchMilestoneAnswers();
    }
    if (_.isEmpty(attachments.data)) {
      this.props.fetchMilestoneAttachments();
    }
    if (_.isEmpty(entries.data)) {
      this.props.fetchBabyBookEntries();
    }
    this.setState({ stateFetchedFromSQLite: true });
  };

  confirmRegistrationAttributes = () => {
    console.log('*** Begin Confirm Registration Attributes');
    const session = this.props.session;
    const { user, respondent, subject } = this.props.registration;

    if (!_.isEmpty(user.data)) {
      let id = user.data.id;
      let userData = {};
      if (user.data.id !== user.data.api_id) {
        userData.id = user.data.api_id;
        id = user.data.api_id;
      }
      if (session.password && !user.data.password) {
        userData.password = session.password;
      }
      if (!_.isEmpty(userData)) {
        this.props.updateUser(userData);
      }
    }
    if (!_.isEmpty(respondent.data)) {
      if (respondent.data.id !== respondent.data.api_id) {
        const id = respondent.data.api_id;
        this.props.updateRespondent({ id });
      }
    }
    if (!_.isEmpty(subject.data)) {
      if (subject.data.id !== subject.data.api_id) {
        const id = subject.data.api_id;
        this.props.updateSubject({ id });
      }
    }
  };

  confirmSessionAttributes = () => {
    console.log('*** Begin Confirm Session Attributes');
    const session = this.props.session;
    const { user } = this.props.registration;

    if (!_.isEmpty(user.data)) {
      if (
        (!session.uid && user.data.email) ||
        (!session.user_id && user.data.id)
      ) {
        this.props.updateSession({
          user_id: user.data.id,
          email: user.data.email,
          uid: user.data.email,
        });
      }
      if (!session.last_registration_state) {
        this.props.updateSession({
          last_registration_state: session.registration_state,
        });
      }
      if (!session.password && user.data.password) {
        const password = user.data.password;
        this.props.updateSession({ password });
      }
    }
    if (!_.isEmpty(subject.data)) {
      if (!subject.data.api_id) {
        this.props.updateSubject({ api_id: subject.data.id })
      }
    }
  };

  copySignatureFile = async () => {
    const fileUri =
      FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY + '/signature.png';
    const copyUri =
      FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY + '/signature_1.png';
    const signatureFile = await FileSystem.getInfoAsync(fileUri);
    if (!signatureFile.exists) return null;
    try {
      await FileSystem.copyAsync({ from: fileUri, to: copyUri });
    } catch (error) {
      console.log({ error });
    }
  };

  cleanDuplicateAnswers = () => {
    console.log('*** Begin Clean Duplicate Answers');
    const { user, subject, respondent } = this.props.registration;
    let answers = [...this.props.milestones.answers.data];

    if (_.isEmpty(answers)) return;

    let prevChoiceID = null;

    answers = _.orderBy(answers, ['choice_id']);
    for (const key in answers) {
      let answer = answers[key];
      if (!_.isEmpty(answer) && answer.choice_id) {
        // drop duplicates
        if (answer.choice_id !== prevChoiceID) {

          let data = {};

          if (!answer.user_id || !answer.respondent_id || !answer.subject_id) {
            data = {
              user_id: user.data.id,
              respondent_id: respondent.data.id,
              subject_id: subject.data.id,
            };
          }
          if (answer.api_id) {
            data.id = answer.api_id;
          }
          if (!_.isEmpty(data)) {
            this.props.updateMilestoneAnswer(answer.choice_id, data);
          }
        } else {
          this.props.deleteMilestoneAnswer(answer.choice_id);
        } // choice.id !== prevChoice_id;

        prevChoiceID = answer.choice_id;
      } // if isEmpty answer
    }; // for key in answers

  };

  cleanDuplicateAttachments = async () => {
    console.log('*** Begin Clean Duplicate Attachments');
    const { user, subject } = this.props.registration;
    const answers = this.props.milestones.answers.data;
    let attachments = [...this.props.milestones.attachments.data];

    if (_.isEmpty(attachments)) return;

    let prevChoiceID = null;

    attachments = _.orderBy(attachments, ['choice_id']);
    for (const key in attachments) {
      let attachment = attachments[key];

      if (!_.isEmpty(attachment) || attachment.choice_id) {
        const answer = _.find(answers, { 'choice_id': attachment.choice_id });
        // drop duplicates or missing answer

        if (!_.isEmpty(answer) && attachment.choice_id !== prevChoiceID) {

          if (attachment.uri) {
            let resultFile = await FileSystem.getInfoAsync(attachment.uri);
            if (!resultFile.exists) {
              // file not found or otherwise defective
              console.log(`*** Attachment file not found or otherwise defective - choiceID: ${attachment.choice_id}`);
              attachment = {
                ...attachment,
                uri: null,
                filename: null,
                height: null,
                width: null,
              };
              this.props.updateMilestoneAttachment(attachment);
            } // if resultFile
          } // if attachment.uri

          if (!attachment.user_id || !attachment.subject_id) {
            attachment = {
              ...attachment,
              user_id: user.data.id,
              subject_id: subject.data.id,
            };
            this.props.updateMilestoneAttachment(attachment);
          }

        } else {
          this.props.deleteMilestoneAttachment(attachment.choice_id);
        } // empty answer or prevChoiceID

        prevChoiceID = attachment.choice_id;
      } // if !isEmpty attachment

    } // for attachment
  };

  render() {
    return null;
  }
}

const mapStateToProps = ({ session, registration, milestones, babybook }) => ({
  session,
  registration,
  milestones,
  babybook,
});
const mapDispatchToProps = {
  fetchSession,
  updateSession,
  fetchUser,
  updateUser,
  fetchRespondent,
  updateRespondent,
  fetchSubject,
  updateSubject,
  fetchMilestoneCalendar,
  resetMilestoneAnswers,
  fetchMilestoneAnswers,
  updateMilestoneAnswer,
  deleteMilestoneAnswer,
  resetMilestoneAttachments,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
  deleteMilestoneAttachment,
  fetchBabyBookEntries,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CheckDataIntegrity);

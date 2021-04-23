import { Component } from 'react';

import * as FileSystem from 'expo-file-system';

import _ from 'lodash';

import { connect } from 'react-redux';
import { fetchSession, updateSession } from '../actions/session_actions';
import {
  fetchUser,
  updateUser,
  fetchRespondent,
  fetchSubject,
} from '../actions/registration_actions';
import {
  fetchMilestoneAnswers,
  updateMilestoneAnswers,
  deleteMilestoneAnswer,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
  deleteMilestoneAttachment,
} from '../actions/milestone_actions';

import checkRegistrationSchema from './check_registration_schema';
import checkMilestonesSchema from './check_milestones_schema';
import checkMilestoneTriggersSchema from './check_milestone_triggers_schema';
import checkAnswersSchema from './check_answers_schema';
import checkNotificationsSchema from './check_notifications_schema';
import checkBabyBookSchema from './check_babybook_schema';
import checkCustomDirectories from './check_custom_directories';

import { addColumn } from './common';

import CONSTANTS from '../constants';

class CheckDataIntegrity extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cleanDuplicateAnswersSubmitted: false,
      cleanDuplicateAttachmentsSubmitted: false,
      userPasswordUpdated: false,
      signatureFileUpdated: false,
    };

    this.props.fetchSession();
    this.props.fetchUser();
    this.props.fetchRespondent();
    this.props.fetchSubject();
    this.props.fetchMilestoneAnswers();
    this.props.fetchMilestoneAttachments();
  }

  componentDidMount = async () => {
    console.log('*** Checking Data Integrity');

    // async check of schemas
    await checkRegistrationSchema();
    await checkMilestonesSchema();
    await checkMilestoneTriggersSchema();
    await checkAnswersSchema();
    await checkNotificationsSchema();
    await checkBabyBookSchema();
    await checkCustomDirectories();
  };

  shouldComponentUpdate(nextProps, nextState) {
    const session = this.props.session;
    const { user, respondent, subject } = this.props.registration;
    const { answers, attachments } = this.props.milestones;
    return (
      !session.fetching &&
      !user.fetching &&
      !respondent.fetching &&
      !subject.fetching &&
      !answers.fetching &&
      !attachments.fetching
    )
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const { answers, attachments } = this.props.milestones;
    const {
      cleanDuplicateAnswersSubmitted,
      cleanDuplicateAttachmentsSubmitted,
      signatureFileUpdated,
    } = this.state;

    if (!session.fetching && session.fetched) {
      this.confirmSessionAttributes();
    }

    if (!signatureFileUpdated) {
      // backward compatibility
      // create copy to migrate to consent versions
      this.copySignatureFile();
      this.setState({ signatureFileUpdated: true });
    }

    if (
      answers.fetched &&
      attachments.fetched &&
      !_.isEmpty(answers.data) &&
      !cleanDuplicateAnswersSubmitted
    ) {
      this.cleanDuplicateAnswers();
      this.setState({ cleanDuplicateAnswersSubmitted: true });
      return;
    }

    if (
      cleanDuplicateAnswersSubmitted &&
      answers.fetched &&
      !_.isEmpty(answers.data) &&
      attachments.fetched &&
      !_.isEmpty(attachments.data) &&
      !cleanDuplicateAttachmentsSubmitted
    ) {
      this.cleanDuplicateAttachments();
      this.setState({ cleanDuplicateAttachmentsSubmitted: true });
    }
  }

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

  confirmSessionAttributes = () => {
    const session = this.props.session;
    const { user } = this.props.registration;
    const { userPasswordUpdated } = this.state;
    
    if (user.fetched && !_.isEmpty(user.data)) {
      if (
        (!session.uid && user.data.email) ||
        (!session.user_api_id && user.data.api_id)
      ) {
        this.props.updateSession({
          user_api_id: user.data.api_id,
          email: user.data.email,
          uid: user.data.email,
        });
      }
      if (!session.last_registration_state) {
        this.props.updateSession({
          last_registration_state: session.registration_state,
        });
      }

      if (!userPasswordUpdated) {
        if (session.password && !user.data.password) {
          const id = user.data.id;
          const password = session.password;
          this.props.updateUser({ id, password });
        }
        if (!session.password && user.data.password) {
          const password = user.data.password;
          this.props.updateSession({ password });
        }
        this.setState({ userPasswordUpdated: true });
      }
    }
  };

  cleanDuplicateAnswers = () => {
    console.log('*** Begin Clean Duplicate Answers');
    const answers = this.props.milestones.answers.data;
    const ansChoiceIDs = _.groupBy(answers, 'choice_id');
    const { user, subject, respondent } = this.props.registration;
    const updateAnswers = [];
    for (let [choice_id, ansChoiceID] of Object.entries(ansChoiceIDs)) {
      ansChoiceID = _.orderBy(ansChoiceID, ['id'], ['desc']);
      _.map(ansChoiceID, answer => {
        // delete all but first record (highest ID)
        if (answer.id !== ansChoiceID[0].id) {
          this.props.deleteMilestoneAnswer(answer.id);
        } else if (
          !answer.user_api_id ||
          !answer.respondent_api_id ||
          !answer.subject_api_id
        ) {
          answer = {
            ...answer,
            user_id: user.data.id,
            user_api_id: user.data.api_id,
            respondent_id: respondent.data.id,
            respondent_api_id: respondent.data.api_id,
            subject_id: subject.data.id,
            subject_api_id: subject.data.api_id,
          };
          updateAnswers.push(answer);
        }
      });
    }
    if (!_.isEmpty(updateAnswers)) {
      this.props.updateMilestoneAnswers(updateAnswers);
    }
  };

  cleanDuplicateAttachments = async () => {
    console.log('*** Begin Clean Duplicate Attachments');
    const { user, subject } = this.props.registration;
    const answers = this.props.milestones.answers.data;
    const attachments = this.props.milestones.attachments.data;
    const attChoiceIDs = _.groupBy(attachments, 'choice_id');

    for (let [choice_id, attChoiceID] of Object.entries(attChoiceIDs)) {
      attChoiceID = _.orderBy(attChoiceID, ['id'], ['desc']);
      choice_id = Number(choice_id);
      const answer = _.find(answers, { choice_id });

      for (let attachment of attChoiceID) {

        if (_.isEmpty(answer)) {
          // delete orphaned records
          this.props.deleteMilestoneAttachment(attachment.id);

        } else if (attachment.id === attChoiceID[0].id) {
          // save first record (highest ID)
          // confirm media file exists
          if (attachment.uri) {
            let resultFile = await FileSystem.getInfoAsync(attachment.uri);
            if (!resultFile.exists) {
              // file not found or otherwise defective
              console.log(`*** Attachment file not found or otherwise defective - URI: ${attachment.uri}`);
              attachment = {
                ...attachment,
                uri: null,
                filename: null,
                height: null,
                width: null,
              };
              this.props.updateMilestoneAttachment(attachment);
            } // if resultFile.exists
          } // if attachment.uri

          if (
            !attachment.answer_id ||
            !attachment.user_api_id ||
            !attachment.subject_api_id
          ) {
            attachment = {
              ...attachment,
              answer_id: answer.id,
              user_id: user.data.api_id,
              subject_api_id: subject.data.api_id
            };
            console.log(`*** Attachment updated with foreign keys: ${{ attachment }}`);
            this.props.updateMilestoneAttachment(attachment);
          }
        } else {
          // delete duplicates
          this.props.deleteMilestoneAttachment(attachment.id);
        }
      } // isEmpty answer

    } // for attChoiceIDs
  };

  render() {
    return null;
  }
}

const mapStateToProps = ({ session, registration, milestones }) => ({
  session,
  registration,
  milestones,
});
const mapDispatchToProps = {
  fetchSession,
  updateSession,
  fetchUser,
  updateUser,
  fetchRespondent,
  fetchSubject,
  fetchMilestoneAnswers,
  updateMilestoneAnswers,
  deleteMilestoneAnswer,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
  deleteMilestoneAttachment,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CheckDataIntegrity);

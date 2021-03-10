import { PureComponent } from 'react';

import * as FileSystem from 'expo-file-system';

import _ from 'lodash';

import { connect } from 'react-redux';
import { fetchSession, updateSession } from '../actions/session_actions';
import { fetchUser, updateUser } from '../actions/registration_actions';
import {
  fetchMilestoneAnswers,
  deleteMilestoneAnswer,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
  deleteMilestoneAttachment,
} from '../actions/milestone_actions';

import { addColumn } from './common';

class CheckDataIntegrity extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      cleanDuplicateAnswersSubmitted: false,
      cleanDuplicateAttachmentsSubmitted: false,
      userPasswordUpdated: false,
    };

    this.props.fetchSession();
    this.props.fetchUser();
    this.props.fetchMilestoneAnswers();
    this.props.fetchMilestoneAttachments();
  }

  componentDidMount() {
    console.log('*** Checking Data Integrity');

    // temporary code for backward compatibility
    addColumn('sessions', 'push_token', 'text');
    addColumn('sessions', 'milestones_updated_at', 'text');
    addColumn('sessions', 'milestones_last_updated_at', 'text');
    addColumn('sessions', 'milestone_calendar_updated_at', 'text');
    addColumn('sessions', 'milestone_calendar_last_updated_at', 'text');
    addColumn('sessions', 'current_group_index', 'integer');
    addColumn('attachments', 'subject_api_id', 'integer');
    addColumn('attachments', 'size', 'integer');
    addColumn('attachments', 'checksum', 'string');
    addColumn('babybook_entries', 'choice_id', 'integer');
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const { answers, attachments } = this.props.milestones;
    const {
      cleanDuplicateAnswersSubmitted,
      cleanDuplicateAttachmentsSubmitted,
    } = this.state;

    if (!session.fetching && session.fetched) {
      this.confirmSessionAttributes();
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

    if(
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

  confirmSessionAttributes = () => {
    const session = this.props.session;
    const { user } = this.props.registration;
    if (!user.fetching && user.fetched && !_.isEmpty(user.data)) {
      const data = user.data;
      if ((!session.uid && data.email) || (!session.user_id && data.api_id)) {
        this.props.updateSession({
          user_id: data.api_id,
          email: data.email,
          uid: data.email,
          password: data.password,
        });
      }
      // temp fix for lane's phone
      if (user.api_id === 562 && !userPasswordUpdated) {
        const password = 'kitkat12';
        const id = user.data.id;
        this.props.updateUser({ id, password });
        this.props.updateSession({ password });
        this.setState({ userPasswordUpdated: true });
      }
    }
  };

  cleanDuplicateAnswers = () => {
    console.log('*** Begin Clean Duplicate Answers');
    const answers = this.props.milestones.answers.data;
    const ansChoiceIDs = _.groupBy(answers, 'choice_id');
    for (let [choice_id, ansChoiceID] of Object.entries(ansChoiceIDs)) {
      ansChoiceID = _.orderBy(ansChoiceID, ['id'], ['desc']);
      _.map(ansChoiceID, answer => {
        // delete all but first record (highest ID)
        if (answer.id !== ansChoiceID[0].id) {
          this.props.deleteMilestoneAnswer(answer.id);
        }
      });
    };
  };

  cleanDuplicateAttachments = async () => {
    console.log('*** Begin Clean Duplicate Attachments');
    const answers = this.props.milestones.answers.data;
    const attachments = this.props.milestones.attachments.data;
    const attChoiceIDs = _.groupBy(attachments, 'choice_id');

    for (let [choice_id, attChoiceID] of Object.entries(attChoiceIDs)) {
      attChoiceID = _.orderBy(attChoiceID, ['id'], ['desc']);
      choice_id = Number(choice_id);
      const answer = _.find(answers, { choice_id });

      for (const attachment of attChoiceID) {

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
              console.log(`*** attachment not found or otherwise defective - URI: ${attachment.uri}`);
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

          if (!attachment.answer_id || !attachment.subject_api_id) {
            attachment.answer_id = answer.id;
            attachment.subject_api_id = answer.subject_api_id;
            this.props.updateMilestoneAttachment(attachment);
          }

        } else {
          // delete duplicates
          this.props.deleteMilestoneAttachment(attachment.id);

      } // isEmpty answer
    } // for attChoiceID

    } // for attChoiceIDs
  };

  render() {
    return null;
  }
}

const mapStateToProps = ({
  session,
  registration,
  milestones,
}) => ({
  session,
  registration,
  milestones,
});
const mapDispatchToProps = {
  fetchSession,
  updateSession,
  fetchUser,
  updateUser,
  fetchMilestoneAnswers,
  deleteMilestoneAnswer,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
  deleteMilestoneAttachment,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CheckDataIntegrity);

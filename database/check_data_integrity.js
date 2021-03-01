import { PureComponent } from 'react';

import * as FileSystem from 'expo-file-system';

import isEmpty from 'lodash/isEmpty';
import _ from 'lodash';

import { connect } from 'react-redux';
import { fetchSession, updateSession } from '../actions/session_actions';
import { fetchUser } from '../actions/registration_actions';
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
      confirmImageAttachmentsSubmitted: false,
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
    addColumn('attachments', 'size', 'integer');
    //addColumn('attachments', 'uploaded', 'integer');
    addColumn('attachments', 'checksum', 'string');
    addColumn('babybook_entries', 'choice_id', 'integer');
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const { answers, attachments } = this.props.milestones;
    const {
      cleanDuplicateAnswersSubmitted,
      confirmImageAttachmentsSubmitted,
    } = this.state;

    if (!session.fetching && session.fetched) {
      this._confirmSessionAttributes();
    }

    if (
      answers.fetched &&
      !isEmpty(answers.data) &&
      attachments.fetched &&
      !cleanDuplicateAnswersSubmitted
    ) {
      this._cleanDuplicateAnswers();
      this.setState({ cleanDuplicateAnswersSubmitted: true });
      return;
    }

    if(
      cleanDuplicateAnswersSubmitted &&
      answers.fetched &&
      attachments.fetched &&
      !isEmpty(attachments.data) &&
      !confirmImageAttachmentsSubmitted
    ) {
      this._confirmAttachments();
      this.setState({ confirmImageAttachmentsSubmitted: true });
    }
  }

  _confirmSessionAttributes = () => {
    const session = this.props.session;
    const { user } = this.props.registration;
    if (!user.fetching && user.fetched && !isEmpty(user.data)) {
      const data = user.data;
      if ((!session.uid && data.email) || (!session.user_id && data.api_id)) {
        this.props.updateSession({
          user_id: data.api_id,
          email: data.email,
          uid: data.email,
          password: data.password,
        });
      }
    }
  };

  _cleanDuplicateAnswers = () => {
    console.log('*** Begin Clean Duplicate Answers');
    const { answers, attachments } = this.props.milestones;
    if (!isEmpty(answers.data)) {
      const ansChoiceIDs = _.groupBy(answers.data, 'choice_id');
      _.map(ansChoiceIDs, ansChoiceID => {
        if (ansChoiceID.length >= 1) {
          ansChoiceID = _.orderBy(ansChoiceID, ['id'], ['desc']);
          const saveAnswerID = ansChoiceID[0].id;
          _.map(ansChoiceID, answer => {
            if (answer.id === saveAnswerID) {
              
              let attChoiceIDs = _.filter(attachments.data, { choice_id: answer.choice_id })
              if (!isEmpty(attChoiceIDs)) {
                attChoiceIDs = _.orderBy(attChoiceIDs, ['id'], ['desc']);
                const saveAttachmentID = attChoiceIDs[0].id;
                _.map(attChoiceIDs, attachment => {
                  if (attachment.id === saveAttachmentID) {
                    attachment.answer_id = answer.id;
                    this.props.updateMilestoneAttachment(attachment);
                  } else {
                    this.props.deleteMilestoneAttachment(attachment.id);
                  }
                });
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
    console.log('*** Begin Confirm Attachment Files');
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
            console.log(`*** attachment not found or otherwise defective - URI: ${item.uri}`);
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

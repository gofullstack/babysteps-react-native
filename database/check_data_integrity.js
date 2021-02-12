import { PureComponent } from 'react';

import isEmpty from 'lodash/isEmpty';
import _ from 'lodash';

import { connect } from 'react-redux';
import {
  fetchMilestoneAnswers,
  deleteMilestoneAnswer,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
} from '../actions/milestone_actions';

import { delay, addColumn } from './common';

class CheckDataIntegrity extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      cleanDuplicateAnswersSubmitted: false,
      confirmImageAttachmentsSubmitted: false,
    };

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
    addColumn('attachments', 'uploaded', 'integer');
    addColumn('attachments', 'checksum', 'string');
    addColumn('babybook_entries', 'choice_id', 'integer');
  }

  componentDidUpdate(prevProps, prevState) {
    const { answers, attachments } = this.props.milestones;
    const {
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
    }
  }

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

const mapStateToProps = ({ milestones }) => ({ milestones });
const mapDispatchToProps = {
  fetchMilestoneAnswers,
  deleteMilestoneAnswer,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CheckDataIntegrity);

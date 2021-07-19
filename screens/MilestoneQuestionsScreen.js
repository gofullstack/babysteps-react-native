import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, Platform, AppState } from 'react-native';

import * as FileSystem from 'expo-file-system';
import { Text, Button } from 'react-native-elements';

import { StackActions } from 'react-navigation';

import _ from 'lodash';

import { isIphoneX } from 'react-native-iphone-x-helper';

import { connect } from 'react-redux';

import {
  updateMilestoneAnswers,
  apiCreateMilestoneAnswer,
  apiUpdateMilestoneAnswers,
  updateMilestoneAttachment,
  updateMilestoneCalendar,
  apiUpdateMilestoneCalendar,
} from '../actions/milestone_actions';
import {
  createBabyBookEntry,
  apiCreateBabyBookEntry,
} from '../actions/babybook_actions';

import { RenderSections } from '../components/milestone_question_sections';
import { UploadMilestoneAttachment } from '../database/sync_milestone_attachments';

import Colors from '../constants/Colors';
import States from '../actions/states';
import CONSTANTS from '../constants';
import VideoFormats from '../constants/VideoFormats';
import ImageFormats from '../constants/ImageFormats';
import AudioFormats from '../constants/AudioFormats';

const { width, height } = Dimensions.get('window');

const itemWidth = width - 30;
const twoButtonWidth = (width / 2) - 30;

class MilestoneQuestionsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return { title: 'Screening Event' };
  };

  // Note that this component stores the active answers and questions in the state of
  // this component during the process of responding to the task.  Both are updated
  // and redux (and remote api) are updated when the user confirms the answers.
  // That means any image or video attachments are kept in both the state of the answers
  // and a full list of attachments.

  constructor(props) {
    super(props);

    const task = this.props.navigation.state.params.task;

    this.state = {
      appState: AppState.currentState,
      task,
      feedback: '',
      trigger: null,
      questionData: [],
      questionDataUpdated: false,
      answers: [],
      attachments: [],
      errorMessage: '',
      confirmed: false,
    };

    this.saveResponse = this.saveResponse.bind(this);
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.setTriggerData();
    this.setQuestionsData();
    this.setAnswerData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { calendar } = this.props.milestones;
    const { task, trigger, questionDataUpdated } = this.state;
    const { params } = this.props.navigation.state;

    // capture notification links with incorrect task
    if (typeof(params.task) !== 'object' || params.task === null) {
      this.props.navigation.navigate('Milestones');
    }

    // need to update sections for new task for remaining functions
    if (params.task.id !== task.id) {
      this.resetDataForTask(params.task, params.feedback);
      return;
    }

    // refresh if new feedback
    if (questionDataUpdated) {
      const entry = _.find(calendar.data, ['task_id', task.id]);
      if (
        trigger.milestone_feedbacks &&
        entry.milestone_feedbacks &&
        trigger.milestone_feedbacks.length !== entry.milestone_feedbacks.length
      ) {
        this.setTriggerData();
      }
    }

    if (!questionDataUpdated) {
      this.setTriggerData();
      this.setQuestionsData();
      this.setAnswerData();
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    const { appState, task } = this.state;
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      this.resetDataForTask(task);
    }
    this.setState({ appState: nextAppState });
  };

  resetDataForTask = (task, trigger, feedback='') => {
    this.setState({
      task,
      feedback,
      trigger,
      questionData: [],
      questionDataUpdated: false,
      answers: [],
      attachments: [],
      confirmed: false,
    });
  };

  setTriggerData = () => {
    const { calendar } = this.props.milestones;
    const { task } = this.state;
    const trigger = _.find(calendar.data, { task_id: task.id });
    this.setState({ trigger });
  };

  setQuestionsData = () => {
    const {
      task_attachments,
      sections,
      questions,
      option_groups,
      choices,
      calendar,
    } = this.props.milestones;
    const { task, trigger } = this.state;

    if (
      !_.isEmpty(sections.data) &&
      !_.isEmpty(questions.data) &&
      !_.isEmpty(choices.data)
    ) {

      let attachment_url = null;
      const task_attachment = _.find(task_attachments, { task_id: task.id });
      if (!_.isEmpty(task_attachment)) {
        attachment_url = task_attachment.attachment_url;
      }

      let questionData = [];

      let sectionsSet = _.filter(sections.data, {'task_id': task.id});
      sectionsSet = _.sortBy(sectionsSet, ['position']);
      _.forEach(sectionsSet, section => {
        section.attachment_url = attachment_url;
        const questionSet = [];
        let sectionQuestions = _.filter(questions.data, { 'section_id': section.id })
        sectionQuestions = _.sortBy(sectionQuestions, ['position']);

        _.forEach(sectionQuestions, question => {
          question.rn_input_type = null;
          const option_group = _.find(option_groups.data, { 'id': question.option_group_id })
          if (!_.isEmpty(option_group)) question.rn_input_type = option_group.rn_input_type;

          let questionChoices = _.filter(choices.data, {'question_id': question.id})

          questionChoices = _.sortBy(questionChoices, ['position']);
          _.forEach(questionChoices, choice => {
            choice.section_id = section.id;
            choice.rn_input_type = null;
            const option_group = _.find(option_groups.data, { 'id': choice.option_group_id })
            if (!_.isEmpty(option_group)) choice.rn_input_type = option_group.rn_input_type;
          });
          question.choices = questionChoices;
        }); // forEach sectionQuestions

        questionData = [
          ...questionData,
          { ...section, questions: sectionQuestions },
        ];

      }); // forEach sectionSet

      this.setState({ questionData, questionDataUpdated: true });
    }
  };

  setAnswerData = () => {
    const { answers, attachments } = this.props.milestones;
    const { task } = this.state;
    let lastAnswers = _.filter(answers.data, { 'task_id': task.id });
    lastAnswers = _.sortBy(lastAnswers, ['section_id', 'question_id', 'choice_id']);
    this.setState({ answers: lastAnswers, attachments: attachments.data });
  };

  saveResponse = (choice, response, options = {}) => {
    const { user, respondent, subject } = this.props.registration;
    const { task, answers } = this.state;

    const newAnswers = [];

    const format = options.format;
    const preserve = options.preserve;

    if (format === 'single') {
      // reset all answers to false for this question
      _.map(answers, answer => {
        if (
          answer.question_id === choice.question_id &&
          answer.choice_id !== choice.id
        ) {
          answer.answer_boolean = false;
          // include answers in update
          newAnswers.push(answer);
        }
      });
    }

    // check for response in this session
    let answer = _.find(answers, {choice_id: choice.id});

    // reset response unless require explanation
    if (!preserve) {
      answer = {
        ...answer,
        answer_boolean: null,
        answer_datetime: null,
        answer_numeric: null,
        answer_text: null,
      };
    }

    // update object with data
    answer = {
      ...answer,
      user_id: user.data.id,
      respondent_id: respondent.data.id,
      subject_id: subject.data.id,
      milestone_id: task.milestone_id,
      task_id: task.id,
      section_id: choice.section_id,
      question_id: choice.question_id,
      choice_id: choice.id,
      score: choice.score,
      pregnancy: 0,
      ...response,
    };

    delete answer.attachments;

    if (response.attachments) {
      answer.answer_boolean = true;
      this.mapAttachmentsAsync(answer, choice, response.attachments);
    } // response.attachments

    newAnswers.push(answer);

    // update answers
    _.map(newAnswers, newAnswer => {
      const index = _.findIndex(answers, { choice_id: newAnswer.choice_id });
      if (index === -1) {
        // not in answers yet
        answers.push(newAnswer);
      } else {
        // replace in answers
        answers.splice(index, 1, newAnswer);
      }
    });

    this.setState({ answers });
  };

  mapAttachmentsAsync = async (answer, choice, newAttachments) => {
    const { user, subject } = this.props.registration;
    let { attachments } = this.state;

    // sort with highest id first
    attachments = _.reverse(_.sortBy(attachments, 'id'));
    // then find first match (with highest id)
    const oldAttachment = _.find(attachments, { choice_id: choice.id });
    // remove from collection
    attachments = _.reject(attachments, att => {
      if (_.isEmpty(att)) return true;
      if (att.choice_id === choice.id) return true;
    });

    await _.map(newAttachments, async attachment => {
      let user_id = user.data.id;
      if (!user_id) {
        user_id = user.data.api_id;
      }
      let subject_id = subject.data.id;
      if (!subject_id) {
        subject_id = subject.data.api_id;
      }
      let newAttachment = {
        ...oldAttachment,
        user_id,
        subject_id,
        choice_id: choice.id,
        title: attachment.title,
        width: attachment.width,
        height: attachment.height,
        uri: null,
      };

      newAttachment.filename = attachment.uri.substring(
        attachment.uri.lastIndexOf('/') + 1,
        attachment.uri.length,
      );

      const fileType = attachment.uri.substring(
        attachment.uri.lastIndexOf('.') + 1,
        attachment.uri.length,
      );

      switch (attachment.file_type) {
        case 'file_image':
          newAttachment.content_type = ImageFormats[fileType];
          break;
        case 'file_video':
        case 'file_video_frustration':
          newAttachment.content_type = VideoFormats[fileType];
          break;
        case 'file_audio':
          newAttachment.content_type = AudioFormats[fileType];
          break;
        default:
          newAttachment.content_type = '';
      }

      // confirm physical file
      let resultFile = await FileSystem.getInfoAsync(attachment.uri);

      if (!resultFile.exists) {
        console.log(`Error: file doesn't exist, attachment not saved: Choice ID: ${choice.id};  File Name: ${attachment.filename}`);
        this.setState({errorMessage: 'Error: Attachment Not Saved'});
        return;
      }

      newAttachment.uri = CONSTANTS.ATTACHMENTS_DIRECTORY + '/' + newAttachment.filename;

      // move file from camera cache to app cache
      const newUri = FileSystem.documentDirectory + newAttachment.uri;
      await FileSystem.copyAsync({ from: attachment.uri, to: newUri });

      // confirm file
      resultFile = await FileSystem.getInfoAsync(newUri, {
        size: true,
        md5: true,
      });

      if (!resultFile.exists) {
        console.log(`Error: attachment not copied: ${newAttachment.filename}`);
        this.setState({errorMessage: 'Error: Attachment Not Saved'});
        return;
      }

      _.assign(newAttachment, {
        size: resultFile.size,
        checksum: resultFile.md5,
      });

      attachments.push(newAttachment);

      this.updateAttachmentState(attachments);
    }); // map attachments
  };

  updateAttachmentState = attachments => {
    this.setState({ attachments });
  };

  handleConfirm = () => {
    const session = this.props.session;
    const { task, answers, attachments } = this.state;
    const { questions, choices, calendar } = this.props.milestones;
    const { user, subject } = this.props.registration;
    const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;

    // TODO validation
    // TODO move to next section if more than one section in this task
    // TOTO don't mark task complete if any sections are incomplete
    this.setState({ confirmed: true });

    this.props.updateMilestoneAnswers(answers);

    const entry = _.find(calendar.data, { task_id: task.id });
    const completed_at = new Date().toISOString();
    if (!_.isEmpty(entry)) {
      this.props.updateMilestoneCalendar(task.id, { completed_at });
    }

    if (inStudy) {
      this.props.apiUpdateMilestoneAnswers(session, answers);

      // mark calendar entry as complete on api
      const trigger = _.find(calendar.data, ['task_id', task.id]);
      if (trigger && trigger.id) {
        this.props.apiUpdateMilestoneCalendar(trigger.id, { milestone_trigger: { completed_at } });
      }
    }

    // save attachments
    if (!_.isEmpty(attachments)) {
      _.map(attachments, attachment => {
        const choice = _.find(choices.data, ['id', attachment.choice_id]);

        // cover of babybook will only be baby's face from overview timeline
        let cover = 0;
        if (choice && choice.overview_timeline === 'post_birth') {
          cover = true;
        }

        this.props.updateMilestoneAttachment(attachment);

        if (inStudy) {
          let user_id = user.data.id;
          if (!user_id){
            user_id = user.data.api_id;
          }
          let subject_id = subject.data.id;
          if (!subject_id) {
            subject_id = subject.data.api_id;
          }
          UploadMilestoneAttachment(user_id, subject_id, attachment);
        }
        if (
          attachment.content_type &&
          (attachment.content_type.includes('video') ||
            attachment.content_type.includes('image'))
        ) {
          const data = { title: null, detail: null, cover };
          this.props.createBabyBookEntry(data, attachment);
          //this.props.apiCreateBabyBookEntry(session, data, attachment);
        }
      });
    }

    let message = '';
    const taskQuestions = _.filter(questions.data, { task_id: task.id });
    const unansweredQuestions = _.filter(taskQuestions, question => {
      return _.find(answers, { question_id: question.id }) === undefined;
    });
    this.props.updateMilestoneCalendar(task.id, {
      questions_remaining: unansweredQuestions.length,
    });

    if (unansweredQuestions.length > 0) {
      message = 'Please note that not all questions were completed.';
    }
    // add condolences message to confirmation screen
    if (task.id === CONSTANTS.TASK_BIRTH_QUESTIONAIRE_ID) {
      const answer = _.find(answers, ['choice_id', CONSTANTS.CHOICE_BABY_ALIVE_ID]);
      if (answer && answer.answer_boolean) {
        message =
          "We're so sorry to hear of your loss. We appreciate the contribution you have made to BabySteps.";
      }
    }

    this.props.navigation.navigate('MilestoneQuestionConfirm', { message });
  };

  render() {
    const { navigation } = this.props;
    const {
      confirmed,
      task,
      feedback,
      trigger,
      questionData,
      answers,
      attachments,
      errorMessage,
    } = this.state;

    return (
      <View style={{ height }}>
        <View style={styles.listContainer}>
          <Text style={styles.taskHeader}>{task.name}</Text>
          <RenderSections
            task={task}
            feedback={feedback}
            trigger={trigger}
            questionData={questionData}
            answers={answers}
            attachments={attachments}
            errorMessage={errorMessage}
            extraData={this.state}
            saveResponse={this.saveResponse}
            navigation={navigation}
          />
        </View>
        <View
          style={[
            styles.buttonContainer,
            Platform.OS === 'android'
              ? styles.buttonContainerAndroid
              : styles.buttonContainerIOS,
          ]}
        >
          <Button
            color={Colors.grey}
            buttonStyle={styles.buttonOneStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={() => {
              navigation.dispatch(StackActions.popToTop());
            }}
            title="Cancel"
          />
          <Button
            color={Colors.pink}
            buttonStyle={styles.buttonTwoStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={this.handleConfirm}
            title="Mark Completed"
            disabled={confirmed}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listContainer: {
    flexDirection: 'column',
    backgroundColor: Colors.background,
    paddingBottom: 280,
  },
  taskHeader: {
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 15,
    color: Colors.white,
    width,
    backgroundColor: Colors.mediumGrey,
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGrey,
    backgroundColor: Colors.background,
    position: 'absolute',
  },
  buttonContainerAndroid: {
    bottom: 150,
  },
  buttonContainerIOS: {
    bottom: isIphoneX() ? 172 : 110,
  },
  buttonTitleStyle: {
    fontWeight: '900',
  },
  buttonOneStyle: {
    flex: 1,
    width: twoButtonWidth,
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 5,
  },
  buttonTwoStyle: {
    flex: 1,
    width: twoButtonWidth,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
  },
});

const mapStateToProps = ({ session, milestones, registration }) => ({
  session,
  milestones,
  registration,
});
const mapDispatchToProps = {
  updateMilestoneAnswers,
  apiCreateMilestoneAnswer,
  apiUpdateMilestoneAnswers,
  updateMilestoneAttachment,
  createBabyBookEntry,
  updateMilestoneCalendar,
  apiUpdateMilestoneCalendar,
  apiCreateBabyBookEntry,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MilestoneQuestionsScreen);

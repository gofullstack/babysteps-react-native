import React, { Component } from 'react';
import { View, Image, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import _ from 'lodash';

import NumberConverter from 'number-to-words';

import { connect } from 'react-redux';
import {
  fetchMilestoneSections,
  resetMilestoneQuestions,
  fetchMilestoneQuestions,
  resetMilestoneChoices,
  fetchMilestoneChoices,
  resetMilestoneAnswers,
  fetchMilestoneAnswers,
  updateMilestoneAnswers,
  apiCreateMilestoneAnswer,
  apiUpdateMilestoneAnswers,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
  fetchOverViewTimeline,
  updateMilestoneCalendar,
  apiUpdateMilestoneCalendar,
  fetchMilestoneCalendar,
} from '../actions/milestone_actions';
import {
  fetchUser,
  fetchRespondent,
  fetchSubject,
} from '../actions/registration_actions';

import { RenderChoices } from '../components/milestone_question_components';

import Colors from '../constants/Colors';
import States from '../actions/states';

const { width } = Dimensions.get('window');

const itemWidth = width - 40;
const twoButtonWidth = (width / 2) - 30;

class MilestonePregnancyHistoryScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const section = navigation.getParam('section', {title: ''});
    return { title: section.title };
  };

  constructor(props) {
    super(props);
    this.state = {
      task_id: null,
      section: {},
      questionsFetched: false,
      questionIDs: [],
      firstQuestion: {},
      answersFetched: false,
      attachmentsFetched: false,
      numberOfPregnancies: 0,
      currentPregnancy: 0,
      answers: [],
      attachments: [],
      errorMessage: '',
      showConfirm: false,
      confirmed: false,
    };

    this.props.fetchUser();
    this.props.fetchRespondent();
    this.props.fetchSubject();
    this.saveResponse = this.saveResponse.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const sections = nextProps.milestones.sections;
    const questions = nextProps.milestones.questions;
    const choices = nextProps.milestones.choices;
    return !sections.fetching && !questions.fetching && !choices.fetching;
  }

  componentDidUpdate(prevProps, prevState) {
    const task = this.props.navigation.state.params.task;
    const sections = this.props.milestones.sections;
    const questions = this.props.milestones.questions;
    const answers = this.props.milestones.answers;
    if (task.id !== prevState.task_id) {
      this._resetDataForTask(task);
      return; // need to update sections for the task for remaining functions
    }
    if (sections.fetched && !_.isEmpty(sections.data)) {
      this._saveSectionsData(sections);
    }
    if (questions.fetched && !_.isEmpty(questions.data)) {
      this._saveQuestionsData(questions);
    }
    if (answers.fetched) {
      this._saveAnswersData(answers);
    }
  }

  _resetDataForTask = task => {
    this.setState({
      task_id: task.id,
      section: [],
      questionsFetched: false,
      questionIDs: [],
      firstQuestion: {},
      answersFetched: false,
      attachmentsFetched: false,
      numberOfPregnancies: 0,
      currentPregnancy: 0,
      answers: [],
      attachments: [],
      showNextPregnancy: false,
      showConfirm: false,
      confirmed: false,
    });
    this.props.fetchMilestoneSections({ task_id: task.id });
  };

  _saveSectionsData = sections => {
    if (_.isEmpty(this.state.section)) {
      // default to first section
      // TODO extend UI to allow for multiple sections
      const section = sections.data[0];
      const section_id = section.id;
      this.setState({ section });
      this.props.navigation.setParams({ section });
      this.props.fetchMilestoneQuestions({ section_id });
      this.props.resetMilestoneChoices();
      this.props.fetchMilestoneAnswers({ section_id });
      //this.props.fetchMilestoneAttachments({ section_id: section.id });
    }
  };

  _saveQuestionsData = questions => {
    const { firstQuestion, questionsFetched } = this.state;
    if (_.isEmpty(firstQuestion) || !questionsFetched) {
      this.setState({ firstQuestion: questions.data[0] });
      // question IDs for repeat questions
      const questionIDs = _.map(questions.data.slice(1), 'id');
      this.setState({ questionsFetched: true, questionIDs });
      const question_ids = _.map(questions.data, 'id');
      this.props.fetchMilestoneChoices({ question_ids });
    }
  };

  _saveAnswersData = answers => {
    const answersFetched = this.state.answersFetched;
    if (_.isEmpty(answers) || !answersFetched) {
      let numberOfPregnancies = this.state.numberOfPregnancies;
      let currentPregnancy = this.state.currentPregnancy;
      let showNextPregnancy = this.state.showNextPregnancy;
      const firstQuestion = this.state.firstQuestion;
      if (!_.isEmpty(firstQuestion)) {
        const answer = _.find(answers.data, ['question_id', firstQuestion.id]);
        if (answer) {
          numberOfPregnancies = Math.trunc(answer.answer_text);
          currentPregnancy = 1;
          showNextPregnancy = true;
        }
      }

      this.setState({
        answers: answers.data,
        answersFetched: true,
        numberOfPregnancies,
        currentPregnancy,
        showNextPregnancy,
      });
    }
  };

  renderItem = item => {
    const question = item.item;
    const question_number = _.isEmpty(question.question_number)
      ? String(question.position)
      : question.question_number;
    const title = `${question_number}. ${question.title}`;
    return (
      <View style={styles.questionContainer}>
        {question.attachment_url && (
          <Image
            style={styles.image}
            source={{ uri: question.attachment_url }}
            resizeMethod="scale"
            resizeMode="contain"
          />
        )}
        <View style={styles.questionLeft}>
          <Text style={styles.question}>{title}</Text>
        </View>
        <RenderChoices
          question={question}
          answers={this.state.answers}
          pregnancy={this.state.currentPregnancy}
          attachments={this.state.attachments}
          saveResponse={this.saveResponse}
          errorMessage={this.state.errorMessage}
        />
      </View>
    );
  };

  saveResponse = (choice, response, options = {}) => {
    let answer = {};
    const answers = [...this.state.answers];
    const format = options.format;
    const preserve = options.preserve;

    if (format === 'single') {
      // delete all previous answers for this question if only one response allowed.
      _.remove(answers, ans => {
        if (preserve) {
          // preserve answer if adding attribute
          return (
            ans.question_id === choice.question_id &&
            ans.choice_id !== choice.id
          );
        }
        return ans.question_id === choice.question_id;
      });
    }

    const user = this.props.registration.user;
    const subject = this.props.registration.subject;
    const apiSubject = this.props.registration.apiSubject;
    const respondent = this.props.registration.respondent;
    const firstQuestion = this.props.milestones.questions.data[0];
    const currentPregnancy = this.state.currentPregnancy;

    const index = _.findIndex(answers, { choice_id: choice.id, pregnancy: currentPregnancy });

    if (index === -1) {
      if (format === 'single' && !response.answer_boolean) {
        // Do not save response if only single response allowed and answer boolean false
        return null;
      }
      answer = {
        section_id: this.state.section.id,
        question_id: choice.question_id,
        choice_id: choice.id,
        score: choice.score,
        pregnancy: currentPregnancy,
      };
    } else {
      answer = _.find(answers, ['choice_id', choice.id]);
      _.remove(answers, ['choice_id', choice.id]);
    } // index = -1

    if (!_.isEmpty(user.data)) {
      answer.user_id = user.data.id;
      answer.user_api_id = user.data.api_id;
    }
    if (!_.isEmpty(respondent.data)) {
      answer.respondent_id = respondent.data.id;
      answer.respondent_api_id = respondent.data.api_id;
    }
    if (!_.isEmpty(subject.data)) {
      answer.subject_id = subject.data.id;
      answer.subject_api_id = subject.data.api_id;
    }
    _.assign(answer, response);
    answers.push(answer);
    // first question
    if (choice.question_id === firstQuestion.id) {
      let numberOfPregnancies = 1;
      if (answer && answer.answer_text) {
        numberOfPregnancies = Math.trunc(answer.answer_text);
      }
      const currentPregnancy = 1;
      let showConfirm = false;
      let showNextPregnancy = true;
      if (numberOfPregnancies === 1) {
        showConfirm = true;
        showNextPregnancy = false;
      }
      this.setState({
        numberOfPregnancies,
        currentPregnancy,
        showNextPregnancy,
        showConfirm,
        answers,
      });
    } else {
      this.setState({ answers });
    }
  };

  handleConfirm = () => {
    const section = this.state.section;
    const answers = this.state.answers;
    const session = this.props.session;
    const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;
    // TODO validation
    // TODO move to next section if more than one section in this task
    // TOTO don't mark task complete if any sections are incomplete

    this.setState({ confirmed: true });

    this.props.updateMilestoneAnswers(section, answers);
    const completed_at = new Date().toISOString();
    this.props.updateMilestoneCalendar(section.task_id, { completed_at });

    if (inStudy) {
      this.props.apiUpdateMilestoneAnswers(session, section.id, answers);
      const calendar = _.find(this.props.milestones.calendar.data, ['task_id', section.task_id]);
      if (calendar && calendar.id) {
        const completed_at = new Date().toISOString();
        this.props.apiUpdateMilestoneCalendar(calendar.id, {milestone_trigger: {completed_at}});
      }
    }
    this.props.fetchMilestoneCalendar();
    this.props.navigation.navigate('MilestoneQuestionConfirm');
  };

  handleNextPregnancy = () => {
    const section = this.state.section;
    const answers = this.state.answers;
    const session = this.props.session;
    const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;
    const currentPregnancy = this.state.currentPregnancy + 1;
    const numberOfPregnancies = this.state.numberOfPregnancies;
    let showConfirm = false;
    let showNextPregnancy = true;
    if (currentPregnancy === numberOfPregnancies) {
      showConfirm = true;
      showNextPregnancy = false;
    }
    // save answers when finished with pregnancy
    this.props.updateMilestoneAnswers(section, answers);
    if (inStudy) {
      this.props.apiUpdateMilestoneAnswers(session, section.id, answers);
    }
    this.setState({ currentPregnancy, showConfirm, showNextPregnancy });
    this.scroll.scrollTo({ x: 0, y: 0, animated: true });
  };

  render() {
    const questions = this.props.milestones.questions;
    const choices = this.props.milestones.choices;
    const numberOfPregnancies = this.state.numberOfPregnancies;
    const currentPregnancy = this.state.currentPregnancy;
    let currentQuestions = [];
    if (!_.isEmpty(questions.data) && numberOfPregnancies === 0) {
      currentQuestions = questions.data.slice(0, 1);
    } else {
      currentQuestions = questions.data.slice(1);
    }
    const data = _.map(currentQuestions, question => {
      return _.extend({}, question, {
        choices: _.filter(choices.data, ['question_id', question.id]),
      });
    });

    return (
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableResetScrollToCoords={false}
        enableAutomaticScroll
        enableOnAndroid
        extraScrollHeight={50}
        //stickyHeaderIndices={[0]}
        innerRef={ref => {this.scroll = ref}}
      >
        {numberOfPregnancies > 0 && (
          <Text style={styles.pregnancyTitle}>
            {_.capitalize(NumberConverter.toWordsOrdinal(currentPregnancy))} Pregnancy
          </Text>
        )}
        <View style={styles.listContainer}>
          <FlatList
            renderItem={this.renderItem}
            data={data}
            keyExtractor={item => String(item.id)}
          />
        </View>

        {this.state.questionsFetched && (
          <View style={styles.buttonContainer}>
            <Button
              color={Colors.grey}
              buttonStyle={styles.buttonOneStyle}
              titleStyle={styles.buttonTitleStyle}
              onPress={() => this.props.navigation.navigate('Overview')}
              title="Cancel"
            />
            {this.state.showNextPregnancy && (
              <Button
                color={Colors.pink}
                buttonStyle={styles.buttonTwoStyle}
                titleStyle={styles.buttonTitleStyle}
                onPress={this.handleNextPregnancy}
                title="Next Pregnancy"
              />
            )}
            {this.state.showConfirm && (
              <Button
                color={Colors.pink}
                buttonStyle={styles.buttonTwoStyle}
                titleStyle={styles.buttonTitleStyle}
                onPress={this.handleConfirm}
                title="Confirm"
                disabled={this.state.confirmed}
              />
            )}
          </View>
        )}
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  pregnancyTitle: {
    fontSize: 16,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    color: Colors.tint,
    backgroundColor: Colors.lightGrey,
    fontWeight: '900',
  },
  listContainer: {
    flex: 1,
  },
  questionContainer: {
    flexDirection: 'column',
    padding: 5,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  questionLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: itemWidth,
  },
  question: {
    fontSize: 14,
    paddingVertical: 2,
    paddingLeft: 5,
    color: Colors.tint,
  },
  image: {
    flex: 1,
    width: itemWidth,
    height: itemWidth * 0.66,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    //maxHeight: 95,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonTitleStyle: {
    fontWeight: '900',
  },
  buttonOneStyle: {
    flex: 1,
    width: twoButtonWidth,
    //maxHeight: 95,
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 5,
  },
  buttonTwoStyle: {
    flex: 1,
    width: twoButtonWidth,
    //maxHeight: 95,
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
  fetchUser,
  fetchRespondent,
  fetchSubject,
  fetchMilestoneSections,
  resetMilestoneQuestions,
  fetchMilestoneQuestions,
  resetMilestoneChoices,
  fetchMilestoneChoices,
  resetMilestoneAnswers,
  fetchMilestoneAnswers,
  updateMilestoneAnswers,
  apiCreateMilestoneAnswer,
  apiUpdateMilestoneAnswers,
  fetchMilestoneAttachments,
  updateMilestoneAttachment,
  fetchOverViewTimeline,
  updateMilestoneCalendar,
  apiUpdateMilestoneCalendar,
  fetchMilestoneCalendar,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MilestonePregnancyHistoryScreen);

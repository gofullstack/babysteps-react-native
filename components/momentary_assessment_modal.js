import React, { Component } from 'react';
import { Text, View, Image, Modal, Dimensions, StyleSheet } from 'react-native';
import { ButtonGroup } from 'react-native-elements';

import _ from 'lodash';

import { connect } from 'react-redux';
import {
  fetchUser,
  fetchRespondent,
  fetchSubject,
} from '../actions/registration_actions';
import {
  createMilestoneAnswer,
  apiCreateMilestoneAnswer,
  fetchMilestoneCalendar,
  updateMilestoneCalendar,
  apiUpdateMilestoneCalendar,
} from '../actions/milestone_actions';
import {
  fetchMomentaryAssessment,
  hideMomentaryAssessment,
} from '../actions/notification_actions';

import Colors from '../constants/Colors';
import States from '../actions/states';

const { width, height } = Dimensions.get('window');
const modalWidth = width * 0.9;
const modalHeight = height * 0.6;
const buttonWidth = modalWidth * 0.8;

class MomentaryAssessment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedIndex: null,
      response_scale: 'one_to_five',
      momentaryAssessmentLoaded: false,
    };
    this.props.fetchUser();
    this.props.fetchRespondent();
    this.props.fetchSubject();
    this.props.fetchMilestoneCalendar();
  }

  componentDidUpdate(prevProps, prevState) {
    const notifications = this.props.notifications;
    const momentary_assessment = notifications.momentary_assessment;
    const momentaryAssessmentLoaded = this.state.momentaryAssessmentLoaded;
    if (notifications.show_momentary_assessment && !momentaryAssessmentLoaded) {
      this._handleShowMomentaryAssessment(momentary_assessment);
    }
  }

  _handleShowMomentaryAssessment = momentary_assessment => {
    if (!momentary_assessment.fetching && !momentary_assessment.fetched) {
      this.props.fetchMomentaryAssessment({ task_id: momentary_assessment.data.task_id });
      if (momentary_assessment.data.response_scale) {
        this.setState({ selectedIndex: null, response_scale: momentary_assessment.data.response_scale });
      }
    }
  };

  _handleOnPress = selectedIndex => {
    this.setState({selectedIndex});
    const user = this.props.registration.user.data;
    const respondent = this.props.registration.respondent.data;
    const subject = this.props.registration.subject.data;
    const momentary_assessment = this.props.notifications.momentary_assessment.data;
    const calendars = this.props.milestones.calendar.data;
    const session = this.props.session;
    const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;
    const answer = {
      user_id: user.id,
      user_api_id: user.api_id,
      respondent_id: respondent.id,
      respondent_api_id: respondent.api_id,
      subject_id: subject.id,
      subject_api_id: subject.api_id,
      choice_id: momentary_assessment.choice_id,
      answer_numeric: selectedIndex + 1,
      notified_at: momentary_assessment.notify_at,
    };
    const completed_at = new Date().toISOString();

    this.props.createMilestoneAnswer(answer);
    this.props.updateMilestoneCalendar(momentary_assessment.task_id, { completed_at });

    if (inStudy) {
      this.props.apiCreateMilestoneAnswer(session, answer);
      const calendar = _.find(calendars, ['task_id', momentary_assessment.task_id]);
      if (calendar && calendar.id) {
        this.props.apiUpdateMilestoneCalendar(calendar.id, {milestone_trigger: { completed_at }});
      }
    }

    setTimeout(() => {
      this.props.hideMomentaryAssessment(momentary_assessment, answer);
      this.setState({ selectedIndex: null });
    }, 2000);
  };

  getModalContent = task => {
    const selectedIndex = this.state.selectedIndex;
    if(selectedIndex !== null){
      return this.getThankYouContent(selectedIndex);
    }
    return this.getTaskContent(task);
  };

  getThankYouContent = selectedIndex => {
    return (
      <View>
        {Math.trunc(selectedIndex) < 3 && (
          <Image
            style={styles.image}
            source={require('../assets/images/thank_you_balloons.png')}
          />
        )}
        <Text>Thank you for your response!</Text>
      </View>
    );
  };

  getTaskContent = task => {
    return (
      <View>
        <Image
          style={styles.image}
          source={require('../assets/images/exclaim.png')}
        />
        <Text>{task && task.title}</Text>
      </View>
    );
  };

  render() {
    const showModal = this.props.notifications.show_momentary_assessment;
    const task = this.props.notifications.momentary_assessment.data;
    let buttons = ['1', '2', '3', '4', '5'];
    if (this.state.response_scale === 'one_to_ten') {
      buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    }
    const { selectedIndex } = this.state;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => {}}
      >
        <View
          style={styles.container}
          ref={r => (this.container = r)}
          //          onLayout={this.onLayout}
        >
          <View style={styles.modal}>
            {this.getModalContent(task)}
            <ButtonGroup
              onPress={this._handleOnPress}
              selectedIndex={selectedIndex}
              buttons={buttons}
              buttonStyle={{ backgroundColor: Colors.background }}
              textStyle={{ color: Colors.pink }}
              selectedTextStyle={{ color: Colors.darkGreen, fontWeight: '900' }}
              selectedButtonStyle={{backgroundColor: Colors.lightGreen, borderColor: Colors.darkGreen}}
              innerBorderStyle={{ width: 2, color: Colors.pink }}
              containerStyle={{ borderWidth: 2, borderColor: Colors.pink, marginTop: 20 }}
            />
            <View style={styles.helper}>
              <Text style={styles.notAtAll}>Not at all</Text>
              <Text style={styles.very}>Very</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: modalWidth,
    height: modalHeight,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.grey,
  },
  image: {
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  helper: {
    flexDirection: 'row',
    width: '95%',
  },
  notAtAll: {
    flex: 1,
    fontSize: 12,
    color: Colors.grey,
  },
  very: {
    flex: 1,
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'right',
  },
});

const mapStateToProps = ({
  session,
  milestones,
  registration,
  notifications,
}) => ({
  session,
  milestones,
  registration,
  notifications,
});
const mapDispatchToProps = {
  fetchUser,
  fetchRespondent,
  fetchSubject,
  fetchMomentaryAssessment,
  createMilestoneAnswer,
  apiCreateMilestoneAnswer,
  fetchMilestoneCalendar,
  updateMilestoneCalendar,
  apiUpdateMilestoneCalendar,
  hideMomentaryAssessment,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MomentaryAssessment);

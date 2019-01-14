import React, { Component } from 'react';
import { Text, View, Image, Modal, Dimensions, StyleSheet } from 'react-native';
import { ButtonGroup } from 'react-native-elements';

import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import { createMilestoneAnswer, apiCreateMilestoneAnswer } from '../actions/milestone_actions';
import { fetchMomentaryAssessment, hideMomentaryAssessment } from '../actions/notification_actions';

import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const modalWidth = width * 0.9;
const modalHeight = height * 0.6;
const buttonWidth = modalWidth * 0.8;

class MomentaryAssessment extends Component {
  state = {
    selectedIndex: null,
    response_scale: 'one_to_five',
  };

  componentWillReceiveProps(nextProps, nextState) {
    const notifications = nextProps.notifications;
    const milestones = nextProps.milestones;
    console.log("Notification:",notifications);
    if (notifications.show_momentary_assessment) {
      if (!notifications.momentary_assessment.fetching && !notifications.momentary_assessment.fetched) {
        this.props.fetchMomentaryAssessment({task_id: notifications.momentary_assessment.data.task_id});
        if (notifications.momentary_assessment.data.response_scale) {
          this.setState({response_scale: notifications.momentary_assessment.data.response_scale});
        }
      }
    }
  }

  _handleOnPress = (selectedIndex) => {
    this.setState({selectedIndex});
    const user = this.props.registration.user.data;
    const respondent = this.props.registration.respondent.data;
    const subject = this.props.registration.subject.data;
    const momentary_assessment = this.props.notifications.momentary_assessment.data;
    const session = this.props.session;
    const answer = {
      user_id: user.id,
      user_api_id: user.api_id,
      respondent_id: respondent.id,
      respondent_api_id: respondent.api_id,
      subject_id: subject.id,
      subject_api_id: subject.api_id,
      choice_id: momentary_assessment.choice_id,
      answer_numeric: selectedIndex + 1,
    };

    this.props.hideMomentaryAssessment(momentary_assessment, answer);
    this.props.createMilestoneAnswer(answer);
    this.props.apiCreateMilestoneAnswer(session, answer);
  }

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
            <Image
              style={styles.image}
              source={require('../assets/images/exclaim.png')}
            />
            <Text>{task && task.title}</Text>
            <ButtonGroup
              onPress={this._handleOnPress}
              selectedIndex={selectedIndex}
              buttons={buttons}
              buttonStyle={{ backgroundColor: Colors.background }}
              textStyle={{ color: Colors.pink }}
              selectedTextStyle={{ color: Colors.pink, fontWeight: '900' }}
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
  fetchMomentaryAssessment,
  createMilestoneAnswer,
  apiCreateMilestoneAnswer,
  hideMomentaryAssessment,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MomentaryAssessment);

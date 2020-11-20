import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Notifications } from 'expo';

import find from 'lodash/find';

import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';

import { connect } from 'react-redux';

import {
  resetApiMilestoneCalendar,
  fetchMilestoneCalendar,
  resetApiMilestones,
  fetchMilestoneGroups,
  fetchMilestoneTasks,
  fetchOverViewTimeline,
} from '../actions/milestone_actions';

import { fetchConsent, fetchSubject, updateSubject } from '../actions/registration_actions';

import Colors from '../constants/Colors';

import OverviewTimeline from '../components/overview_timeline';
import OverviewScreeningEvents from '../components/overview_screening_events';
import OverviewMilestones from '../components/overview_milestones';

const { width, height } = Dimensions.get('window');

const wp = (percentage, direction) => {
  const value = (percentage * direction) / 100;
  return Math.round(value);
};

const containerHeight = wp(32, height);
const timelineHeight = wp(26, height);

class OverviewScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      testNotificationCreated: false,
    };

    this.props.fetchSubject();
    //this.props.resetApiMilestoneCalendar(); // I am commenting this out because of the following:
    //  1. After the last registration form is finished and the subject is registered, apiNewMilestoneCalendar is called.
    //  2. The overview screen then loads, and the above this.props.resetApiMilestoneCalendar is called, which resets
    //     milestone.api_calendar.fetching to false
    //  3. overview_screening_events.js checks to see if we have calendar data, and if milestone.api_calendar.fetching is true.
    //  4. milestone.api_calendar.fetching is false because we reset it above (step 2), so a new request to apiCreateMilestoneCalendar is issued.
    this.props.fetchMilestoneCalendar();
    this.props.resetApiMilestones();
    this.props.fetchMilestoneGroups();
    this.props.fetchMilestoneTasks();
    this.props.fetchOverViewTimeline();
    //this.props.updateSubject({expected_date_of_birth: '2019-07-01', date_of_birth: ''})
    // only uncomment after registering when data is available
    //this.testNotification({momentary_assessment: true});
  }

  componentDidMount() {
    const { consent_last_updated_at, consent_last_version_id } = this.props.session;
    const consent = this.props.registration.consent.data;
     const { navigate } = this.props.navigation;
    if (consent_last_updated_at && consent_last_version_id !== consent.version_id) {
      navigate('UpdateConsent');
    } else {
      navigate('Overview');
    }
  }

  testNotification(noticeType = null) {
    const tasks = this.props.milestones.tasks;
    const milestones = this.props.milestones.milestones;
    if (!tasks.fetching && isEmpty(tasks.data)) {
      this.props.fetchMilestoneTasks();
      return;
    }
    let task, milestone = {};
    let filteredMilestones = filter(milestones.data, {
      momentary_assessment: noticeType.momentary_assessment,
    });
    let index = Math.floor(Math.random() * filteredMilestones.length);
    milestone = filteredMilestones[index];

    task = find(tasks.data, {milestone_id: milestone.id});

    if (milestone && task) {
      Notifications.presentLocalNotificationAsync({
        title: milestone.title,
        body: task.name,
        data: {
          task_id: task.id,
          title: milestone.title,
          body: task.name,
          momentary_assessment: task.momentary_assessment,
          response_scale: task.response_scale,
          type: 'info',
        },
      });
      this.setState({testNotificationCreated: true});
    } // task
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.timeline_container}>
          <OverviewTimeline navigation={this.props.navigation} />
        </View>

        <View style={styles.slider_container}>
          <OverviewScreeningEvents navigation={this.props.navigation} />
        </View>

        <View style={styles.slider_container}>
          <OverviewMilestones navigation={this.props.navigation} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  timeline_container: {
    height: timelineHeight,
    borderTopWidth: 2,
    borderTopColor: Colors.lightGrey,
  },
  slider_container: {
    height: containerHeight,
    borderTopWidth: 2,
    borderTopColor: Colors.lightGrey,
  },
});

const mapStateToProps = ({ session, registration, milestones }) => ({
  session,
  registration,
  milestones,
});
const mapDispatchToProps = {
  fetchConsent,
  fetchSubject,
  updateSubject,
  resetApiMilestoneCalendar,
  fetchMilestoneCalendar,
  resetApiMilestones,
  fetchMilestoneGroups,
  fetchMilestoneTasks,
  fetchOverViewTimeline,
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OverviewScreen);

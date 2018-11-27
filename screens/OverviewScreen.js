import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
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

import { fetchSubject } from '../actions/registration_actions';

import Colors from '../constants/Colors';

import OverviewTimeline from '../components/overview_timeline';
import OverviewScreeningEvents from '../components/overview_screening_events';
import OverviewMilestones from '../components/overview_milestones';

const { width, height } = Dimensions.get('window');

const wp = (percentage, direction) => {
  const value = (percentage * direction) / 100;
  return Math.round(value);
};

const containerHeight = wp(30, height);

class OverviewScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    testNotificationCreated: false,
  };

  componentWillMount() {
    this.props.fetchSubject();
    this.props.resetApiMilestoneCalendar();
    this.props.fetchMilestoneCalendar();
    this.props.resetApiMilestones();
    this.props.fetchMilestoneGroups();
    this.props.fetchMilestoneTasks();
    this.props.fetchOverViewTimeline();
  }

  testNotification(noticeType = null) {
    const tasks = this.props.milestones.tasks;
    const milestones = this.props.milestones.milestones;
    console.log(milestones);
    console.log("testNotification",arguments)
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

    console.log("Task", task);
    console.log("Milestone", milestone);

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
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.slider_container}>
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
  slider_container: {
    height: containerHeight,
    borderTopWidth: 2,
    borderTopColor: Colors.lightGrey,
  },
});

const mapStateToProps = ({ milestones }) => ({
  milestones,
});
const mapDispatchToProps = {
  fetchSubject,
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

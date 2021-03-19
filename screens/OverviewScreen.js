import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Notifications from 'expo-notifications';

import find from 'lodash/find';

import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';

import { connect } from 'react-redux';

import {
  fetchMilestoneGroups,
  fetchMilestoneTasks,
  fetchOverViewTimeline,
} from '../actions/milestone_actions';

import { fetchSubject, updateSubject } from '../actions/registration_actions';

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
    this.props.fetchMilestoneGroups();
    this.props.fetchMilestoneTasks();
    this.props.fetchOverViewTimeline();
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

const mapStateToProps = ({ milestones }) => ({
  milestones,
});
const mapDispatchToProps = {
  fetchSubject,
  updateSubject,
  fetchMilestoneGroups,
  fetchMilestoneTasks,
  fetchOverViewTimeline,
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OverviewScreen);

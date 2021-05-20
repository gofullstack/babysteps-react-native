import React, { Component } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

import { connect } from 'react-redux';
import {
  fetchMilestoneGroups,
  fetchMilestones,
  fetchMilestoneTasks,
  fetchOverViewTimeline,
  fetchMilestoneCalendar,
} from '../actions/milestone_actions';
import { fetchSubject, updateSubject } from '../actions/registration_actions';

import Colors from '../constants/Colors';

import OverviewTimeline from '../components/overview_timeline';
import OverviewScreeningEvents from '../components/overview_screening_events';
import OverviewMilestones from '../components/overview_milestones';

const { height } = Dimensions.get('window');

const wp = (percentage, direction) => {
  const value = (percentage * direction) / 100;
  return Math.round(value);
};

const containerHeight = wp(32, height);
const timelineHeight = wp(26, height);

class OverviewScreen extends Component {
  static navigationOptions = {
    header: null,
  };

<<<<<<< HEAD
  constructor(props) {
    super(props);

    this.state = {
      refreshMilestonesSubmitted: false,
      refreshOverViewSubmitted: false,
    };

    this.props.fetchSubject();
    this.props.fetchMilestoneGroups();
    this.props.fetchMilestones();
    this.props.fetchMilestoneTasks();
    this.props.fetchOverViewTimeline();
    this.props.fetchMilestoneCalendar();
  }

  shouldComponentUpdate(nextProps) {
    const { subject } = nextProps.registration;
    return !subject.fetching;
  }

  componentDidUpdate() {
    const { api_milestones, api_calendar } = this.props.milestones;
    const { refreshMilestonesSubmitted, refreshOverViewSubmitted } = this.state;

    if (api_milestones.fetching && refreshMilestonesSubmitted) {
      this.setState({ refreshMilestonesSubmitted: false });
    }

    if (api_calendar.fetching && refreshOverViewSubmitted) {
      this.setState({ refreshOverViewSubmitted: false });
    }

    if (
      !refreshMilestonesSubmitted &&
      !api_milestones.fetching &&
      api_milestones.fetched
    ) {
      this.props.fetchMilestoneGroups();
      this.props.fetchMilestoneTasks();
      this.setState({ refreshMilestonesSubmitted: true });
    }

    if (
      !refreshOverViewSubmitted &&
      !api_calendar.fetching &&
      api_calendar.fetched
    ){
      this.props.fetchOverViewTimeline();
      this.setState({ refreshOverViewSubmitted: true });
    }
  }

=======
>>>>>>> wip
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

<<<<<<< HEAD
const mapStateToProps = ({ registration, milestones }) => ({
  registration,
  milestones,
});
const mapDispatchToProps = {
  fetchSubject,
  updateSubject,
  fetchMilestoneGroups,
  fetchMilestones,
  fetchMilestoneTasks,
  fetchOverViewTimeline,
  fetchMilestoneCalendar,
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OverviewScreen);
=======
const mapStateToProps = ({ milestones }) => ({ milestones });

export default connect(mapStateToProps)(OverviewScreen);
>>>>>>> wip

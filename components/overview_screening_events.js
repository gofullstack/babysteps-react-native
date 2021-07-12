import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  AppState,
} from 'react-native';

import SideSwipe from 'react-native-sideswipe';
import { Ionicons } from '@expo/vector-icons';

import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import find from 'lodash/find';

import moment from 'moment';

import { connect } from 'react-redux';

import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const wp = (percentage, direction) => {
  const value = (percentage * direction) / 100;
  return Math.round(value);
};

const scContainerHeight = wp(30, height);
const scCardHeight = wp(80, scContainerHeight);
const scCardWidth = wp(92, width);
const scCardMargin = (width - scCardWidth) / 2;

class OverviewScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      appState: AppState.currentState,
      currentIndexScreening: 0,
      screeningEvents: [],
      screeningEventsUpdated: false,
      sliderLoading: true,
    };

    // returning from questions screen
    this.props.navigation.addListener('willFocus', () => {
      this.setState({ screeningEventsUpdated: false });
    });
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.setState({ screeningEventsUpdated: false });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { api_calendar } = nextProps.milestones;
    return !api_calendar.fetching;
  }

  componentDidUpdate() {
    const { screeningEventsUpdated } = this.state;
    if (!screeningEventsUpdated) {
      this.setScreeningEvents();
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change');
  }

  handleAppStateChange = nextAppState => {
    const { appState } = this.state;
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      this.setState({ screeningEventsUpdated: false, appState: nextAppState });
    } else {
      this.setState({ appState: nextAppState });
    }
  };

  handleOnPress = task => {
    const navigate = this.props.navigation.navigate;
    if (task.task_type === 'pregnancy_history') {
      navigate('MilestonePregnancyHistory', { task });
    } else {
      navigate('MilestoneQuestions', { task });
    }
  };

  setScreeningEvents = () => {
    const { milestones, calendar } = this.props.milestones;

    if (isEmpty(calendar.data) || isEmpty(milestones.data)) return [];

    let screeningEvents = filter(calendar.data, trigger => {
      if (
        trigger.momentary_assessment ||
        !trigger.study_only ||
        trigger.completed_at
      ) {
        return false;
      }
      const milestone = find(milestones.data, { id: trigger.milestone_id });
      if (!milestone.always_visible) {
        return false;
      }
      return true;
    });

    screeningEvents = sortBy(screeningEvents, trigger => {
      const start_at = new Date(trigger.available_start_at);
      return start_at.toISOString();
    });

    this.setState({
      screeningEventsUpdated: true,
      screeningEvents,
      sliderLoading: false,
    });

  };

  renderScreeningItem = data => {
    const task = { ...data.item };
    task.trigger_id = task.id;
    task.id = task.task_id;

    const startDate = moment(task.available_start_at).format('dddd, MMMM D, YYYY');
    const endDate = moment(task.available_end_at).format('dddd, MMMM D, YYYY');
    return (
      <View key={data.itemIndex} style={styles.screening_slide_container}>
        <TouchableOpacity onPress={() => this.handleOnPress(task)}>
          <Text numberOfLines={2} style={styles.screening_title}>{task.name}</Text>
          <Text numberOfLines={2} style={styles.screening_date}>
            To be completed between: {startDate} and {endDate}
          </Text>
          <Text numberOfLines={2} style={styles.screening_text}>{task.message}</Text>
        </TouchableOpacity>
        <View style={styles.screening_slide_link}>
          <TouchableOpacity
            onPress={() => this.handleOnPress(task)}
            style={styles.screening_button}
          >
            <Text style={styles.screening_button_text}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  onIndexChange = async currentIndexScreening => {
    this.setState({ currentIndexScreening });
  };

  render() {
    const { screeningEvents, currentIndexScreening } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.slider_header}>
          <View style={styles.slider_title}>
            <Text style={styles.slider_title_text}>Research Activities</Text>
          </View>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Milestones')}
            style={styles.opacityStyle}>
            <Text style={styles.slider_link_text}>View all</Text>
            <Ionicons name='md-arrow-forward' style={styles.slider_link_icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.slider}>
          {this.state.sliderLoading && (
            <ActivityIndicator size="large" color={Colors.tint} />
          )}
          {!this.state.sliderLoading && isEmpty(screeningEvents) && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                You do not currently have any research activities due. We&#39;ll
                notify you when there are new tasks for you to complete.
              </Text>
            </View>
          )}
          {!isEmpty(screeningEvents) && (
            <SideSwipe
              index={currentIndexScreening}
              data={screeningEvents}
              renderItem={this.renderScreeningItem}
              itemWidth={width - scCardMargin}
              contentOffset={scCardMargin - 2}
              useVelocityForIndex
              onIndexChange={this.onIndexChange}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  opacityStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  slider_header: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  slider_title: {
    flex: 2,
  },
  slider_title_text: {
    fontSize: 15,
  },
  slider_link_text: {
    marginRight: 5,
    fontSize: 15,
    color: Colors.darkGreen,
  },
  slider_link_icon: {
    fontSize: 15,
    color: Colors.darkGreen,
  },
  slider: {
    flex: 1,
    paddingLeft: 5,
    marginBottom: 10,
  },
  screening_slide_container: {
    width: scCardWidth,
    height: scCardHeight,
    marginRight: scCardMargin,
    borderRadius: 5,
    borderColor: Colors.lightGrey,
    borderWidth: 1,
    padding: 10,
  },
  screening_slide_link: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  screening_title: {
    fontSize: 16,
    color: Colors.darkGrey,
    fontWeight: '600',
    marginBottom: 3,
  },
  screening_date: {
    fontSize: 11,
    color: Colors.green,
    marginLeft: 10,
  },
  screening_text: {
    fontSize: 14,
    color: Colors.darkGrey,
    marginBottom: 10,
  },
  screening_button: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 15,
    paddingLeft: 15,
    borderWidth: 1,
    borderColor: Colors.pink,
    backgroundColor: Colors.lightPink,
    borderRadius: 5,
  },
  screening_button_text: {
    fontSize: 14,
    color: Colors.pink,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scCardMargin,
    height: scCardHeight,
    width: scCardWidth,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 5,
  },
  emptyText: {
    justifyContent: 'center',
    textAlign: 'center',
    color: Colors.pink,
    fontSize: 14,
  },
});

const mapStateToProps = ({ session, milestones, registration }) => ({
  session,
  milestones,
  registration,
});

export default connect(mapStateToProps)(OverviewScreen);

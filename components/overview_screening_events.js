import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import SideSwipe from 'react-native-sideswipe';
import { Ionicons } from '@expo/vector-icons';

import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';

import moment from 'moment';

import { connect } from 'react-redux';

import memoize from "memoize-one";

import { updateSession } from '../actions/session_actions';

import Colors from '../constants/Colors';
import States from '../actions/states';

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

  memoizedScreeningEvents = memoize( ( moment, calendar, api_calendar ) => {
    //const calendar = milestones.calendar;

    let screeningEvents = filter(calendar.data, s => {
      if (s.momentary_assessment) {
        return false;
      }
      if (s.study_only !== 1) {
        return false;
      }
      if (s.completed_at) {
        return false;
      }
      return ( moment.isAfter(s.available_start_at) && moment.isBefore(s.available_end_at) );
    });
    screeningEvents = sortBy(screeningEvents, s => {
      const notify_at = new Date(s.notify_at);
      return notify_at.toISOString();
    });
    return screeningEvents;
  });

  constructor(props) {
    super(props);

    this.state = {
      currentIndexScreening: 0,
      sliderLoading: true,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const subject = this.props.registration.subject;
    const { calendar, api_calendar } = this.props.milestones;
    const { sliderLoading } = this.state;

    if (
      subject.fetched && 
      !isEmpty(subject.data) &&
      calendar.fetched &&
      sliderLoading
    ) {
      this.setState({ sliderLoading: false });
    } 
  }

  handleOnPress = task => {
    const navigate = this.props.navigation.navigate;
    if (task.task_type === 'pregnancy_history') {
      navigate('MilestonePregnancyHistory', { task });
    } else {
      navigate('MilestoneQuestions', { task });
    }
  };

  renderScreeningItem = data => {
    const task = { ...data.item };
    task.trigger_id = task.id;
    task.id = task.task_id;

    const longDate = moment(task.available_end_at).format('dddd, MMMM D, YYYY');
    return (
      <View key={data.itemIndex} style={styles.screening_slide_container}>
        <TouchableOpacity onPress={() => this.handleOnPress(task)}>
          <Text style={styles.screening_title}>{task.name}</Text>
          <Text numberOfLines={1} style={styles.screening_date}>Due by {longDate}</Text>
          <Text style={styles.screening_text}>{task.message}</Text>
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

  render() {
    const {calendar, api_calendar} = this.props.milestones;
    const today = moment();
    const screeningEvents = this.memoizedScreeningEvents( today, calendar, api_calendar);

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
              index={this.state.currentIndexScreening}
              data={screeningEvents}
              renderItem={item => this.renderScreeningItem(item)}
              itemWidth={width - scCardMargin}
              contentOffset={scCardMargin - 2}
              useVelocityForIndex
              onIndexChange={index =>
                this.setState(() => ({ currentIndexScreening: index }))
              }
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
    fontSize: 14,
    color: Colors.green,
    marginBottom: 6,
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

const mapDispatchToProps = {
  updateSession,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OverviewScreen);

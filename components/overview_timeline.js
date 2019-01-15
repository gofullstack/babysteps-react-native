import React from 'react';
import {
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import SideSwipe from 'react-native-sideswipe';
import { showMessage } from 'react-native-flash-message';

import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import forEach from 'lodash/forEach';
import remove from 'lodash/remove';
import isEmpty from 'lodash/isEmpty';

import moment from 'moment';

import { connect } from 'react-redux';
import { fetchOverViewTimeline } from '../actions/milestone_actions';

import Colors from '../constants/Colors';
import CONSTANTS from '../constants';

const { width, height } = Dimensions.get('window');

const wp = (percentage, direction) => {
  const value = (percentage * direction) / 100;
  return Math.round(value);
};

const tlPhotoSize = 65;
const tlCardHeight = tlPhotoSize + 30;
const tlCardWidth = tlPhotoSize;
const tlCardMargin = (width - (tlCardWidth * 4)) / 8;

class OverviewTimeline extends React.Component {

  state = {
    currentIndexTimeline: 0,
    sliderLoading: true,
    overviewTimelines: [],
    currentTimeline: {},
    birthFormModalVisible: false,
  };

  componentWillReceiveProps(nextProps) {
    let baseDate = '';
    let postBirth = false;
    const subject = nextProps.registration.subject;
    if (!subject.fetching && subject.fetched) {
      if (subject.data.date_of_birth) {
        baseDate = subject.data.date_of_birth;
        postBirth = true;
      } else {
        baseDate = subject.data.expected_date_of_birth;
      }

      const calendar = nextProps.milestones.calendar;
      const overview_timeline = nextProps.milestones.overview_timeline;
      if (!calendar.fetching && calendar.fetched) {
        if (!isEmpty(calendar.data) && !overview_timeline.fetching && overview_timeline.fetched) {
          if (isEmpty(overview_timeline.data)) {
            this.props.fetchOverViewTimeline();
          } else {
            const overviewTimelines = [ ...overview_timeline.data ];
            // leave verbose so it's easier to understand
            remove(overviewTimelines, item => {
              if (!postBirth && item.overview_timeline === 'birth') {
                return false;
              }
              // remove if not complete and after available_end_at
              if (!item.uri && moment().isAfter(item.available_end_at)) {
                return true;
              }
              // only tasks for relevant period
              // only completed pre-birth tasks
              if (postBirth && item.overview_timeline === 'during_pregnancy' && item.uri) {
                return false
              }
              // all post-birth tasks
              if (postBirth && item.overview_timeline === 'post_birth') {
                return false;
              }
              // otherwise remove
              return true;
            });

            // calculate weeks
            forEach(overviewTimelines, item => {
              if (item.overview_timeline === 'during_pregnancy') {
                item.weeks = 40 - moment(baseDate).diff(item.notify_at, 'weeks');
              }
              if (item.overview_timeline === 'birth') {
                item.weeks = 40;
              }
              if (item.overview_timeline === 'post_birth') {
                item.weeks = Math.abs(
                  moment(baseDate).diff(item.notify_at, 'weeks'),
                );
              }
            });

            // move birth to end
            const birth = remove(overviewTimelines, ['overview_timeline', 'birth']);
            if (!isEmpty(birth)) overviewTimelines.push(birth[0]);

            // find current incomplete task
            let currentIndexTimeline = findIndex(overviewTimelines, item => {
              return (
                !item.uri &&
                moment().isAfter(item.available_start_at) &&
                moment().isBefore(item.available_end_at)
              );
            });
            // if none, find current task
            if (currentIndexTimeline === -1) {
              currentIndexTimeline = findIndex(overviewTimelines, item => {
                return (
                  moment().isAfter(item.available_start_at) &&
                  moment().isBefore(item.available_end_at)
                );
              });
            }
            // if none, find first incomplete
            if (currentIndexTimeline === -1) {
              currentIndexTimeline = findIndex(overviewTimelines, item => {
                return !item.uri;
              });
            }
            // if none, return last
            if (currentIndexTimeline === -1) {
              currentIndexTimeline = overviewTimelines.length - 1;
            }
            const currentTimeline = overviewTimelines[currentIndexTimeline];

            this.setState({
              overviewTimelines,
              currentTimeline,
              currentIndexTimeline,
              sliderLoading: false,
            });
          } // isEmpty overview data
        } // if overview fetched
      } // if calendar fetching
    } // if subject fetching
  }

  handleOnPress = (item, task) => {
    if (!CONSTANTS.TESTING_ENABLE_ALL_TASKS) {
      if (moment().isBefore(item.available_start_at)) {
        const available = moment(item.available_start_at).format('MM/DD/YYYY');
        showMessage({
          message: `This task will be available ${available}. Please check back then.`,
          type: 'warning',
          duration: 5500,
        });
        return null;
      }
      if (moment().isAfter(item.available_end_at) && !item.completed_at) {
        const ended = moment(item.available_end_at).format('MM/DD/YYYY');
        showMessage({
          message: `Sorry, this task is expired on ${ended} and is no longer available.`,
          type: 'warning',
          duration: 5500,
        });
        return null;
      }
    }
    this.props.navigation.navigate('MilestoneQuestions', { task });
  };

  renderContent = item => {
    const currentTimeline = this.state.currentTimeline.choice_id === item.choice_id;
    const currentStyle = currentTimeline ? styles.timelineCurrentItem : {};
    const available = moment().isAfter(item.available_start_at) && moment().isBefore(item.available_end_at);
    const task = find(this.props.milestones.tasks.data, ['id', item.task_id]);

    if (item.uri) {
      return (
        <TouchableOpacity onPress={() => this.handleOnPress(item, task)}>
          <Image
            source={{ uri: item.uri }}
            style={[styles.timelineImage, currentStyle]}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }
    if (item.overview_timeline === 'birth') {
      return (
        <TouchableOpacity onPress={() => this.props.navigation.navigate('OverviewBirthForm')}>
          <View style={styles.timelineIconContainer}>
            <Image
              source={require('../assets/images/overview_baby_icon.png')}
              style={styles.timelineBabyIconImage}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      );
    }
    if (!available) {
      return (
        <TouchableOpacity onPress={() => this.handleOnPress(item, task)}>
          <View style={styles.timelineIconContainer}>
            <Image
              source={require('../assets/images/overview_camera.png')}
              style={[styles.timelineCameraIconImage, { opacity: 0.4 }]}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      );
    }
    if (!item.uri && !!currentTimeline) {
      return (
        <TouchableOpacity onPress={() => this.handleOnPress(item, task)}>
          <View style={[styles.timelineIconContainer, styles.timelineCurrentIconContainer]}>
            <Image
              source={require('../assets/images/overview_camera.png')}
              style={styles.timelineCameraIconImage}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      );
    }
    if (!item.uri && !currentTimeline) {
      return (
        <TouchableOpacity onPress={() => this.handleOnPress(item, task)}>
          <View style={[styles.timelineCircleItem, currentStyle]}>
            <Image
              source={require('../assets/images/overview_camera.png')}
              style={styles.timelineCameraIconImage}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      );
    }
  };

  renderOverviewTimeline = data => {
    const item = data.item;
    const navigate = this.props.navigation.navigate;
    let timelineTitle = '';

    return (
      <View key={data.itemIndex} style={styles.timelineItemContainer}>
        {this.renderContent(item)}
        <Text style={styles.timelineSubtitle}>{item.title}</Text>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.timeline}>
        {this.state.sliderLoading && (
          <ActivityIndicator size="large" color={Colors.tint} />
        )}
        <Text style={styles.timelineHeader}>My Baby's Progress</Text>
        <SideSwipe
          //index={this.state.currentIndexTimeline}
          data={this.state.overviewTimelines}
          renderItem={item => this.renderOverviewTimeline(item)}
          itemWidth={tlCardWidth + tlCardMargin}
          //contentOffset={tlCardMargin}\
          useVelocityForIndex={false}
          onIndexChange={index =>
            this.setState(() => ({ currentIndexTimeLine: index }))
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  timeline: {
    flex: 1,
    paddingLeft: 5,
    marginBottom: 10,
    marginTop: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineHeader: {
    fontSize: 16,
    marginBottom: 20,
  },
  timelineSubtitle: {
    fontSize: 9,
    color: Colors.pink,
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: tlPhotoSize - 5,
    minHeight: 24,
    marginTop: 5,
  },
  timelineItemContainer: {
    width: tlCardWidth + (tlCardMargin * 2),
    height: tlCardHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineImage: {
    width: tlPhotoSize,
    height: tlPhotoSize,
    borderRadius: tlPhotoSize / 2,
    overflow: 'hidden',
  },
  timelineCircleItem: {
    width: tlPhotoSize,
    height: tlPhotoSize,
    overflow: 'hidden',
    borderRadius: tlPhotoSize / 2,
    backgroundColor: Colors.lightGrey,
  },
  timelineCurrentItem: {
    borderWidth: 2,
    borderColor: Colors.pink,
  },
  timelineIconContainer: {
    width: tlPhotoSize,
    height: tlPhotoSize,
    backgroundColor: Colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: tlPhotoSize / 2,
  },
  timelineCurrentIconContainer: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.pink,
  },
  timelineCameraIconImage: {
    width: tlPhotoSize * 0.6,
    height: tlPhotoSize * 0.6 * 0.75,
  },
  timelineBabyIconImage: {
    width: tlPhotoSize * 0.6 * 0.75,
    height: tlPhotoSize * 0.6,
  },
});

const mapStateToProps = ({ milestones, registration }) => ({
  milestones,
  registration,
});

const mapDispatchToProps = {fetchOverViewTimeline};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OverviewTimeline);

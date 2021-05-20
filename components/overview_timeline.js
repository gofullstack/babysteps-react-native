import React, { Component } from 'react';
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

import { _ } from 'lodash';

import moment from 'moment';

import { connect } from 'react-redux';

import Colors from '../constants/Colors';
import CONSTANTS from '../constants';

import AutoHeightImage from './auto_height_image';

const { width } = Dimensions.get('window');

const wp = (percentage, direction) => {
  const value = (percentage * direction) / 100;
  return Math.round(value);
};

const tlPhotoSize = 60;
const tlCardHeight = tlPhotoSize + 30;
const tlCardWidth = tlPhotoSize;
const tlCardMargin = (width - (tlCardWidth * 4)) / 8;

class OverviewTimeline extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sliderLoading: true,
      overviewTimelines: [],
      overviewTimelinesLoaded: false,
      currentTimeline: {},
    };
    // returning from other screen
    this.props.navigation.addListener('willFocus', () => {
      this.setState({ overviewTimelinesLoaded: false });
    });
  }

  componentDidUpdate() {
    const { overviewTimelinesLoaded } = this.state;
    if (!overviewTimelinesLoaded) {
      this.constructOverviewTimeline();
    }
  }

  constructOverviewTimeline = () => {
    const { date_of_birth, expected_date_of_birth } = this.props.registration.subject.data;
    const { sections, questions, choices, answers, attachments, calendar } = this.props.milestones;

    // leave verbose so it's easier to understand
    let baseDate = moment();
    let postBirth = false;

    if (date_of_birth) {
      baseDate = moment(date_of_birth, 'YYYY-MM-DD');
      postBirth = true;
    } else if (expected_date_of_birth) {
      baseDate = moment(expected_date_of_birth, 'YYYY-MM-DD');
    }

    // get choices which should appear on timeline
    const overviewTimelines = _.filter(choices.data, choice => {
      return ['during_pregnancy', 'birth', 'post_birth'].includes(choice.overview_timeline);
    });

    // get attachment if exists
    _.forEach(overviewTimelines, item => {
      item = { ...item, attachment_id: '', filename: '', content_type: '', uri: ''};
      const attachment = _.find(attachments.data, ['choice_id', item.id]);
      if (!_.isEmpty(attachment)) {
        item.attachment_id = attachment.id;
        item.filename = attachment.filename;
        item.content_type = attachment.content_type;
        item.uri = attachment.uri;
      }
    });

    // remove premature or outdated tasks
    _.remove(overviewTimelines, item => {
      if (item.overview_timeline === 'birth') {
        if (!postBirth) return false;
      }
      // remove if not complete and after available_end_at
      if (!item.uri && moment().isAfter(item.available_end_at)) {
        return true;
      }
      // tasks for pre-birth period
      if (item.overview_timeline === 'during_pregnancy') {
        // return all if during pre-birth or birth period
        if (!postBirth) return false;
        // only completed pre-birth tasks after birth
        if (postBirth && item.uri) return false;
      }
      // all post-birth tasks only if post-birth
      if (item.overview_timeline === 'post_birth') {
        if (postBirth) return false;
      }
      // otherwise remove
      return true;
    });

    // add attributes
    _.forEach(overviewTimelines, item => {
      item.choice_id = item.id;
      delete item.id;
      const question = _.find(questions.data, ['id', item.question_id]);
      const section = _.find(sections.data, ['id', question.section_id]);
      item.task_id = section.task_id;
      item.title = section.title;
      const entry = _.find(calendar.data, ['task_id', section.task_id]);
      item.milestone_trigger_id = entry.id;
      item.notify_at = entry.notify_at;
      item.available_start_at = entry.available_start_at;
      item.available_end_at = entry.available_end_at;
      const answer = _.find(answers.data, ['choice_id', item.choice_id]);
      if (!_.isEmpty(answer)) {
        item.answer_id = answer.id;
      }
    });

    // calculate weeks
    _.forEach(overviewTimelines, item => {
      const notify_at = moment(item.notify_at, moment.ISO_8601);
      if (item.overview_timeline === 'during_pregnancy') {
        item.weeks = 40 - moment(baseDate).diff(notify_at, 'weeks');
      }
      if (item.overview_timeline === 'birth') {
        item.weeks = 40;
      }
      if (item.overview_timeline === 'post_birth') {
        item.weeks = Math.abs(moment(baseDate).diff(notify_at, 'weeks'));
      }
    });

    // move birth to end
    const birth = _.remove(overviewTimelines, ['overview_timeline', 'birth']);
    if (!_.isEmpty(birth)) overviewTimelines.push(birth[0]);

    // find current incomplete task
    let currentIndexTimeline = _.findIndex(overviewTimelines, item => {
      return (
        !item.uri &&
        moment().isAfter(item.available_start_at) &&
        moment().isBefore(item.available_end_at)
      );
    });
    // if none, find current task
    if (currentIndexTimeline === -1) {
      currentIndexTimeline = _.findIndex(overviewTimelines, item => {
        return (
          moment().isAfter(item.available_start_at) &&
          moment().isBefore(item.available_end_at)
        );
      });
    }
    // if none, find first incomplete
    if (currentIndexTimeline === -1) {
      currentIndexTimeline = _.findIndex(overviewTimelines, item => {
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
      overviewTimelinesLoaded: true,
      currentTimeline,
      currentIndexTimeline,
      sliderLoading: false,
    });
  };

  handleOnPress = (item, task) => {
    const { navigate } = this.props.navigation;
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
    navigate('MilestoneQuestions', { task });
  };

  renderContent = item => {
    const { navigate } = this.props.navigation;
    const { tasks } = this.props.milestones;

    const task = _.find(tasks.data, { id: item.task_id });
    const currentTimeline = this.state.currentTimeline.choice_id === item.choice_id;
    const currentStyle = currentTimeline ? styles.timelineCurrentItem : {};
    const available_start_at = moment(item.available_start_at, moment.ISO_8601);
    const available_end_at = moment(item.available_end_at, moment.ISO_8601);
    const available =
      moment().isAfter(available_start_at) &&
      moment().isBefore(available_end_at);

    if (item.uri) {
      return (
        <TouchableOpacity onPress={() => this.handleOnPress(item, task)}>
          <View style={[styles.timelineImage, currentStyle]}>
            <AutoHeightImage
              source={{ uri: item.uri }}
              width={tlPhotoSize}
              fixedSize={60}
              style={styles.croppedImage}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      );
    }
    if (item.overview_timeline === 'birth') {
      return (
        <TouchableOpacity onPress={() => navigate('OverviewBirthForm')}>
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
    return (
      <View key={data.itemIndex} style={styles.timelineItemContainer}>
        {this.renderContent(item)}
        <Text style={styles.timelineSubtitle} numberOfLines={2}>{item.title}</Text>
      </View>
    );
  };

  render() {
    const { overviewTimelines } = this.state;
    // refresh on update of images
    return (
      <View style={styles.timeline}>
        {this.state.sliderLoading && (
          <ActivityIndicator size="large" color={Colors.tint} />
        )}
        <Text style={styles.timelineHeader}>My Baby's Progress</Text>
        <SideSwipe
          //index={this.state.currentIndexTimeline}
          data={overviewTimelines}
          renderItem={this.renderOverviewTimeline}
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
  croppedImage: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  timelineCircleItem: {
    width: tlPhotoSize,
    height: tlPhotoSize,
    overflow: 'hidden',
    borderRadius: tlPhotoSize / 2,
    backgroundColor: Colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
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


export default connect(mapStateToProps)(OverviewTimeline);

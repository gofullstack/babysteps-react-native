import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  SectionList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';

import { showMessage } from 'react-native-flash-message';

import { _ } from 'lodash';

import Moment from 'moment';

import { connect } from 'react-redux';

import Colors from '../constants/Colors';
import States from '../actions/states';
import CONSTANTS from '../constants';

const { width } = Dimensions.get('window');

const itemWidth = width - 60;

const ITEM_HEIGHT = 55;
const SECTION_HEIGHT = 50;

class MilestonesScreen extends Component {
  static navigationOptions = {
    title: 'Milestones',
  };

  constructor(props) {
    super(props);

    const session = this.props.session;

    this.state = {
      sectionIndex: session.current_group_index,
    };
  }

  componentDidMount() {
    const session = this.props.session;
    const { groups, milestones, tasks } = this.props.milestones;
    if (
      !_.isEmpty(groups.data) &&
      !_.isEmpty(milestones.data) &&
      !_.isEmpty(tasks.data)
    ) {
      this.setMilestoneList();
    }
  }

  componentDidUpdate() {
    const session = this.props.session;
    const navigation = this.props;
    const { sectionIndex } = this.state;

    // default to navigation param, then subject base group
    let selectedGroupIndex = navigation.getParam('currentGroupIndex', null);
    if (!selectedGroupIndex) {
      selectedGroupIndex = session.current_group_index;
    }
    if (selectedGroupIndex !== sectionIndex) {
      this.setState({ sectionIndex: selectedGroupIndex });
      return;
    }
  }

  setMilestoneList = () => {
    const session = this.props.session;
    const { groups, milestones, tasks, calendar } = this.props.milestones;
    const { sectionIndex } = this.state;
    const noStudy = session.registration_state === States.REGISTERED_AS_NO_STUDY;

    let includedGroups = _.filter(groups.data, {visible: true});
    includedGroups = _.sortBy(includedGroups, ['position']);

    const milestoneList = [];

    _.forEach(includedGroups, group => {

      let includedMilestones = _.filter(milestones.data, milestone => {
        return (
          milestone.days_since_baseline >= group.baseline_range_days_start &&
          milestone.days_since_baseline <= group.baseline_range_days_end &&
          milestone.momentary_assessment === false
        );
      });

      let data = [];
      _.forEach(includedMilestones, milestone => {
        let includedTasks = _.filter(tasks.data, task => {
          if (
            task.milestone_id !== milestone.id ||
            task.milestone_always_visible === false ||
            (task.study_only === false && noStudy)
          ) {
            return false;
          }
          return true;
        });

        let taskItem = {};
        _.forEach(includedTasks, task => {
          taskItem = {
            id: task.id,
            key: task.id,
            name: task.name,
            task_type: task.task_type,
            study_only: task.study_only,
            days_since_baseline: milestone.days_since_baseline,
            available_start_at: null,
            available_end_at: null,
            feedback_count: 0,
            questions_remaining: 0,
            completed_at: null,
          };
          const trigger = _.find(calendar.data, ['task_id', task.id]);
          if (!_.isEmpty(trigger)) {
            const feedback_count = _.filter(trigger.milestone_feedbacks, { completed_at: null }).length;
            taskItem = {
              ...taskItem,
              questions_remaining: trigger.questions_remaining,
              completed_at: trigger.completed_at,
              available_start_at: trigger.available_start_at,
              available_end_at: trigger.available_end_at,
              feedback_count,
            };
          }
          data.push(taskItem);
        }); // forEach IncludedTasks
      }); // forEach Included Milestones

      data = _.orderBy(
        data,
        ['study_only', 'days_since_baseline'],
        ['desc', 'asc'],
      );

      milestoneList.push({
        key: group.id,
        title: group.title,
        data,
      });
    }); // forEach includedGroups
    return milestoneList;
  };

  handleOnPress = task => {
    const { navigate } = this.props.navigation;
    if (!CONSTANTS.TESTING_ENABLE_ALL_TASKS) {
      if (Moment().isBefore(task.available_start_at)) {
        const available = Moment(task.available_start_at).format('MM/DD/YYYY');
        showMessage({
          message: `This task will be available ${available}. Please check back then.`,
          type: 'warning',
          duration: 5500,
        });
        return null;
      }
      if (Moment().isAfter(task.available_end_at) && !task.completed_at) {
        const ended = Moment(task.available_end_at).format('MM/DD/YYYY');
        showMessage({
          message: `Sorry, this task is expired on ${ended} and is no longer available.`,
          type: 'warning',
          duration: 5500,
        });
        return null;
      }
    }
    if (task.task_type === 'pregnancy_history') {
      navigate('MilestonePregnancyHistory', { task });
    } else {
      navigate('MilestoneQuestions', { task });
    }
  };

  renderItem = item => {
    const task = item.item;
    let checkboxSource = require('../assets/images/milestones_checkbox.png');
    let color = Colors.grey;
    if (task.questions_remaining > 0) {
      checkboxSource = require('../assets/images/milestones_checkbox_skipped.png');
    }
    if (task.completed_at) {
      checkboxSource = require('../assets/images/milestones_checkbox_complete.png');
    }
    if (!CONSTANTS.TESTING_ENABLE_ALL_TASKS) {
      if (
        Moment().isBefore(task.available_start_at) ||
        Moment().isAfter(task.available_end_at)
      ) {
        color = Colors.lightGrey;
      }
    }

    let backgroundColor = 'white';
    if (task.study_only) {
      backgroundColor = Colors.lightGreen;
    }

    return (
      <View style={[styles.itemContainer, { backgroundColor }]}>
        <TouchableOpacity onPress={() => this.handleOnPress(task)}>
          <View style={styles.itemLeft}>
            <Image source={checkboxSource} style={styles.itemCheckBox} />
            {task.feedback_count > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{task.feedback_count}</Text>
              </View>
            )}
            <Text style={[styles.item, { color }]}>
              {task.study_only === 1 && (
                <Text>
                  <MaterialIcons name="child-care" size={16} color='green' />
                  &nbsp;
                </Text>
              )}
              {task.name}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.itemRight}>
          <Image
            source={require('../assets/images/milestones_right_arrow.png')}
            style={styles.itemRightArrow}
          />
        </View>
      </View>
    );
  };

  renderSectionHeader = headerItem => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.section}>{headerItem.section.title}</Text>
      </View>
    );
  };

  getItemLayout = (data, index) => {
    if (index < 0) {
      return {
        length: SECTION_HEIGHT,
        offset: 0,
        index,
      };
    }
    return {
      length: ITEM_HEIGHT,
      offset: (ITEM_HEIGHT - 8.0) * index,
      index,
    };
  };

  render() {
    const { groups, milestones, tasks } = this.props.milestones;
    const { sectionIndex } = this.state;
    let milestoneList = [];
    if (
      !_.isEmpty(groups.data) &&
      !_.isEmpty(milestones.data) &&
      !_.isEmpty(tasks.data)
    ) {
      milestoneList = this.setMilestoneList();
    }

    let initialIndex = 0;
    if (sectionIndex > 0 && !_.isEmpty(milestoneList)) {
      Array(sectionIndex)
        .fill()
        .forEach((_, current) => {
          initialIndex += milestoneList[current].data.length + 2;
        });
    }

    return (
      <View style={styles.container}>
        <Text style={styles.legend}>
          <MaterialIcons name="child-care" size={16} color='green' />
          &nbsp; on a light green background indicates that the item is a
          research related task.
        </Text>
        {!_.isEmpty(milestoneList) && (
          <SectionList
            //debug={true}
            onScrollToIndexFailed={info => console.log({ info })}
            initialScrollIndex={initialIndex}
            getItemLayout={this.getItemLayout}
            renderSectionHeader={this.renderSectionHeader}
            renderItem={this.renderItem}
            sections={milestoneList}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  legend: {
    color: Colors.darkGreen,
    fontSize: 13,
    padding: 15,
    paddingLeft: 20,
  },
  sectionContainer: {
    flexDirection: 'row',
    height: SECTION_HEIGHT,
    paddingTop: 12,
    paddingLeft: 10,
    color: Colors.tint,
    backgroundColor: Colors.lightGrey,
  },
  section: {
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    height: ITEM_HEIGHT,
    padding: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  itemLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: itemWidth,
  },
  itemRight: {
    marginRight: 5,
  },
  itemCheckBox: {
    width: 16,
    height: 16,
  },
  itemRightArrow: {
    width: 14,
    height: 14,
  },
  item: {
    flex: 1,
    flexWrap: 'wrap',
    flexShrink: 1,
    fontSize: 14,
    paddingLeft: 10,
    color: Colors.tint,
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    left: 8,
    top: -6,
    backgroundColor: Colors.red,
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

const mapStateToProps = ({ session, milestones }) => ({ session, milestones });

export default connect(mapStateToProps)(MilestonesScreen);

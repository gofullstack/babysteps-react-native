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

import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/sortBy';
import reduce from 'lodash/reduce';
import find from 'lodash/find';

import Moment from 'moment';

import { connect } from 'react-redux';
import {
  fetchMilestoneGroups,
  fetchMilestoneTasks,
} from '../actions/milestone_actions';
import { fetchUser } from '../actions/registration_actions';

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

    const currentGroupIndex = this.props.session.current_group_index;

    this.state = {
      tasksForList: [],
      tasksSaved: false,
      initialIndex: 0,
      sectionIndex: currentGroupIndex,
      sectionID: null,
      scrollToComplete: false,
    };

    this.props.fetchUser();
    this.props.fetchMilestoneGroups();
    this.props.fetchMilestoneTasks();
  }

  shouldComponentUpdate(nextProps, nextState) {
    // trap section header render - don't update view
    const newSectionID = nextState.sectionID !== this.state.sectionID;
    const { tasks, calendar } = nextProps.milestones;
    //const newSectionIndex = nextState.sectionIndex !== this.state.sectionIndex;
    return !newSectionID && !tasks.fetching && !calendar.fetching;
  }

  componentDidUpdate(prevProps, prevState) {
    const prevTasks = prevProps.milestones.tasks;
    const { tasks } = this.props.milestones;
    const { tasksForList, tasksSaved, sectionIndex } = this.state;
    // default to navigation param, then subject base group
    let selectedGroupIndex = this.props.navigation.getParam('currentGroupIndex', null);
    if (!selectedGroupIndex) {
      selectedGroupIndex = this.props.session.current_group_index;
    }

    if (tasks.fetched && !isEmpty(tasks.data)) {
      if (prevTasks !== tasks || !tasksSaved) {
        this._saveTasksData();
      }
    }
    if (
      tasksForList.length !== 0 &&
      selectedGroupIndex !== null &&
      sectionIndex !== selectedGroupIndex &&
      prevProps.sectionIndex === this.props.sectionIndex
    ) {
      this.updateInitialIndex(selectedGroupIndex, tasksForList);
      this.setState({ sectionIndex: selectedGroupIndex });
    }
  }

  _saveTasksData = () => {
    const session = this.props.session;
    const { groups, tasks } = this.props.milestones;
    const { sectionIndex } = this.state;
    let tasksForList = [...this.state.tasksForList];

    tasksForList = filter(tasks.data, task => {
      if (
        session.registration_state === States.REGISTERED_AS_NO_STUDY &&
        task.study_only === 1
      ) {
        return false;
      }
      // don't show task, linked by notification
      if (task.milestone_always_visible !== 1) {
        return false;
      }
      return true;
    });

    tasksForList = groupBy(tasksForList, task => task.milestone_group_id);

    // remove any tasks without a milestone group
    tasksForList = reduce(
      tasksForList,
      (acc, data, index) => {
        const group = find(groups.data, ['id', data[0].milestone_group_id]);
        if (!isEmpty(group)) {
          acc.push({ key: index, id: group.id, title: group.title, data });
        }
        return acc;
      },
      [],
    );

    // order by study_only, then days_since_baseline
    tasksForList = tasksForList.map(group => {
      const study_only = orderBy(
        filter(group.data, { study_only: 1 }),
        'milestone_days_since_baseline',
      );
      const included = orderBy(
        filter(group.data, { study_only: 0 }),
        'milestone_days_since_baseline',
      );
      group.data = [...study_only, ...included];
      return group;
    });

    this.updateInitialIndex(sectionIndex, tasksForList);

    this.setState({ tasksForList, tasksSaved: true });
  };

  updateInitialIndex = (sectionIndex, tasksForList) => {
    if (isEmpty(tasksForList)) return;
    let initialIndex = 0;
    if (sectionIndex > 0) {
      Array(sectionIndex)
        .fill()
        .forEach((_, current) => {
          initialIndex += tasksForList[current].data.length + 2;
        });
      this.setState({ initialIndex });
    }
  };

  handleOnPress = (task, calendar) => {
    if (!CONSTANTS.TESTING_ENABLE_ALL_TASKS) {
      if (Moment().isBefore(calendar.available_start_at)) {
        const available = Moment(calendar.available_start_at).format('MM/DD/YYYY');
        showMessage({
          message: `This task will be available ${available}. Please check back then.`,
          type: 'warning',
          duration: 5500,
        });
        return null;
      }
      if (Moment().isAfter(calendar.available_end_at) && !calendar.completed_at) {
        const ended = Moment(calendar.available_end_at).format('MM/DD/YYYY');
        showMessage({
          message: `Sorry, this task is expired on ${ended} and is no longer available.`,
          type: 'warning',
          duration: 5500,
        });
        return null;
      }
    }
    const navigate = this.props.navigation.navigate;
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
    const calendar = find(this.props.milestones.calendar.data, ['task_id', task.id]);
    if (calendar) {
      if (calendar.questions_remaining > 0) {
        checkboxSource = require('../assets/images/milestones_checkbox_skipped.png');
      } else if (calendar.completed_at) {
        checkboxSource = require('../assets/images/milestones_checkbox_complete.png');
      }
      if (!CONSTANTS.TESTING_ENABLE_ALL_TASKS) {
        if (Moment().isBefore(calendar.available_start_at) || Moment().isAfter(calendar.available_end_at)) {
          color = Colors.lightGrey;
        }
      }
    } else {
      // if no calendar entry, don't show the task
      return null;
    }

    let backgroundColor = 'white';
    if (task.study_only) {
      backgroundColor = Colors.lightGreen;
    }

    return (
      <View style={[ styles.itemContainer, { backgroundColor } ]}>
        <TouchableOpacity onPress={() => this.handleOnPress(task, calendar)}>
          <View style={styles.itemLeft}>
            <Image source={checkboxSource} style={styles.itemCheckBox} />
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
      offset: (ITEM_HEIGHT - 7.3) * index,
      index,
    };
  };

  render() {
    const { tasksForList, initialIndex } = this.state;
    if (isEmpty(tasksForList)) return null;

    return (
      <View style={styles.container}>
        <Text style={styles.legend}>
          <MaterialIcons name="child-care" size={16} color='green' />
          &nbsp; on a light green background indicates that the item is a
          research related task.
        </Text>
        <SectionList
          //debug={true}
          initialNumToRender={12}
          initialScrollIndex={initialIndex}
          getItemLayout={this.getItemLayout}
          onScrollToIndexFailed={info => console.log(info)}
          renderSectionHeader={this.renderSectionHeader}
          renderItem={this.renderItem}
          sections={tasksForList}
          keyExtractor={(item, index) => `key-${index}`}
        />
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
});

const mapStateToProps = ({ session, milestones }) => ({ session, milestones });
const mapDispatchToProps = {
  fetchMilestoneGroups,
  fetchMilestoneTasks,
  fetchUser,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MilestonesScreen);

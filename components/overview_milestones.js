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
import { Ionicons } from '@expo/vector-icons';

import { NavigationActions } from 'react-navigation';

import findIndex from 'lodash/findIndex';
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';

import moment from 'moment';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';
import { fetchMilestoneGroups } from '../actions/milestone_actions';

import MilestoneGroupImages from '../constants/MilestoneGroupImages';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const wp = (percentage, direction) => {
  const value = (percentage * direction) / 100;
  return Math.round(value);
};

const mgContainerHeight = wp(32, height);
const mgImageHeight = wp(96, mgContainerHeight);
const mgImageWidth = wp(92, width);
const mgImageMargin = wp(4, width);

class OverviewScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      currentGroupIndex: 0,
      sliderLoading: true,
      milestoneGroups: [],
      milestoneGroupsLoaded: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { groups } = nextProps.milestones;
    const { subject } = nextProps.registration;
    return !groups.fetching && !subject.fetching;
  }

  componentDidUpdate(prevProps, prevState) {
    const subject = this.props.registration.subject;
    const milestoneGroupsLoaded = this.state.milestoneGroupsLoaded;
    if (subject.fetched && !isEmpty(subject.data) && !milestoneGroupsLoaded) {
      this.getMilestoneGroups();
    }
  }

  getMilestoneGroups = () => {
    const { groups } = this.props.milestones;
    const { subject } = this.props.registration;
    const { date_of_birth, expected_date_of_birth } = subject.data;

    let baseDate = '';
    if (date_of_birth) {
      baseDate = moment(date_of_birth, 'YYYY-MM-DD');
    } else {
      baseDate = moment(expected_date_of_birth, 'YYYY-MM-DD');
    }
    const currentDay = moment().diff(baseDate, 'days');

    if (groups.fetched) {

      if (isEmpty(groups.data)) {
        this.props.fetchMilestoneGroups();
        return;
      }

      let milestoneGroups = filter(groups.data, { visible: 1 });
      milestoneGroups = sortBy(milestoneGroups, ['position']);
      milestoneGroups.forEach(group => {
        group.uri = MilestoneGroupImages(group.baseline_range_days_end);
      });
      // locate index of current milestone group
      let currentGroupIndex = findIndex(milestoneGroups, group => {
        return (
          group.baseline_range_days_start <= currentDay &&
          currentDay <= group.baseline_range_days_end
        );
      });

      this.props.updateSession({ current_group_index: currentGroupIndex });

      this.setState({
        currentGroupIndex,
        milestoneGroups,
        milestoneGroupsLoaded: true,
        sliderLoading: false,
      });
    } // if groups fetched
  };

  renderMilestoneItem = data => {
    const navigate = this.props.navigation.navigate;
    const group = data.item;
    return (
      <View key={data.itemIndex} style={styles.mgSlideContainer}>
        <TouchableOpacity
          onPress={() => navigate('MilestonesStack', {currentGroupIndex: data.itemIndex})}
        >
          <Image source={group.uri} style={styles.mgItemImage} />
          <View style={styles.mgItemFooter}>
            <Text style={styles.mgItemFooterText}>{group.title}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderSlider = () => {
    const milestoneGroups = this.state.milestoneGroups;
    if (milestoneGroups.length > 0) {
      const currentGroupIndex = this.state.currentGroupIndex;
      return (
        <SideSwipe
          index={currentGroupIndex}
          data={milestoneGroups}
          renderItem={this.renderMilestoneItem}
          itemWidth={width}
          threshold={width / 6}
          //useVelocityForIndex
          style={styles.mgSlider}
          onIndexChange={currentGroupIndex =>
            this.setState({ currentGroupIndex })
          }
        />
      );
    }
  };

  render() {
    const navigate = this.props.navigation.navigate;
    const sliderLoading = this.state.sliderLoading;
    const currentGroupIndex = this.state.currentGroupIndex;
    return (
      <View style={styles.container}>
        <View style={styles.slider_header}>
          <View style={styles.slider_title}>
            <Text style={styles.slider_title_text}>Developmental Milestones</Text>
          </View>
          <TouchableOpacity
            style={styles.opacityStyle}
            onPress={() => navigate('Milestones')}
          >
            <Text style={styles.slider_link_text}>View all</Text>
            <Ionicons name='md-arrow-forward' style={styles.slider_link_icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.slider}>
          {sliderLoading && (
            <ActivityIndicator size="large" color={Colors.tint} />
          )}
          {this.renderSlider()}
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
    marginBottom: 0,
  },
  mgSlider: {
    width,
  },
  mgSlideContainer: {
    width,
    height,
    paddingLeft: mgImageMargin,
    paddingRight: mgImageMargin,
  },
  mgItemImage: {
    width: mgImageWidth,
    height: mgImageHeight,
    borderRadius: 5,
    top: '-20%'
  },
  mgItemFooter: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  mgItemFooterText: {
    color: Colors.darkGrey,
    fontWeight: '400',
    width: '100%',
    backgroundColor: Colors.lightGrey,
    paddingVertical: 5,
    paddingLeft: 10,
  },
});

const mapStateToProps = ({ session, milestones, registration }) => ({
  session,
  milestones,
  registration,
});

const mapDispatchToProps = { updateSession, fetchMilestoneGroups };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OverviewScreen);

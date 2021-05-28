import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import SideSwipe from 'react-native-sideswipe';
import PageControl from 'react-native-page-control';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

import { _ } from 'lodash';

import { connect } from 'react-redux';

import BabyBookCoverItem from '../components/babybook_cover_item';
import BabyBookItem from '../components/babybook_item';
import BabyBookGetImage from '../components/babybook_get_image';

import Colors from '../constants/Colors';
import CONSTANTS from '../constants';

const { width, height } = Dimensions.get('window');
const heightOffset = 180; // compensate for header and navbar
const contentOffset = (width - BabyBookItem.WIDTH) / 2;
const imageWidth = BabyBookGetImage.IMAGE_WIDTH;

const babybookDir = `${FileSystem.documentDirectory +
  CONSTANTS.BABYBOOK_DIRECTORY}/`;

const coverLogo = {
  id: '0',
  title: null,
  detail: null,
  created_at: null,
  file_name: null,
  file_uri: require('../assets/images/baby_book_timeline_incomplete_baby_profile_placeholder.png'),
  cover: 1,
  placeholder: true,
};

class BabyBookScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>BabyBook</Text>

        <View style={styles.headerButtonContainer}>
          {navigation.state.params && navigation.state.params.babybookEntries && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.state.params.Share()}
            >
              <Ionicons
                name={Platform.OS === 'ios' ? 'ios-share' : 'md-share'}
                size={26}
                color={Colors.white}
              />
            </TouchableOpacity>
          )}

          {false && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => () => navigation.navigate('BabyBookTimeline')}
            >
              <Ionicons name="timeline" size={26} color={Colors.white} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('BabyBookEntry')}
          >
            <Ionicons
              name={Platform.OS === 'ios' ? 'ios-camera' : 'md-camera'}
              size={26}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    ),
  });

  constructor(props) {
    super(props);

    this.state = {
      currentIndex: 0,
      data: [],
      entryDataSaved: false,
      shareAttributes: {
        content: {
          title: '',
          message: 'none',
          url: '', // ios only
        },
        options: {
          subject: 'Nothing to Share', // for email
          dialogTitle: 'Nothing to Share ', // Android only
        },
      },
    };

    // bind function to navigation
    this.props.navigation.setParams({
      babybookEntries: false,
      Share: this.shareOpen.bind(this),
    });
  }

  componentDidMount() {
    // set selected item from timeline
    const itemId = this.props.navigation.getParam('itemId', '0');
    if (itemId !== '0') {
      const selectedIndex = _.indexOf(
        _.map(this.state.data, 'id'),
        String(parseInt(itemId, 10) + 1), // increment by 1 to account for cover
      );

      this.setState({ currentIndex: selectedIndex });
    }
    this.willFocusBabyBook = this.props.navigation.addListener(
      'willFocus',
      () => {
        this.setState({ entryDataSaved: false });
      },
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { entries } = nextProps.babybook;
    return !entries.fetching;
  }

  componentDidUpdate(prevProps, prevState) {
    const { entries } = this.props.babybook;
    const { entryDataSaved } = this.state;
    if (!entryDataSaved) {
      this.setEntryData();
      if (!_.isEmpty(entries.data)) {
        this.props.navigation.setParams({ babybookEntries: true });
      }
    }
  }

  componentWillUnmount() {
    // Remove nav focus listener
    this.willFocusBabyBook.remove();
  }

  setEntryData = () => {
    const { entries } = this.props.babybook;
    const { currentIndex } = this.state;
    if (!_.isEmpty(entries.data)) {
      let data = [];
      _.forEach(entries.data, item => {
        if (item.file_name) {
          const uri = babybookDir + item.file_name;
          data.push({ ...item, file_uri: { uri } });
        }
      });
      data = _.sortBy(data, i => i.created_at);

      // add entry for cover
      let cover = _.find(data, ['cover', 1]);
      if (!cover) cover = coverLogo;
      data = [{ ...cover, id: '0' }].concat(data);

      this.setState({ data, entryDataSaved: true });
      // update share
      this.setShareAttributes(currentIndex);
    } else {
      this.setState({ data: [coverLogo], entryDataSaved: true });
    }
  };

  handleIndexChange = index => {
    this.setState({ currentIndex: index });
    this.setShareAttributes(index);
  };

  setShareAttributes = index => {
    const { data } = this.state;
    // for share
    if (data.length > index) {
      const item = data[index];
      const uri = babybookDir + item.file_name;

      this.setState({
        shareAttributes: {
          content: {
            title: item.title,
            message: item.detail,
            url: uri, // ios only
          },
          options: {
            subject: item.title, // for email
            dialogTitle: `Share ${item.title}`, // Android only
          },
        },
      });
    }
  };

  shareOpen = () => {
    const { shareAttributes } = this.state;
    if (shareAttributes.content) {
      Share.share(shareAttributes.content, shareAttributes.options);
    }
  };

  renderItem = ({ item, itemIndex }) => {
    const { navigation } = this.props;
    if (itemIndex === 0) {
      return <BabyBookCoverItem item={item} navigation={navigation} />;
    }
    return <BabyBookItem item={item} navigation={navigation} />;
  };

  render() {
    const { currentIndex, data } = this.state;
    return (
      <View style={styles.container}>
        <PageControl
          style={styles.pageControl}
          numberOfPages={data.length}
          currentPage={currentIndex}
          hidesForSinglePage
          pageIndicatorTintColor={Colors.lightGrey}
          currentPageIndicatorTintColor={Colors.headerBackgroundColor}
          indicatorStyle={{ borderRadius: 0 }}
          currentIndicatorStyle={{ borderRadius: 0 }}
          indicatorSize={{ width: 10, height: 10 }}
          onPageIndicatorPress={this.handleIndexChange}
        />

        <View style={styles.viewContainer}>
          {data.length > 0 && (
            <SideSwipe
              data={data}
              index={currentIndex}
              style={[styles.carouselFill, { width }]}
              itemWidth={BabyBookItem.WIDTH}
              threshold={BabyBookItem.WIDTH / 2}
              contentOffset={contentOffset}
              extractKey={item => item.id}
              useVelocityForIndex={false}
              onIndexChange={this.handleIndexChange}
              renderItem={this.renderItem}
              useNativeDriver
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
  viewContainer: {
    flex: 1,
    flexGrow: 1,
    marginTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: height - heightOffset,
    backgroundColor: Colors.background,
  },
  carouselFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pageControl: {
    height: 20,
    marginTop: 12,
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  headerTitle: {
    alignSelf: 'flex-start',
    fontWeight: '400',
    fontSize: 18,
    color: Colors.headerTint,
  },
  headerButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 15,
  },
  headerButton: {
    paddingLeft: 20,
  },
});

const mapStateToProps = ({ babybook, registration }) => ({
  babybook,
  registration,
});

export default connect(mapStateToProps)(BabyBookScreen);

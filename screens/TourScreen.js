import React, { Component } from 'react';
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';

import SideSwipe from 'react-native-sideswipe';

import PageControl from 'react-native-page-control';

import Colors from '../constants/Colors';
import '@expo/vector-icons';
import { TourItem } from '../components/tour_item';
import { TourItemFour } from '../components/tour_item_four';
import TourButtons from '../components/tour_buttons';

const { width } = Dimensions.get('window');

const items = [
  {key: '1'},
  {key: '2'},
  {key: '3'},
  {key: '4'},
];

export default class TourScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      scrollEnabled: true,
    };
  }

  handleNestedScrollEvent(scrollEnabled) {
    this.setState({ scrollEnabled });
  };

  handleSignInOnPress = () => {
    const { navigate } = this.props.navigation;
    navigate('SignIn');
  };

  updateIndex(currentIndex) {
    this.setState({ currentIndex });
  }

  renderItem(page) {
    if (page.item.key === '4') {
      return (
        <TourItemFour
          item={page.item}
          index={page.itemIndex}
          currentIndex={page.currentIndex}
          animatedValue={page.animatedValue}
          handleNestedScrollEvent={value => this.handleNestedScrollEvent(value)}
        />
      );
    }
    return (
      <TourItem
        item={page.item}
        index={page.itemIndex}
        currentIndex={page.currentIndex}
        animatedValue={page.animatedValue}
        navigation={this.props.navigation}
      />
    );
  };

  render() {
    const offset = (width - TourItem.WIDTH) / 6;
    const { currentIndex, scrollEnabled } = this.state;
    return (
      <ImageBackground
        source={require('../assets/images/background.png')}
        style={styles.imageBackground}
      >
        <SideSwipe
          data={items}
          index={currentIndex}
          shouldCapture={() => scrollEnabled}
          style={styles.sideSwipe}
          itemWidth={TourItem.WIDTH}
          //threshold={TourItem.WIDTH * 2}
          useVelocityForIndex={false}
          extractKey={item => item.key}
          contentOffset={offset}
          onIndexChange={index => this.updateIndex(index)}
          renderItem={page => this.renderItem(page)}
        />

        {currentIndex === 0 && (
          <View style={styles.signInContainer}>
            <Pressable
              onPress={() => this.handleSignInOnPress()}
              style={styles.signInButton}
            >
              <Text style={styles.signInText}>
                Already Created an Account? Sign In
              </Text>
            </Pressable>
          </View>
        )}

        <PageControl
          style={styles.pageControl}
          numberOfPages={items.length}
          currentPage={currentIndex}
          hidesForSinglePage
          pageIndicatorTintColor={Colors.lightGrey}
          currentPageIndicatorTintColor={Colors.grey}
          indicatorStyle={{ borderRadius: 5 }}
          currentIndicatorStyle={{ borderRadius: 5 }}
          indicatorSize={{ width: 8, height: 8 }}
          onPageIndicatorPress={this.onItemTap}
        />

        <TourButtons
          {...this.state}
          updateIndex={() => this.updateIndex(3)}
          navigation={this.props.navigation}
        />
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  pageControl: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 80,
  },
  imageBackground: {
    flex: 1,
    marginTop: 20,
  },
  sideSwipe: {
    width,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  signInContainer: {
    position: 'absolute',
    bottom: 110,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButton: {
    height: 50,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: Colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    borderColor: Colors.lightGrey,
    borderWidth: 1,
    borderRadius: 5,
  },
  signInText: {
    alignSelf: 'center',
    fontWeight: "400",
    fontSize: 18,
    color: Colors.red,
  },
});

import React, { Component } from 'react';
import {
  View,
  Text,
  Button,
  Pressable,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';

import tour_images from './tour_images';
import tour_text from './tour_text';

import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const containerHeight = height * 0.75;
const imageHeight = height * 0.25;

// eslint-disable-next-line import/prefer-default-export
export class TourItem extends Component {
  static WIDTH = width;

  render = () => {
    const { animatedValue, index, currentIndex } = this.props;
    return (
      <Animated.View style={styles.container}>
        <Animated.Image
          style={[
            styles.image,
            {
              transform: [
                {
                  scale: animatedValue.interpolate({
                    inputRange: [index - 1, index, index + 1],
                    outputRange: [1, 1.1, 1],
                    extrapolate: 'clamp',
                  }),
                },
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [index - 1, index, index + 1],
                    outputRange: ['90deg', '0deg', '-90deg'],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
          source={tour_images[index]}
        />
        <View style={styles.textBlock}>
          <Text style={styles.title}>{tour_text[index].title}</Text>
          <Text style={styles.body}>{tour_text[index].body}</Text>
        </View>
      </Animated.View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 20,
    width,
    height: containerHeight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  image: {
    //flex: 1,
    resizeMode: 'contain',
    height: imageHeight,
    marginTop: 50,
    marginBottom: 10,
  },
  textBlock: {
    flex: 1,
    width: width - 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 18,
  },
  body: {
    textAlign: 'center',
    fontSize: 14,
  },
});

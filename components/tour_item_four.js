import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export class TourItemFour extends Component {

  static WIDTH = width;

  render = () => {

    const { animatedValue, index } = this.props;

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
          source={ require('../assets/images/uofi_logo.png') }
        />

        <View style={styles.textBlock}>
          <Text style={styles.title}>Assessment of Social Environment: A Pilot Study using Smart Phone Technology</Text>
          <Text style={styles.body}>Powered by University of Iowa physicians and researchers use of this app will also help us to better understand factors leading to premature birth or developmental disorders such as autism.</Text>
        </View>


        <ScrollView onTouchStart={ () => this.props.handleNestedScrollEvent(false) }
          onMomentumScrollEnd={ () => this.props.handleNestedScrollEvent(true) }
          onScrollEndDrag={ () => this.props.handleNestedScrollEvent(false) }
          style={styles.scrollView}>

          <View style={styles.nestedView}>
            <Image
              style={styles.nestedImage}
              source={require('../assets/images/tour_slide_four_brain.png')}
            />
            <Text style={styles.nestedBody}>Obtain the results of an assessment of your child's ongoing development.  Your child will be screened for language, motor or cognitive delays, as well as for early stages of autism.</Text>
          </View>

          <View style={styles.nestedView}>
            <Image
              style={styles.nestedImage}
              source={require('../assets/images/tour_slide_four_baby.png')}
            />
            <Text style={styles.nestedBody}>If needed, your child will be referred for more in-depth assessments of development or behaviour, and receive personalized recommendations for local resources and services by a trained developmental pediatrician.</Text>
          </View>

          <View style={styles.nestedView}>
            <Image
              style={styles.nestedImage}
              source={require('../assets/images/tour_slide_four_face.png')}
            />
            <Text style={styles.nestedBody}>You will receive a video that shows your baby's face morphing over the first 2 years of life (see demonstration video).</Text>
          </View>

          <View style={styles.nestedView}>
            <Image
              style={styles.nestedImage}
              source={require('../assets/images/tour_slide_four_video.png')}
            />
            <Text style={styles.nestedBody}>You will also receive a compilation of videos documenting you and your baby's journey together over time.</Text>
          </View>

        </ScrollView>

      </Animated.View>
    );
  };
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingTop: 10,
    width: width - 40,
    height: height * 0.3,
    borderTopColor: Colors.grey,
    borderTopWidth: 1,
  },
  nestedImage: {
    resizeMode: 'contain',
    width: 60,
  },
  nestedView: {
    flexDirection: 'row',
  },
  nestedBody: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 20,
    fontSize: 12,
  },
  animatedContainer: {
    flex: 1,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: width,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
    width: width - 200,
    height: undefined,
  },
  textBlock: {
    width: width - 40,
    paddingBottom: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  body: {
    textAlign: 'center',
    fontSize: 14,
  },
});

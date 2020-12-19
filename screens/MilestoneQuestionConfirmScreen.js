import React, { Component } from 'react';
import { View, Text, Image, Dimensions, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { StackActions } from 'react-navigation';

import { connect } from 'react-redux';

import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const imageHeight = height / 3;

class MilestoneQuestionConfirmScreen extends Component {
  static navigationOptions = {
    title: 'Milestones',
  };

  handleReturnToOverview = () => {
    const currentGroupIndex = this.props.session.currentGroupIndex;
    this.props.navigation.dispatch(StackActions.popToTop());
    this.props.navigation.navigate('Overview', { currentGroupIndex });
  };

  render() {
    const message = this.props.navigation.getParam('message');
    return (
      <View style={styles.container}>
        <View style={styles.textBlock}>
          <Image
            style={styles.image}
            source={require('../assets/images/exclamation.png')}
          />
          {!message ? (
            <Text style={styles.header}>You&apos;ve completed this task!</Text>
          ) : (
            <Text style={styles.message}>{message}</Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <Button
            color={Colors.pink}
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={this.handleReturnToOverview}
            title="Go to Overview"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  textBlock: {
    marginTop: 10,
    width: width - 100,
    alignItems: 'center',
  },
  image: {
    height: imageHeight,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  header: {
    marginBottom: 10,
    fontSize: 20,
    color: Colors.green,
  },
  message: {
    marginBottom: 10,
    fontSize: 20,
    color: Colors.grey,
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    width: '100%',
  },
  buttonTitleStyle: {
    fontWeight: '900',
  },
  buttonStyle: {
    width: 200,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
  },
});

const mapStateToProps = ({ session }) => ({ session });

export default connect(mapStateToProps)(MilestoneQuestionConfirmScreen);

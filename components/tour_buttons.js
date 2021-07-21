import React, { Component } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'react-native-elements';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';

import Colors from '../constants/Colors';
import States from '../actions/states';

const { width } = Dimensions.get('window');
const oneButtonWidth = width - 60;
const twoButtonWidth = (width / 2) - 30;

class TourButtons extends Component {

  handleSubmit = registration_state => {
    this.props.updateSession({ registration_state });
  };

  renderButtons = () => {
    if (this.props.currentIndex < 3) {
      return (
        <View style={styles.buttonContainer}>
          <Button
            color={Colors.grey}
            buttonStyle={styles.buttonThreeStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={this.props.updateIndex}
            title="Let's Get Started"
          />
        </View>
      );
    }
    return (
      <View style={styles.buttonContainer}>
        <Button
          color={Colors.grey}
          buttonStyle={styles.buttonOneStyle}
          titleStyle={styles.buttonTitleStyle}
          onPress={() => {
            this.handleSubmit(States.REGISTERING_AS_NO_STUDY);
          }}
          title="No Thanks"
        />
        <Button
          color={Colors.pink}
          buttonStyle={styles.buttonTwoStyle}
          titleStyle={styles.buttonTitleStyle}
          onPress={() => {
            // 20200730 skip eligibility
            // States.REGISTERING_ELIGIBILITY,
            this.handleSubmit(States.REGISTERING_AS_ELIGIBLE);
          }}
          title="Join Study"
        />
      </View>
    );
  };

  render() {
    return <View style={styles.container}>{this.renderButtons()}</View>;
  } // render
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  buttonTitleStyle: {
    fontWeight: '900',
  },
  buttonOneStyle: {
    flex: 1,
    width: twoButtonWidth,
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 5,
  },
  buttonTwoStyle: {
    flex: 1,
    width: twoButtonWidth,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
  },
  buttonThreeStyle: {
    width: oneButtonWidth,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
  },
});

const mapStateToProps = ({ session }) => ({ session });
const mapDispatchToProps = { updateSession };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TourButtons);

import React, { Component } from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'react-native-elements';

import { FileSystem } from 'expo';
import ExpoPixi from 'expo-pixi';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';
import { apiUpdateRespondent } from '../actions/registration_actions';

import Colors from '../constants/Colors';
import States from '../actions/states';
import CONSTANTS from '../constants';

const { width } = Dimensions.get('window');
const twoButtonWidth = (width / 2) - 40;

class ConsentSignatureForm extends Component {

  shouldComponentUpdate(nextProps) {
    return (
      !nextProps.session.registration_state === States.REGISTERING_SIGNATURE
    );
  }

  handleSubmit = async () => {
    const image = await this.sketch.glView.takeSnapshotAsync({format: 'png'});
    const signatureDir = FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY;
    const resultDir = await FileSystem.getInfoAsync(signatureDir);

    if (resultDir.exists) {
      const fileName = signatureDir + '/signature.png';
      await FileSystem.deleteAsync(fileName, { idempotent: true });
      await FileSystem.copyAsync({ from: image.uri, to: fileName });
      const resultFile = await FileSystem.getInfoAsync(fileName);
      if (resultFile.exists) {
        this.props.updateSession({
          registration_state: States.REGISTERING_USER,
        });
      } else {
        console.log('Error: file not saved - ', resultFile);
      }
    } else {
      console.log('Error: no directory - ', resultDir);
    }
  };

  handleReset = () => {
    this.sketch.undo();
  };

  render() {
    //GLView won't run with remote debugging running.  Shut off remote debugging or you will get a Can't Find Property 0 error message.

    return (
      <View style={styles.container}>
        <View style={styles.sketchContainer}>
          <ExpoPixi.Sketch
            ref={ref => (this.sketch = ref)}
            style={styles.signature}
            strokeColor={Colors.black}
            strokeWidth={8}
            transparent={false}
          />
        </View>

        <View style={styles.elevated}>
          <Text style={styles.header}>Your Signature</Text>
          <Text style={styles.text}>
            Do not sign this form if today’s date is on or after
            EXPIRATION DATE: 01/14/2020.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            color={Colors.grey}
            buttonStyle={styles.buttonOneStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={this.handleReset}
            title="Reset" />
          <Button
            color={Colors.pink}
            buttonStyle={styles.buttonTwoStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={this.handleSubmit}
            title="Done" />
        </View>
      </View>
    ); // return
  } // render
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    backgroundColor: Colors.white,
    fontSize: 12,
    padding: 5,
  },
  elevated: {
    backgroundColor: Colors.white,
    marginTop: 20,
    elevation: 2,
    padding: 20,
  },
  sketchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.grey,
    borderWidth: 1.5,
    borderRadius: 5,
  },
  signature: {
    height: 150,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 5,
  },
  buttonContainer: {
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  buttonOneStyle: {
    width: twoButtonWidth,
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 5,
  },
  buttonTwoStyle: {
    width: twoButtonWidth,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
  },
});

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});
const mapDispatchToProps = {
  updateSession,
  apiUpdateRespondent,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsentSignatureForm);

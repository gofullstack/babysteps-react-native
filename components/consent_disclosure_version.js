import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'react-native-elements';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import ExpoPixi from 'expo-pixi';

import { connect } from 'react-redux';

import { updateSession } from '../actions/session_actions';
import {
  fetchConsent,
  apiSaveSignature,
} from '../actions/registration_actions';

import States from '../actions/states';
import Colors from '../constants/Colors';
import CONSTANTS from '../constants';

const { width, height } = Dimensions.get('window');
const oneButtonWidth = width - 100;
const twoButtonWidth = (width / 2) - 40;

class ConsentDisclosureVersion extends Component {
  constructor(props) {
    super(props);

    const remoteDebug = (typeof DedicatedWorkerGlobalScope) !== 'undefined';

    this.state = {
      remoteDebug,
      scrollEnabled: true,
      errorMessage: null,
    };

    this.props.fetchConsent();
  }

  handleSubmit = () => {
    const registration_state = States.REGISTERING_SIGNATURE;
    this.props.updateSession({ registration_state });
  };

  renderButton = () => {
    const consent = this.props.registration.consent.data;
    return (
      <View>
        <Text style={styles.signatureHeader}>
          This Disclosure expires: {consent.tos_expires_on}.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="CONTINUE"
            onPress={() => this.handleSubmit()}
            color={Colors.pink}
            buttonStyle={styles.buttonNext}
            titleStyle={styles.buttonNextTitle}
          />
        </View>
      </View>
    );
  };

  handleNestedScrollEvent = scrollEnabled => {
    this.setState({ scrollEnabled });
  };

  handleResetSignature = () => {
    console.log('signature clear');
    this.signature.clear();
  };

  handleSubmitSignature = async () => {
    const session = this.props.session;
    const consent = this.props.registration.consent.data;
    const respondent = this.props.registration.respondent.data;
    const remoteDebug = this.state.remoteDebug;
    let image = null;
    if (!remoteDebug) {
      image = await this.signature.takeSnapshotAsync({
        format: 'png',
        quality: 0.8,
        result: 'file',
      });
    }
    const signatureDir =
      FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY;
    const resultDir = await FileSystem.getInfoAsync(signatureDir);

    if (resultDir.exists) {
      const uri = signatureDir + '/signature.png';
      if (!remoteDebug) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        await FileSystem.copyAsync({ from: image.uri, to: uri });
      }
      const resultFile = await FileSystem.getInfoAsync(uri, {size: true});

      if (remoteDebug || resultFile.exists) {
        this.props.updateSession({ consent_last_version_id: consent.version_id });
        this.props.apiSaveSignature(session, respondent.api_id, uri, consent.version_id);
        const { navigate } = this.props.navigation;
        navigate('Overview');
      } else {
        const errorMessage = 'Error: file not saved - ' + resultFile;
        this.setState({ errorMessage });
      }
    } else {
      const errorMessage = 'Error: no directory - ' + resultDir;
      this.setState({ errorMessage });
    }

  };

  renderSignature = () => {
    const remoteDebug = this.state.remoteDebug;
    return (
      <View>
        <Text style={styles.signatureHeader}>
          The Consent Agreement has been updated. Your signature indicates your
          and your child's acceptance and participation.
        </Text>
        <View style={styles.sketchContainer}>
          
          {!remoteDebug && (
            <ExpoPixi.Signature
              ref={ref => (this.signature = ref)}
              style={styles.signature}
              onTouchStart={() => this.handleNestedScrollEvent(false)}
              onTouchEnd={() => this.handleNestedScrollEvent(true)}
              strokeColor={Colors.black}
              strokeWidth={8}
              strokeAlpha={0.5}
              transparent={false}
            />
          )}
        </View>

        {this.state.errorMessage && (
          <View style={styles.textErrorContainer}>
            <Text style={styles.textError}>{this.state.errorMessage}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            color={Colors.grey}
            buttonStyle={styles.buttonOneStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={this.handleResetSignature}
            title="Reset"
          />
          <Button
            color={Colors.pink}
            buttonStyle={styles.buttonTwoStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={this.handleSubmitSignature}
            title="Done"
          />
        </View>
      </View>
    );
  };

  render() {
    const consent = this.props.registration.consent.data;
    const hideButton = this.props.hideButton || false;
    const showSignature = this.props.showSignature || false;
    let webViewHeight = height * 0.6;
    if (hideButton) webViewHeight = height * 0.8;
    if (showSignature) webViewHeight = height * 0.5;

    return (
      <ScrollView
        contentContainerStyle={styles.scrollView}
        ref={ref => (this._scrollView = ref)}
      >
        <WebView
          originWhitelist={['*']}
          source={{ html: consent.content }}
          style={[styles.webView, {height: webViewHeight}]}
          scalesPageToFit={false}
          useWebKit
          scrollEnabled={false}
        />
        {!hideButton && this.renderButton()}
        {showSignature && this.renderSignature()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  webView: {
    flexGrow: 1,
    marginTop: 20,
  },
  sketchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.grey,
    borderWidth: 1.5,
    borderRadius: 5,
    marginTop: 20,
    marginLeft: 5,
    marginRight: 5,
  },
  signature: {
    flex: 1,
    height: 150,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 5,
  },
  signatureHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.darkGrey,
    textAlign: 'center',
    paddingTop: 5,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    borderTopColor: Colors.black,
    borderTopWidth: 1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
  },
  buttonNext: {
    width: oneButtonWidth,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
    alignSelf: 'center',
    height: 40,
  },
  buttonNextTitle: {
    fontWeight: '900',
  },
  buttonOneStyle: {
    width: twoButtonWidth,
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 5,
    height: 40,
  },
  buttonTwoStyle: {
    width: twoButtonWidth,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
    height: 40,
  },
  buttonTitleStyle: {
    fontWeight: '900',
  },
  textErrorContainer: {
    marginTop: 20,
  },
  textError: {
    textAlign: 'center',
    color: Colors.errorColor,
    fontSize: 14,
    padding: 5,
  },
});

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});

const mapDispatchToProps = { updateSession, fetchConsent, apiSaveSignature };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsentDisclosureVersion);

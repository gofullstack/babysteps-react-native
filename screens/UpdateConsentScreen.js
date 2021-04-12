import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Button, Text } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import ExpoPixi from 'expo-pixi';

import { connect } from 'react-redux';

import { updateSession } from '../actions/session_actions';
import { fetchConsent } from '../actions/registration_actions';

import { SaveConsentSignature } from '../database/sync_consent_signature';

import ConsentDisclosureVersion from '../components/consent_disclosure_version';

import States from '../actions/states';
import Colors from '../constants/Colors';
import CONSTANTS from '../constants';

const { width, height } = Dimensions.get('window');
const twoButtonWidth = (width / 2) - 40;

class UpdateConsentScreen extends Component {
  static navigationOptions = {
    title: 'Update Consent Signature',
  };

  constructor(props) {
    super(props);

    const remoteDebug = typeof DedicatedWorkerGlobalScope !== 'undefined';

    this.state = {
      remoteDebug,
      scrollEnabled: true,
      errorMessage: null,
      consentModalVisible: false,
    };
    this.props.fetchConsent();
  }

  handleNestedScrollEvent = scrollEnabled => {
    this.setState({ scrollEnabled });
  };

  handleConsentAgreementPress = () => {
    this.setState({ consentModalVisible: true });
  };

  setConsentModalVisible = (visible) => {
    this.setState({ consentModalVisible: visible });
  };

  renderConsentModal = () => {
    return (
      <View style={{ marginTop: 22 }}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.consentModalVisible}
          onRequestClose={() => {}}
        >
          <View>
            <TouchableOpacity
              style={{alignSelf: 'flex-end', marginTop: 24, marginRight: 20}}
              onPress={() => {
                this.setConsentModalVisible(!this.state.consentModalVisible);
              }}
            >
              <Ionicons name = "md-close" size = {36} />
            </TouchableOpacity>
            <ConsentDisclosureVersion hideButton={true} />
          </View>
        </Modal>
      </View>
    );
  };

  renderSignature = () => {
    const remoteDebug = this.state.remoteDebug;
    return (
      <View>
        <Text style={styles.signatureHeader}>
          Your signature indicates your and your child's acceptance and
          continued participation.
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
          {remoteDebug && (
            <Text style={styles.dummySignature}>
              Signature pad disabled when remote debugger enabled.
            </Text>
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

  handleResetSignature = () => {
    const remoteDebug = this.state.remoteDebug;
    if (!remoteDebug) {
      this.signature.clear();
    }
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
    let errorMessage = null;

    if (resultDir.exists) {
      const uri = signatureDir + `/signature_${consent.version_id}.png`;
      if (!remoteDebug) {
        await FileSystem.copyAsync({ from: image.uri, to: uri });
        const resultFile = await FileSystem.getInfoAsync(uri, { size: true });

        if (resultFile.exists) {
          SaveConsentSignature(consent.version_id, respondent.id);
          const registration_state = States.REGISTERED_AS_IN_STUDY;
          this.props.updateSession({
            registration_state,
            consent_last_version_id: consent.version_id,
          });
          return;
        } // resultFile exists

        errorMessage = '*** Error: file not saved. No file found.';
      } else {
        errorMessage = '*** Cannot submit signature file when debugger is enabled';
      } // !remoteDebug
    } else {
      errorMessage = '*** Error: no directory - ' + resultDir;
    } // resultDir exists
    this.setState({ errorMessage });
  };

  render() {
    const consent = this.props.registration.consent.data;
    const { scrollEnabled } = this.state;
    const webViewHeight = height * 0.35;
    return (
      <View>
        <Text style={styles.header}>
          The Consent Agreement has been updated. A summary of the changes
          follows. Please review and accept by signing below.
        </Text>

        <ScrollView
          scrollEnabled={scrollEnabled}
          contentContainerStyle={styles.scrollView}
          ref={this._scrollView}
        >
          <WebView
            originWhitelist={['*']}
            source={{ html: consent.summary_of_changes }}
            style={[styles.webView, {height: webViewHeight}]}
            scalesPageToFit={false}
            useWebKit
            //scrollEnabled={false}
          />
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={this.handleConsentAgreementPress}
          >
            <Text style={styles.linkText}>Review full Consent Agreement</Text>
            <Ionicons
              name="ios-arrow-forward"
              size={28}
              color="#bdc6cf"
              style={styles.linkIcon}
            />
          </TouchableOpacity>
          {this.renderSignature()}
        </ScrollView>
        {this.renderConsentModal()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.darkGrey,
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 5,
    borderBottomColor: Colors.black,
    borderBottomWidth: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  webView: {
    flexGrow: 1,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  linkContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.mediumGrey,
    borderBottomColor: Colors.mediumGrey,
    marginTop: 20,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 10,
    position: 'relative',
  },
  linkText: {
    fontSize: 16,
    color: Colors.darkGreen,
    marginLeft: 10,
  },
  linkIcon: {
    color: Colors.darkGreen,
    right: 9,
    position: 'absolute',
    top: 12,
  },
  sketchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.grey,
    borderWidth: 1.5,
    borderRadius: 5,
    marginTop: 10,
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
  dummySignature: {
    color: Colors.grey,
    height: 150,
  },
  signatureHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.darkGrey,
    textAlign: 'center',
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 10,
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
  buttonOneStyle: {
    width: twoButtonWidth,
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 5,
    height: 50,
  },
  buttonTwoStyle: {
    width: twoButtonWidth,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
    height: 50,
  },
  buttonTitleStyle: {
    fontWeight: '900',
  },
  textErrorContainer: {
    marginTop: 10,
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

const mapDispatchToProps = {
  fetchConsent,
  updateSession,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UpdateConsentScreen);
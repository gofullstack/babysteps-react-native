import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'react-native-elements';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import ExpoPixi from 'expo-pixi';

import { connect } from 'react-redux';

import isEmpty from 'lodash/isEmpty';

import { updateSession } from '../actions/session_actions';
import { fetchConsent } from '../actions/registration_actions';

import States from '../actions/states';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const oneButtonWidth = width - 100;
const twoButtonWidth = (width / 2) - 40;
let webViewHeight = height * 0.55;

class ConsentDisclosureVersion extends Component {
  constructor(props) {
    super(props);

    const remoteDebug = typeof DedicatedWorkerGlobalScope !== 'undefined';

    this.state = {
      remoteDebug,
      scrollEnabled: true,
      errorMessage: null,
    };

    this.props.fetchConsent();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { consent } = nextProps.registration;
    return !consent.fetching;
  }

  handleSubmit = () => {
    const registration_state = States.REGISTERING_SIGNATURE;
    this.props.updateSession({ registration_state });
  };

  renderButton = () => {
    const consent = this.props.registration.consent.data;
    let tos_expires_on = '';
    if (!isEmpty(consent)) tos_expires_on = consent.tos_expires_on;
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.header}>
          This Disclosure expires: {tos_expires_on}.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="CONTINUE"
            onPress={() => this.handleSubmit()}
            color={Colors.pink}
            buttonStyle={styles.buttonNext}
            titleStyle={styles.buttonNextTitle}
            disabled={isEmpty(consent)}
          />
        </View>
      </View>
    );
  };

  render() {
    const consent = this.props.registration.consent.data;
    const hideButton = this.props.hideButton || false;
    let [irb_id, version_id, tos_approved_on, version_content] = ['pending', '', '', ''];
    if (!isEmpty(consent)) {
      irb_id = consent.irb_id;
      version_id = consent.version_id;
      tos_approved_on = consent.tos_approved_on;
      version_content = consent.version_content;
    }
    if (hideButton) webViewHeight = height * 0.8;

    return (
      <ScrollView
        contentContainerStyle={styles.scrollView}
        ref={this._scrollView}
      >
        <Text style={styles.header}>INFORMED CONSENT</Text>
        <Text style={styles.subHeader}>
          IRB ID: {irb_id}.v{version_id} Approved: {tos_approved_on}
        </Text>
        <WebView
          originWhitelist={['*']}
          source={{ html: version_content }}
          style={[styles.webView, {height: webViewHeight}]}
          scalesPageToFit={false}
          useWebKit
        />
        {!hideButton && this.renderButton()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    paddingLeft: 10,
    paddingRight: 10,
  },
  webView: {
    flexGrow: 1,
    marginTop: 20,
  },
  header: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    paddingTop: 5,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    borderTopColor: Colors.black,
    borderTopWidth: 1,
  },
  subHeader: {
    fontSize: 12,
    color: Colors.darkGrey,
    textAlign: 'center',
    paddingBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    borderBottomColor: Colors.black,
    borderBottomWidth: 1,
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'center',
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
    height: 50,
  },
  buttonNextTitle: {
    fontWeight: '900',
  },
});

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});

const mapDispatchToProps = { updateSession, fetchConsent };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsentDisclosureVersion);
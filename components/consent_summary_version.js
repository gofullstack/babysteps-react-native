import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'react-native-elements';
import { WebView } from 'react-native-webview';

import { connect } from 'react-redux';

import isEmpty from 'lodash/isEmpty';

import { updateSession } from '../actions/session_actions';
import { fetchConsent } from '../actions/registration_actions';

import States from '../actions/states';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const oneButtonWidth = width - 100;
const twoButtonWidth = (width / 2) - 40;
let webViewHeight = height * 0.6;

class ConsentSummaryVersion extends Component {
  constructor(props) {
    super(props);

    this.props.fetchConsent();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { consent, apiConsent } = nextProps.registration;
    return !apiConsent.fetching && !consent.fetching;
  }

  handleSubmit = () => {
    const registration_state = States.REGISTERING_FULL_CONSENT;
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

    if (hideButton) webViewHeight = height * 0.8;
    let [irb_id, version_id, tos_approved_on, summary] = ['pending', '', '', ''];
    if (!isEmpty(consent)) {
      irb_id = consent.irb_id;
      version_id = consent.version_id;
      tos_approved_on = consent.tos_approved_on;
      summary = consent.summary;
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollView}
        ref={this._scrollView}
      >
        <Text style={styles.header}>SUMMARY OF INFORMED CONSENT</Text>
        <Text style={styles.subHeader}>
          IRB ID: {irb_id}.v{version_id} Approved: {tos_approved_on}
        </Text>
        <WebView
          originWhitelist={['*']}
          source={{ html: summary }}
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
    color: Colors.darkGrey,
    textAlign: 'center',
    paddingTop: 5,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    borderTopColor: Colors.black,
    borderTopWidth: 1,
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
)(ConsentSummaryVersion);
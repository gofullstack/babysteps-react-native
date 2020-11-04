import React, { Component } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';

import { Button, Text } from 'react-native-elements';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import * as WebBrowser from 'expo-web-browser';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import {
  resetSession,
  apiFetchSignin,
  updateSession,
} from '../actions/session_actions';

import {
  resetApiMilestones,
  apiFetchMilestones,
  resetMilestoneCalendar,
  apiFetchMilestoneCalendar,
  resetMilestoneAnswers,
  apiSyncMilestoneAnswers,
} from '../actions/milestone_actions';

import {
  resetRespondent,
  resetSubject,
  apiSyncRegistration,
  apiSyncSignature,
} from '../actions/registration_actions';

import { getApiUrl } from '../database/common';

import States from '../actions/states';
import Colors from '../constants/Colors';
import AppStyles from '../constants/Styles';

class SignInScreen extends Component {
  static navigationOptions = {
    title: 'Sign In',
  };

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      isSubmitting: false,
      errorMessages: [],
      shouldUpdate: true,
      syncMilestones: false,
      syncRegistration: false,
      syncCalendar: false,
      syncAnswers: false,
    };

    this.props.resetSession();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.shouldUpdate;
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    if (!session.fetching) {
      this._saveSignInSession(session);
    }
  }

  _saveSignInSession = session => {
    const { syncMilestones, syncRegistration, syncCalendar, syncAnswers } = this.state;
    const milestones = this.props.milestones;
    const registration = this.props.registration;
    if (session.fetched) {
      // get respondent and subject data
      if (!syncRegistration) {
        this.setState({ syncRegistration: true });
        this.props.resetRespondent();
        this.props.resetSubject();
        this.props.apiSyncRegistration(session.api_id);
        this.props.apiSyncSignature(session.api_id);
        // slow down to allow API to respond
        return;
      }
      // wait for registration to sync
      if (syncRegistration && registration.apiRespondent.fetching) {
        setTimeout(() => {}, 1000);
        return;
      }
      // redirect to sign up if no respondent information
      if (
        "message" in registration.apiRespondent.error &&
        isEmpty(registration.respondent.data)
      ) {
        this.props.updateSession({
          registration_state: States.REGISTERING_FULL_CONSENT,
        });
        return;
      }
      // slow down cycles to allow API to respond
      setTimeout(() => {}, 1000);
      if (!syncMilestones) {
        this.setState({ syncMilestones: true });
        this.props.resetApiMilestones();
        this.props.apiFetchMilestones();
      }
      if (!syncCalendar && !isEmpty(registration.subject.data)) {
        this.setState({ syncCalendar: true });
        this.props.resetMilestoneCalendar();
        this.props.apiFetchMilestoneCalendar({ subject_id: registration.subject.data.api_id });
      }
      if (
        !syncAnswers &&
        !milestones.apiAnswers.fetched &&
        !isEmpty(registration.respondent.data) &&
        !isEmpty(registration.subject.data)
      ) {
        this.setState({ syncAnswers: true });
        this.props.resetMilestoneAnswers();
        this.props.apiSyncMilestoneAnswers(session.api_id);
      }
      if (
        syncMilestones &&
        milestones.api_milestones.fetched &&
        syncRegistration &&
        registration.apiRespondent.fetched &&
        registration.apiSignature.fetched &&
        syncCalendar &&
        milestones.api_calendar.fetched &&
        syncAnswers &&
        milestones.apiAnswers.fetched
      ) {
        this.setState({ shouldUpdate: false });
        this.props.updateSession({
          registration_state: States.REGISTERED_AS_IN_STUDY,
        });
      }
    }
    if (session.errorMessages && this.state.isSubmitting) {
      this.setState({ isSubmitting: false, errorMessages: session.errorMessages });
    }
  };

  handlePress = () => {
    const { email, password } = this.state;
    this.setState({ isSubmitting: true, errorMessages: [] });
    this.props.apiFetchSignin(email, password);
  };

  handlePasswordLink = () => {
    const baseURL = getApiUrl();
    const url = baseURL.replace('api', 'admin/password/new');
    WebBrowser.openBrowserAsync(url);
  };

  render() {
    const { email, password, isSubmitting, errorMessages } = this.state;

    return (
      <KeyboardAwareScrollView
        enableResetScrollToCoords={false}
        enableAutomaticScroll={false}
        enableOnAndroid={true}
      >
        <View style={styles.container}>
          <Text style={AppStyles.registrationHeader}>
            Enter your email and password.
          </Text>

          <TextInput
            value={email}
            keyboardType="email-address"
            onChangeText={email => this.setState({ email })}
            placeholder="email"
            placeholderTextColor={Colors.grey}
            style={styles.input}
            textContentType="username"
          />
          <TextInput
            value={password}
            onChangeText={password => this.setState({ password })}
            placeholder="password"
            secureTextEntry
            placeholderTextColor={Colors.grey}
            style={styles.input}
            textContentType="password"
          />
          <View style={AppStyles.registrationButtonContainer}>
            <Button
              title="SIGN IN"
              onPress={this.handlePress}
              buttonStyle={AppStyles.buttonSubmit}
              titleStyle={{ fontWeight: 900 }}
              color={Colors.darkGreen}
              disabled={isSubmitting}
            />
          </View>

          {!isSubmitting && (
            <View styles={styles.passwordContainer}>
              <Text style={styles.passwordLink} onPress={this.handlePasswordLink}>
                Reset My Password
              </Text>
            </View>
          )}

          <View styles={styles.errorContainer}>
            <Text style={styles.errorMessage}>{errorMessages}</Text>
          </View>

          {isSubmitting && (
            <View>
              <ActivityIndicator size="large" color={Colors.tint} />
            </View>
          )}

        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundColor,
  },
  input: {
    width: 300,
    fontSize: 18,
    height: 40,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.darkGrey,
    borderRadius: 5,
    marginVertical: 10,
  },
  passwordContainer: {
    justifyContent: 'center',
  },
  passwordLink: {
    color: Colors.darkGreen,
  },
  errorContainer: {
    justifyContent: 'center',
  },
  errorMessage: {
    color: Colors.red,
  },
});

const mapStateToProps = ({
  session,
  registration,
  milestones,
}) => ({
  session,
  registration,
  milestones,
});

const mapDispatchToProps = {
  resetSession,
  updateSession,
  apiFetchSignin,
  resetApiMilestones,
  apiFetchMilestones,
  resetMilestoneCalendar,
  apiFetchMilestoneCalendar,
  resetMilestoneAnswers,
  apiSyncMilestoneAnswers,
  resetRespondent,
  resetSubject,
  apiSyncRegistration,
  apiSyncSignature,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignInScreen);

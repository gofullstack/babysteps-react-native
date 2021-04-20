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
  apiFetchMilestones,
  apiFetchMilestoneCalendar,
} from '../actions/milestone_actions';

import {
  resetRespondent,
  resetSubject,
  apiSyncRegistration,
  apiSyncSignature,
} from '../actions/registration_actions';

import { getApiUrl } from '../database/common';
import { UploadMilestones } from '../database/sync_milestones';

import States from '../actions/states';
import Colors from '../constants/Colors';
import AppStyles from '../constants/Styles';
import CONSTANTS from '../constants';

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
      syncMilestones: false,
      syncRegistration: false,
      syncCalendar: false,
      syncAnswers: false,
    };

    this.props.resetSession();
    this.props.resetRespondent();
    this.props.resetSubject();
    this.props.apiFetchMilestones();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const session = nextProps.session;
    const { apiSyncRegistration, apiSignature } = nextProps.registration;
    return (
      !session.fetching &&
      !session.signinFetching &&
      !apiSyncRegistration.fetching &&
      !apiSignature.fetching
    );
  }

  componentDidUpdate() {
    const session = this.props.session;
    const { respondent, subject, apiSyncRegistration } = this.props.registration;
    const { isSubmitting, syncRegistration } = this.state;

    if (session.signinFetched) {

      // get respondent and subject data
      if (isSubmitting && !syncRegistration) {
        if (session.user_id) {
          this.props.apiSyncRegistration(session.user_id);
          this.props.apiSyncSignature(session.user_id);
          this.setState({ syncRegistration: true });
          return;
        }
        this.setState({ isSubmitting: false, errorMessages: '*** Error: No User ID returned' });
      }

      // redirect to sign up if no respondent information
      if (apiSyncRegistration.fetched) {
        if (isEmpty(respondent.data)) {
          console.log('*** User found but not Respondent...');
          this.props.updateSession({
            registration_state: States.REGISTERING_FULL_CONSENT,
          });
          return;
        }

        if (!isEmpty(subject.data)) {
          this.props.apiFetchMilestoneCalendar({ subject_id: subject.data.api_id })
        }

        this.props.updateSession({
          registration_state: States.REGISTERED_AS_IN_STUDY,
        });
      }
    }
    if (session.errorMessages && isSubmitting) {
      this.setState({ isSubmitting: false, errorMessages: session.errorMessages });
    }
  }

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
    paddingTop: 20,
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
  apiFetchMilestones,
  apiFetchMilestoneCalendar,
  resetRespondent,
  resetSubject,
  apiSyncRegistration,
  apiSyncSignature,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignInScreen);

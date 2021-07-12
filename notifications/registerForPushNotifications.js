import React, { Component } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';
import {
  //fetchRespondent,
  updateRespondent,
  apiUpdateRespondent,
} from '../actions/registration_actions';

import { openSettings } from '../components/permissions';

class RegisterForPushNotifications extends Component {
  constructor(props) {
    super(props);

    this.state = {
      persistantAlertDisplayed: false,
      permissionDeniedAlertDisplayed: false,
      requestedPushToken: false,
    };
  }

  componentDidMount() {
    console.log('*** Register For Push Notifications');
  }

  shouldComponentUpdate(nextProps, nextState) {
    const session = nextProps.session;
    const { respondent, apiRespondent } = nextProps.registration;
    const { requestedPushToken } = nextState;

    return (
      !apiRespondent.fetching &&
      !isEmpty(respondent.data) &&
      ![null, undefined].includes(respondent.data.id) &&
      !requestedPushToken
    );
  }

  componentDidUpdate() {
    const session = this.props.session;
    const { persistantAlertDisplayed } = this.state;
    // simulator will not generate a token
    if (!Constants.isDevice) return;
    this.setPermissions();
    if (!persistantAlertDisplayed && session.notifications_permission === null) {
      this.displayPersistantNotificationAlert();
    }
  }

  displayPersistantNotificationAlert = () => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Permissions',
        "To make sure you don't miss any notifications, please enable 'Persistent' notifications for BabySteps. Click Settings below, open 'Notifications' and set 'Banner Style' to 'Persistent'.",
        [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { text: 'Settings', onPress: () => openSettings('NOTIFICATIONS') },
        ],
        { cancelable: true },
      );
      this.setState({ persistantAlertDisplayed: true });
    }
  };

  setPermissions = async () => {
    const session = this.props.session;
    const { respondent } = this.props.registration;
    const { permissionDeniedAlertDisplayed, requestedPushToken } = this.state;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let notifications_permission = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      notifications_permission = status;
    }

    if (notifications_permission !== session.notifications_permission) {
      const id = respondent.data.id;
      this.props.updateSession({ notifications_permission });
      this.props.apiUpdateRespondent(session, { id, notifications_permission })
    }

    if (notifications_permission !== 'granted') return;

    if (!requestedPushToken && notifications_permission === 'granted') {
      this.setPushNotificationToken();
      this.setState({ requestedPushToken: true });
    }
  };

  setPushNotificationToken = async () => {
    const session = this.props.session;
    const id = this.props.registration.respondent.data.id;

    const result = await Notifications.getExpoPushTokenAsync();
    const push_token = result.data;

    if (session.push_token !== push_token) {
      this.props.updateSession({ push_token });
      this.props.updateRespondent({ push_token });
      this.props.apiUpdateRespondent(session, { id, push_token });
    }
  };

  render() {
    return null;
  }
}

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});

const mapDispatchToProps = {
  updateSession,
  updateRespondent,
  apiUpdateRespondent,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegisterForPushNotifications);

import React, { Component } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';
import {
  fetchRespondent,
  updateRespondent,
  apiUpdateRespondent,
} from '../actions/registration_actions';
import { fetchMilestones } from '../actions/milestone_actions';
import { showMomentaryAssessment } from '../actions/notification_actions';

class RegisterForPushNotifications extends Component {

  constructor(props) {
    super(props);

    this.state = {
      requestedPushToken: false,
    }

    this.props.fetchMilestones();
    this.props.fetchRespondent();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const respondent = nextProps.registration.respondent.data;
    const requestedPushToken = nextState.requestedPushToken;
    if (!Constants.isDevice) return false;
    if (isEmpty(respondent)) return false;
    if (respondent.api_id === null || respondent.api_id === undefined) return false;
    //if (respondent.push_token !== null) return false;
    if (requestedPushToken) return false;
    return true;
  }

  async componentDidUpdate() {
    // simulator will not generate a token
    if (!Constants.isDevice) return;

    const session = this.props.session;
    const respondent = this.props.registration.respondent.data;
    const requestedPushToken = this.state.requestedPushToken;

    let notifications_permission = session.notifications_permission;

    if (Platform.OS === 'ios' && notifications_permission !== 'granted') {
      Alert.alert(
        'Permissions',
        "To make sure you don't miss any notifications, please enable 'Persistent' notifications for BabySteps. Click Settings below, open 'Notifications' and set 'Banner Style' to 'Persistent'.",
        [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { text: 'Settings', onPress: () => openSettings('NOTIFICATIONS') },
        ],
        { cancelable: true },
      );
    }

    // android permissions are given on install and may already exist
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS,
    );
    notifications_permission = existingStatus;
    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      notifications_permission = status;
    }

    if (notifications_permission !== session.notifications_permission) {
      this.props.updateSession({ notifications_permission });
    }

    if (notifications_permission !== 'granted') {
      Alert.alert(
        'Permissions',
        'Failed to get permissions for Push Notifications!',
        [{ text: 'Cancel', onPress: () => {}, style: 'cancel' }],
        { cancelable: true },
      );
      return;
    }

    this.setState({ requestedPushToken: true });
    const result = await Notifications.getExpoPushTokenAsync();
    const push_token = result.data;
    this.props.updateSession({ push_token });
    this.props.updateRespondent({ push_token });
    const data = {api_id: respondent.api_id, push_token}
    this.props.apiUpdateRespondent(session, data);
  }

  render() {
    return null;
  }
}

const mapStateToProps = ({
  session,
  milestones,
  registration,
  notifications,
}) => ({
  session,
  milestones,
  registration,
  notifications,
});

const mapDispatchToProps = {
  updateSession,
  fetchMilestones,
  fetchRespondent,
  updateRespondent,
  apiUpdateRespondent,
  showMomentaryAssessment,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegisterForPushNotifications);
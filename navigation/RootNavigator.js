import React, { Component } from 'react';
import { Platform, Alert } from 'react-native';

import * as Notifications from 'expo-notifications';

import * as Permissions from 'expo-permissions';

import Constants from 'expo-constants';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';

import { showMessage } from 'react-native-flash-message';

import * as Sentry from 'sentry-expo';

import { connect } from 'react-redux';
import {
  updateSession,
  fetchSession,
  apiFetchConsentLastUpdated,
  apiFetchMilestonesLastUpdated,
  apiFetchMilestoneCalendarLastUpdated,
} from '../actions/session_actions';

import {
  apiFetchMilestones,
  apiFetchMilestoneCalendar,
} from '../actions/milestone_actions';

import {
  apiFetchConsent,
  fetchRespondent,
  apiUpdateRespondent,
} from '../actions/registration_actions';

import {
  showMomentaryAssessment,
  updateNotifications,
  updateMomentaryAssessments,
  deleteAllNotifications,
} from '../actions/notification_actions';

import AppNavigator from './AppNavigator';
import NavigationService from './NavigationService';

import TourScreen from '../screens/TourScreen';
import SignInScreen from '../screens/SignInScreen';
import ConsentScreen from '../screens/ConsentScreen';
import UpdateConsentScreen from '../screens/UpdateConsentScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import TourNoStudyConfirmScreen from '../screens/TourNoStudyConfirmScreen';
import RegistrationNoStudyScreen from '../screens/RegistrationNoStudyScreen';

import { openSettings } from '../components/permissions';

import { addColumn } from '../database/common';

import Colors from '../constants/Colors';
import States from '../actions/states';
import CONSTANTS from '../constants';

const headerOptions = {
  headerStyle: {
    backgroundColor: Colors.headerBackground,
  },
  headerTintColor: Colors.headerTint,
  headerTitleStyle: {
    fontWeight: '900',
  },
};

const ConsentNavigator = createStackNavigator(
  {
    screen: ConsentScreen,
  },
  {
    defaultNavigationOptions: headerOptions,
  },
);

const ConsentNavigationContainer = createAppContainer(ConsentNavigator);

const RegistrationNavigator = createStackNavigator(
  {
    Registration: {
      screen: RegistrationScreen,
    },
    SignIn: {
      screen: SignInScreen,
    },
    UpdateConsent: {
      screen: UpdateConsentScreen,
    },
  },
  {
    defaultNavigationOptions: headerOptions,
  },
);

const RegistrationNavigationContainer = createAppContainer(RegistrationNavigator);

const TourNavigator = createStackNavigator(
  {
    Tour: {
      screen: TourScreen,
    },
    Registration: {
      screen: RegistrationNavigator,
    },
    SignIn: {
      screen: SignInScreen,
    },
  },
  {
    defaultNavigationOptions: () => ({
      header: null,
    }),
  },
);

const TourNavigationContainer = createAppContainer(TourNavigator);

const TourNoStudyNavigator = createStackNavigator(
  {
    Tour: {
      screen: TourNoStudyConfirmScreen,
    },
    Registration: {
      screen: RegistrationNoStudyScreen,
    },
  },
  {
    defaultNavigationOptions: () => ({
      header: null,
    }),
  },
);

const TourNoStudyNavigationContainer = createAppContainer(TourNoStudyNavigator);

class RootNavigator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      consent_updated: false,
      milestones_updated: false,
      milestone_calendar_updated: false,
    };

    this.props.fetchSession();
    this.props.fetchRespondent();
  }

  componentDidMount() {
    const {
      consent_updated,
      milestones_updated,
      milestone_calendar_updated,
    } = this.state;
    const subject = this.props.registration.subject;

    if (CONSTANTS.USE_PUSH_NOTIFICATIONS) {
      const notifications_updated_at = moment().subtract(8, 'days').toISOString();
      this.props.updateSession({ notifications_updated_at });
      Notifications.cancelAllScheduledNotificationsAsync();
      addColumn('sessions', 'push_token', 'text');
      addColumn('sessions', 'consent_updated_at', 'text');
      addColumn('sessions', 'consent_last_updated_at', 'text');
      addColumn('sessions', 'milestones_updated_at', 'text');
      addColumn('sessions', 'milestones_last_updated_at', 'text');
      addColumn('sessions', 'milestone_calendar_updated_at', 'text');
      addColumn('sessions', 'milestone_calendar_last_updated_at', 'text');
      addColumn('studies', 'duration_days', 'integer');
      if (Constants.isDevice) {
        // simulator will not generate a token
        this._notificationSubscription = this.registerForPushNotificationsAsync();
      }
    } else {
      this._notificationSubscription = this.registerForNotifications();
    }
    if (!consent_updated) {
      this.props.apiFetchConsentLastUpdated(CONSTANTS.STUDY_ID);
      this.setState({ consent_updated: true });
    }
    if (!milestones_updated) {
      this.props.apiFetchMilestonesLastUpdated(CONSTANTS.STUDY_ID);
      this.setState({ milestones_updated: true });
    }
    if (subject.fetched && !isEmpty(subject.data) && !milestone_calendar_updated) {
      this.props.apiFetchMilestoneCalendarLastUpdated(subject.data.api_id);
      this.setState({ milestone_calendar_updated: true });
    }
  }

  shouldComponentUpdate(nextProps) {
    if (!CONSTANTS.USE_PUSH_NOTIFICATIONS) {
      const notifications = nextProps.notifications;
      if (notifications.notifications.fetching || notifications.momentary_assessments.fetching) {
        return false;
      }
    }
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    // update local notifications every 7 days to stay under the
    // IOS limit of 64 notifications
    const calendar = this.props.milestones.calendar;
    const session = this.props.session;
    const subject = this.props.registration.subject.data;
    const consent = this.props.registration.consent.data;
    if (!isEmpty(calendar.data) && !isEmpty(subject)) {
      if (!session.fetching && session.notifications_permission === 'granted') {
        if (!CONSTANTS.USE_PUSH_NOTIFICATIONS) {
          this._handleUpdateNotifications(session, subject);
        }
      }
    }

    if (!session.fetching && session.fetched) {
      const {
        consent_updated_at,
        consent_last_updated_at,
        consent_last_version_id,
        milestones_updated_at,
        milestones_last_updated_at,
        milestone_calendar_updated_at,
        milestone_calendar_last_updated_at,
      } = this.props.session;

      if (consent_updated_at && consent_updated_at !== consent_last_updated_at) {
        const apiConsent = this.props.registration.apiConsent;
        if (!apiConsent.fetching && !apiConsent.fetched) {
          this.props.apiFetchConsent(CONSTANTS.STUDY_ID);
          this.props.updateSession({ consent_last_updated_at: consent_updated_at })
        }
      }
      if (milestones_updated_at && milestones_updated_at !== milestones_last_updated_at) {
        const api_milestones = this.props.milestones.api_milestones;
        if (!api_milestones.fetching && !api_milestones.fetched) {
          this.props.apiFetchMilestones();
          this.props.updateSession({ milestones_last_updated_at: milestones_updated_at })
        }
      }
      if (!isEmpty(milestone_calendar_updated_at) && milestone_calendar_updated_at !== milestone_calendar_last_updated_at) {
        const api_calendar = this.props.milestones.api_calendar;
        if (!api_calendar.fetching && !api_calendar.fetched) {
          this.props.apiFetchMilestoneCalendar({subject_id: subject.api_id});
          this.props.updateSession({ milestone_calendar_last_updated_at: milestone_calendar_updated_at })
        }
      }
    }
  };

  _handleUpdateNotifications = (session, subject) => {
    const today = moment();
    let notifications_updated_at = moment(session.notifications_updated_at);
    // default next to update notifications
    let next_notification_update_at = moment().subtract(1, 'days');
    if (notifications_updated_at.isValid()) {
      // change this to 30 seconds to get more frequent updates
      //next_notification_update_at = notifications_updated_at.add(30, 'seconds');
      next_notification_update_at = notifications_updated_at.add(7, 'days');
    }

    if (today.isAfter(next_notification_update_at)) {
      let studyEndDate = '';
      if (subject.date_of_birth) {
        studyEndDate = moment(subject.date_of_birth).add(CONSTANTS.POST_BIRTH_END_OF_STUDY, 'days')
      } else {
        studyEndDate = moment(subject.expected_date_of_birth).add(CONSTANTS.POST_BIRTH_END_OF_STUDY, 'days')
      }
      notifications_updated_at = today.toISOString();
      this.props.updateSession({ notifications_updated_at });
      this.props.deleteAllNotifications();
      this.props.updateNotifications();
      this.props.updateMomentaryAssessments(studyEndDate);

      Sentry.configureScope(scope => {
        scope.setExtra(
          'notifications_updated_at',
          JSON.stringify(notifications_updated_at),
        );
      });

    } else {
      // console.log('****** Next Notfication Update Scheduled: ', next_notification_update_at.toISOString());
    } // notifications_updated_at
  };

  _handleNotificationOnPress = data => {
    const task = find(this.props.milestones.tasks.data, ['id', data.task_id]);
    NavigationService.navigate('MilestoneQuestions', { task });
  };

  _handleMomentaryAssessment = data => {
    this.props.showMomentaryAssessment(data);
  };

  _handleNotificatioResponse = ({ origin, data, remote }) => {
    // origin
    // 'received' app is open and foregrounded
    // 'received' app is open but was backgrounded (ios)
    // 'selected' app is open but was backgrounded (Andriod)
    // 'selected' app was not open and opened by selecting notification
    // 'selected' app was not open but opened by app icon (ios only)
    if (data.momentary_assessment) {
      this._handleMomentaryAssessment(data);
    } else if (origin === 'selected') {
      this._handleNotificationOnPress(data);
    } else {
      showMessage({
        type: data.type,
        message: data.title,
        description: data.body,
        color: Colors.flashMessage,
        backgroundColor: Colors.flashMessageBackground,
        autoHide: false,
        icon: data.type,
        onPress: () => this._handleNotificationOnPress(data),
      });
    }
  };

  registerForPushNotificationsAsync = async () => {
    const session = this.props.session;
    let notifications_permission = session.notifications_permission;
    if (Constants.isDevice) {
      // android permissions are given on install and may already exist
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS,
      );
      notifications_permission = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS,
        );
        notifications_permission = status;
      }
      // only ask if permissions have not already been determined, because
      // iOS won't necessarily prompt the user a second time.
      if (notifications_permission !== 'granted') {
        Alert.alert(
          'Permissions',
          'Failed to get permissions for Push Notifications!',
          [{ text: 'Cancel', onPress: () => {}, style: 'cancel' }],
          { cancelable: true },
        );
        return;
      }

      const result = await Notifications.getExpoPushTokenAsync();

      this.props.updateSession({ notifications_permission, push_token: result.data });
      const respondent = this.props.registration.respondent.data;
      const data = {api_id: respondent.api_id, push_token: result.data}
      this.props.apiUpdateRespondent(session, data)

      // Watch for incoming notifications
      //Notifications.addListener(this._handleNotification);
      Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);

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

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('screeningEvents', {
          name: 'screeningEvents',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          color: Colors.notifications,
        });
      }

    } else {
      Alert.alert(
        'Notifications',
        'Must use physical device for Push Notifications',
        [{ text: 'Cancel', onPress: () => {}, style: 'cancel' }],
        { cancelable: true },
      );
    } // isDevice
  };

  registerForNotifications = async () => {
    const notifications_permission = this.props.session.notifications_permission;
    // android permissions are given on install
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS,
    );
    let finalStatus = existingStatus;

    // console.log("Notifications Permissions:", existingStatus)

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
      if (
        Platform.OS === 'ios' &&
        finalStatus === 'granted' &&
        notifications_permission !== 'granted'
      ) {
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

      if (Platform.OS === 'android') {
        Notifications.createChannelAndroidAsync('screeningEvents', {
          name: 'Screening Events',
          priority: 'max',
          vibrate: [0, 250, 250, 250],
          color: Colors.notifications,
        });
      }
    }

    this.props.updateSession({ notifications_permission: finalStatus });

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      console.log('Notifications Permission Denied');
      return null;
    }
    // Watch for incoming notifications
    // Notifications.addListener(this._handleNotificatioResponse);
    Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);
  };

  render() {
    const registration_state = this.props.session.registration_state;
    if (States.REGISTRATION_COMPLETE.includes(registration_state)) {
      return (
        <AppNavigator
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        />
      );
    }
    if (States.REGISTERING_NO_STUDY.includes(registration_state)) {
      return <TourNoStudyNavigationContainer />;
    }
    if (States.REGISTERING_CONSENT.includes(registration_state)) {
      return <ConsentNavigationContainer />;
    }
    if (States.REGISTERING_REGISTRATION.includes(registration_state)) {
      return <RegistrationNavigationContainer />;
    }
    if ( ['none', 'undefined'].includes(registration_state) ) {
      return <TourNavigationContainer />;
    }
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
  fetchSession,
  apiFetchConsent,
  fetchRespondent,
  apiUpdateRespondent,
  apiFetchConsentLastUpdated,
  apiFetchMilestones,
  apiFetchMilestonesLastUpdated,
  apiFetchMilestoneCalendar,
  apiFetchMilestoneCalendarLastUpdated,
  showMomentaryAssessment,
  updateNotifications,
  updateMomentaryAssessments,
  deleteAllNotifications,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RootNavigator);

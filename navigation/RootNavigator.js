import React, { Component } from 'react';
import { Platform, Alert } from 'react-native';

import { Notifications } from 'expo';

import * as Permissions from 'expo-permissions';

import { createAppContainer, createStackNavigator } from 'react-navigation';

import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';

import { showMessage } from 'react-native-flash-message';

import { connect } from 'react-redux';
import { updateSession, fetchSession } from '../actions/session_actions';
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
import RegistrationScreen from '../screens/RegistrationScreen';
import TourNoStudyConfirmScreen from '../screens/TourNoStudyConfirmScreen';
import RegistrationNoStudyScreen from '../screens/RegistrationNoStudyScreen';

import { openSettings } from '../components/permissions';

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
  componentWillMount() {
    this.props.fetchSession();
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('screeningEvents', {
        name: 'Screening Events',
        priority: 'max',
        vibrate: [0, 250, 250, 250],
        color: Colors.notifications,
      });
    }
    this._notificationSubscription = this.registerForNotifications();
  }

  shouldComponentUpdate(nextProps) {
    const notifications = nextProps.notifications;
    if (notifications.notifications.fetching || notifications.momentary_assessments.fetching) {
      return false;
    }
    return true;
  }

  componentWillUpdate(nextProps) {
    // update local notifications every 7 days to stay under the
    // IOS limit of 64 notifications
    const calendar = nextProps.milestones.calendar;
    const session = nextProps.session;
    const subject = nextProps.registration.subject.data;

    if (!isEmpty(calendar.data) && !isEmpty(subject)) {
      const notifications_permission = nextProps.session.notifications_permission;
      if (!session.fetching && notifications_permission === 'granted') {
        const today = moment();
        let notifications_updated_at = moment(session.notifications_updated_at);
        // default next to update notifications
        let next_notification_update_at = moment().subtract(1, 'days');
        if (notifications_updated_at.isValid()) {
          // change this to 30 seconds to get more frequent updates
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
        } else {
          // console.log('****** Next Notfication Update Scheduled: ', next_notification_update_at.toISOString());
        } // notifications_updated_at
      } // session.fetching
    } // calendar.data
  }

  _handleNotificationOnPress = data => {
    const task = find(this.props.milestones.tasks.data, ['id', data.task_id]);
    NavigationService.navigate('MilestoneQuestions', { task });
  };

  _handleMomentaryAssessment = data => {
    this.props.showMomentaryAssessment(data);
  };

  _handleNotification = ({ origin, data, remote }) => {
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

  registerForNotifications = async () => {
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
      }
    }

    this.props.updateSession({ notifications_permission: finalStatus });

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      console.log('Notifications Permission Denied');
      return null;
    }
    // Watch for incoming notifications
    Notifications.addListener(this._handleNotification);
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
    if (registration_state === 'none') {
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
  showMomentaryAssessment,
  updateNotifications,
  updateMomentaryAssessments,
  deleteAllNotifications,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RootNavigator);

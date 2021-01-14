import React, { Component } from 'react';
import { Platform, Alert } from 'react-native';

import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';

import { showMessage } from 'react-native-flash-message';

import { connect } from 'react-redux';
import { updateSession, fetchSession } from '../actions/session_actions';

import * as Sentry from 'sentry-expo';

import {
  apiFetchMilestones,
  apiFetchMilestoneCalendar,
} from '../actions/milestone_actions';

import {
  fetchRespondent,
  apiUpdateRespondent,
} from '../actions/registration_actions';

import {
  showMomentaryAssessment,
  updateNotifications,
  updateMomentaryAssessments,
  deleteAllNotifications,
} from '../actions/notification_actions';

import { fetchMilestoneAttachments } from '../actions/milestone_actions';

import AppNavigator from './AppNavigator';
import NavigationService from './NavigationService';

import TourScreen from '../screens/TourScreen';
import SignInScreen from '../screens/SignInScreen';
import ConsentScreen from '../screens/ConsentScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import TourNoStudyConfirmScreen from '../screens/TourNoStudyConfirmScreen';
import RegistrationNoStudyScreen from '../screens/RegistrationNoStudyScreen';

import UploadMilestoneAttachment from '../database/upload_milestone_attachment';

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
      uploadAttachments: [],
      uploadAttachmentsSubmitted: false,
    };

    this.props.fetchSession();
    this.props.fetchMilestoneAttachments({ upload: true });
  }

  componentDidMount() {

    this._notificationSubscription = this.registerForNotifications();

    // temporary code for backward compatibility
    addColumn('sessions', 'current_group_index', 'integer');
    addColumn('attachments', 'size', 'integer');
    addColumn('attachments', 'uploaded', 'integer');
    addColumn('attachments', 'checksum', 'string');
  }

  shouldComponentUpdate(nextProps) {
    const notifications = nextProps.notifications;
    if (
      notifications.notifications.fetching ||
      notifications.momentary_assessments.fetching
    ) {
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    const calendar = this.props.milestones.calendar;
    const session = this.props.session;
    const subject = this.props.registration.subject.data;
    const attachments = this.props.milestones.attachments;
    const { uploadAttachments, uploadAttachmentsSubmitted } = this.state;

    // update local notifications every 7 days to stay under the
    // IOS limit of 64 notifications
    if (!isEmpty(calendar.data) && !isEmpty(subject)) {
      if (!session.fetching && session.notifications_permission === 'granted') {
        this._handleUpdateNotifications(session, subject);
      }
    }

    if (
      !attachments.fetching &&
      attachments.fetched &&
      !isEmpty(attachments.data) &&
      !uploadAttachmentsSubmitted
    ) {
      this.setState({ uploadAttachments: attachments.data });
    }
    // upload directly to AWS any attachments not yet uploaded
    if (!isEmpty(uploadAttachments) && session.connectionType === 'wifi') {
      uploadAttachments.forEach(attachment => {
        UploadMilestoneAttachment(session, attachment);
      });
      this.setState({ uploadAttachmentsSubmitted: true, uploadAttachments: [] });
    }
  }

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

  _handleNotification = async ({ origin, data, remote }) => {
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
    }

    this.props.updateSession({ notifications_permission: finalStatus });

    if (finalStatus !== 'granted') {
      console.log('Notifications Permission Denied');
    }

    if (finalStatus === 'granted' && Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'screeningEvents',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Watch for incoming notifications
    Notifications.setNotificationHandler(this._handleNotification);
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
  showMomentaryAssessment,
  updateNotifications,
  updateMomentaryAssessments,
  deleteAllNotifications,
  fetchMilestoneAttachments,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RootNavigator);

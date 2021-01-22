import React, { Component } from 'react';
import { View, Platform } from 'react-native';

import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { showMessage } from 'react-native-flash-message';

import isEmpty from 'lodash/isEmpty';
import find from 'lodash/find';

import moment from 'moment';

import { connect } from 'react-redux';

import {
  updateSession,
  fetchSession,
  apiFetchMilestonesLastUpdated,
  apiFetchMilestoneCalendarLastUpdated,
} from '../actions/session_actions';

import {
  fetchRespondent,
  updateRespondent,
  apiUpdateRespondent,
} from '../actions/registration_actions';

import {
  showMomentaryAssessment,
  updateNotifications,
  updateMomentaryAssessments,
  deleteAllNotifications,
} from '../actions/notification_actions';

import {
  apiFetchMilestones,
  apiFetchMilestoneCalendar,
  resetMilestoneAnswers,
  fetchMilestoneAnswers,
  fetchMilestoneAttachments,
} from '../actions/milestone_actions';

import AppNavigator from './AppNavigator';
import NavigationService from './NavigationService';

import TourScreen from '../screens/TourScreen';
import SignInScreen from '../screens/SignInScreen';
import ConsentScreen from '../screens/ConsentScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import TourNoStudyConfirmScreen from '../screens/TourNoStudyConfirmScreen';
import RegistrationNoStudyScreen from '../screens/RegistrationNoStudyScreen';

import UploadMilestoneAnswers from '../database/upload_milestone_answers';
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
      uploadAnswers: [],
      uploadAnswersSubmitted: false,
      milestones_updated: false,
      milestone_calendar_updated: false,
      uploadAttachments: [],
      uploadAttachmentsSubmitted: false,
    };

    this.responseListener = null;

    this.props.fetchSession();
    this.props.fetchMilestoneAnswers({ api_id: 'empty' });
    this.props.fetchRespondent();
    this.props.fetchMilestoneAttachments({ upload: true });
  }

  componentDidMount() {

    const { milestones_updated, milestone_calendar_updated } = this.state;
    const session = this.props.session;
    const subject = this.props.registration.subject;

    if (!milestones_updated) {
      this.props.apiFetchMilestonesLastUpdated(CONSTANTS.STUDY_ID);
      this.setState({ milestones_updated: true });
    }
    if (subject.fetched && !milestone_calendar_updated) {
      this.props.apiFetchMilestoneCalendarLastUpdated(subject.data.api_id);
      this.setState({ milestone_calendar_updated: true });
    }
    this._getNotificationPermissions();
    Notifications.addNotificationResponseReceivedListener(response => {
      this._handleNotificationResponse(response);
    });

    // temporary code for backward compatibility
    Notifications.cancelAllScheduledNotificationsAsync();
    addColumn('sessions', 'push_token', 'text');
    addColumn('sessions', 'milestones_updated_at', 'text');
    addColumn('sessions', 'milestones_last_updated_at', 'text');
    addColumn('sessions', 'milestone_calendar_updated_at', 'text');
    addColumn('sessions', 'milestone_calendar_last_updated_at', 'text');
    addColumn('sessions', 'current_group_index', 'integer');
    addColumn('attachments', 'size', 'integer');
    addColumn('attachments', 'uploaded', 'integer');
    addColumn('attachments', 'checksum', 'string');
  }

  shouldComponentUpdate(nextProps) {
    if (!CONSTANTS.USE_PUSH_NOTIFICATIONS) {
      const notifications = nextProps.notifications;
      if (
        notifications.notifications.fetching ||
        notifications.momentary_assessments.fetching
      ) {
        return false;
      }
    }
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    const calendar = this.props.milestones.calendar;
    const session = this.props.session;
    const subject = this.props.registration.subject.data;
    const attachments = this.props.milestones.attachments;
    const answers = this.props.milestones.answers;
    const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;
    const {
      uploadAnswers,
      uploadAnswersSubmitted,
      uploadAttachments,
      uploadAttachmentsSubmitted,
    } = this.state;

    // update local notifications every 7 days to stay under the
    // IOS limit of 64 notifications
    if (!isEmpty(calendar.data) && !isEmpty(subject)) {
      if (!session.fetching && session.notifications_permission === 'granted') {
        if (!CONSTANTS.USE_PUSH_NOTIFICATIONS) {
          HandleUpdateNotifications(session, subject);
        }
      }
    }

    if (!session.fetching && session.fetched) {
      const {
        milestones_updated_at,
        milestones_last_updated_at,
        milestone_calendar_updated_at,
        milestone_calendar_last_updated_at,
      } = this.props.session;

      if (
        !isEmpty(milestones_updated_at) &&
        milestones_updated_at !== milestones_last_updated_at
      ) {
        const api_milestones = this.props.milestones.api_milestones;
        if (!api_milestones.fetching && !api_milestones.fetched) {
          this.props.apiFetchMilestones();
          this.props.updateSession({ milestones_last_updated_at: milestones_updated_at })
        }
      }
      if (
        !isEmpty(milestone_calendar_updated_at) && 
        milestone_calendar_updated_at !== milestone_calendar_last_updated_at
      ) {
        const api_calendar = this.props.milestones.api_calendar;
        if (!api_calendar.fetching && !api_calendar.fetched) {
          this.props.apiFetchMilestoneCalendar({subject_id: subject.api_id});
          this.props.updateSession({ milestone_calendar_last_updated_at: milestone_calendar_updated_at })
        }
      }
     this._confirmPushNotificationRegistration();
    } // !session.fetching && session.fetched

    if (
      inStudy &&
      !answers.fetching &&
      answers.fetched &&
      !isEmpty(answers.data) &&
      !uploadAnswersSubmitted
    ) {
      this.setState({ uploadAnswers: answers.data });
    }
    // upload any answers with no api_id
    if (
      inStudy &&
      !isEmpty(uploadAnswers) &&
      session.connectionType === 'wifi'
    ) {
      UploadMilestoneAnswers(uploadAnswers);
      this.props.resetMilestoneAnswers();
      this.setState({ uploadAnswersSubmitted: true, uploadAnswers: [] });
    }

    if (
      inStudy &&
      !attachments.fetching &&
      attachments.fetched &&
      !isEmpty(attachments.data) &&
      !uploadAttachmentsSubmitted
    ) {
      this.setState({ uploadAttachments: attachments.data });
    }
    // upload directly to AWS any attachments not yet uploaded
    if (
      inStudy &&
      !isEmpty(uploadAttachments) && 
      session.connectionType === 'wifi'
    ) {
      uploadAttachments.forEach(attachment => {
        UploadMilestoneAttachment(session, attachment);
      });
      this.setState({ uploadAttachmentsSubmitted: true, uploadAttachments: [] });
    }
  }

  _handleNotificationOnPress = data => {
    const tasks = this.props.milestones.tasks.data;
    const task = find(tasks, ['id', data.task_id]);
    NavigationService.navigate('MilestoneQuestions', { task });
  };

  _handleMomentaryAssessment = data => {
    this.props.showMomentaryAssessment(data);
  };

  _handleNotificationResponse = async response => {
    console.log({response});
    const data = response.notification.request.content.data;

    if (data.momentary_assessment) {
      this._handleMomentaryAssessment(data);
    } else if (data.task_id) {
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

  _getNotificationPermissions = async () => {
    const session = this.props.session;
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
    if (notifications_permission === 'granted') {
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
        'Permissions',
        'Failed to get permissions for Push Notifications!',
        [{ text: 'Cancel', onPress: () => {}, style: 'cancel' }],
        { cancelable: true },
      );
    }
  }

  _confirmPushNotificationRegistration = async () => {
    // simulator will not generate a token
    if (!Constants.isDevice) return null;
    const session = this.props.session;
    const respondent = this.props.registration.respondent.data;
    if (
      session.notifications_permission === 'granted' &&
      isEmpty(session.push_token) &&
      !isEmpty(respondent) && ![null, undefined].includes(respondent.api_id)
    ) {
      const result = await Notifications.getExpoPushTokenAsync();
      const push_token = result.data;
      const api_id = respondent.api_id;
      this.props.updateSession({ push_token });
      this.props.updateRespondent({ push_token });
      this.props.apiUpdateRespondent(session, { api_id, push_token });
    }
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
  resetMilestoneAnswers,
  fetchMilestoneAnswers,
  fetchRespondent,
  updateRespondent,
  apiUpdateRespondent,
  apiFetchMilestones,
  apiFetchMilestonesLastUpdated,
  apiFetchMilestoneCalendar,
  apiFetchMilestoneCalendarLastUpdated,
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

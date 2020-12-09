import React, { Component } from 'react';
import { View, Platform } from 'react-native';

import * as Notifications from 'expo-notifications';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import { showMessage } from 'react-native-flash-message';

import isEmpty from 'lodash/isEmpty';
import moment from 'moment';

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

import { addColumn } from '../database/common';

//import {
//  RegisterForNotifications,
//  HandleUpdateNotifications,
//} from '../notifications';

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
    Consent: {
      screen: ConsentScreen,
    },
    UpdateConsent: {
      screen: UpdateConsentScreen,
    },
  },
  {
    defaultNavigationOptions: headerOptions,
  },
);

const ConsentNavigationContainer = createAppContainer(ConsentNavigator);

const UpdateConsentNavigator = createStackNavigator(
  {
    UpdateConsent: {
      screen: UpdateConsentScreen,
    },
  },
  {
    defaultNavigationOptions: headerOptions,
  },
);

const UpdateConsentNavigationContainer = createAppContainer(UpdateConsentNavigator);

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
    const session = this.props.session;
    const subject = this.props.registration.subject;

    if (CONSTANTS.USE_PUSH_NOTIFICATIONS) {
      const notifications_updated_at = moment().subtract(8, 'days').toISOString();
      this.props.updateSession({ notifications_updated_at });

      // temporary code for backward compatibility
      Notifications.cancelAllScheduledNotificationsAsync();
      addColumn('sessions', 'push_token', 'text');
      addColumn('sessions', 'consent_updated_at', 'text');
      addColumn('sessions', 'consent_last_updated_at', 'text');
      addColumn('sessions', 'milestones_updated_at', 'text');
      addColumn('sessions', 'milestones_last_updated_at', 'text');
      addColumn('sessions', 'milestone_calendar_updated_at', 'text');
      addColumn('sessions', 'milestone_calendar_last_updated_at', 'text');
      addColumn('studies', 'duration_days', 'integer');

    } else {
      //RegisterForNotifications();
    }
    Notifications.addNotificationResponseReceivedListener(
      this._handleNotificationResponse,
    );
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('screeningEvents', {
        name: 'screeningEvents',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        color: Colors.notifications,
      });
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
    // update local notifications every 7 days to stay under the
    // IOS limit of 64 notifications
    const calendar = this.props.milestones.calendar;
    const session = this.props.session;
    const subject = this.props.registration.subject.data;
    const consent = this.props.registration.consent.data;
    if (!isEmpty(calendar.data) && !isEmpty(subject)) {
      if (!session.fetching && session.notifications_permission === 'granted') {
        if (!CONSTANTS.USE_PUSH_NOTIFICATIONS) {
          HandleUpdateNotifications(session, subject);
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
        registration_state,
      } = this.props.session;
      const consent = this.props.registration.consent.data;
      const apiConsent = this.props.registration.apiConsent;

      if (!isEmpty(consent_updated_at) && !apiConsent.fetching) {
        if (consent_updated_at !== consent_last_updated_at) {
          this.props.apiFetchConsent(CONSTANTS.STUDY_ID);
          this.props.updateSession({ consent_last_updated_at: consent_updated_at })
        }
        if (
          registration_state === States.REGISTERED_AS_IN_STUDY &&
          consent_last_version_id !== consent.version_id
        ) {
          this.props.updateSession({ registration_state: States.REGISTERED_UPDATE_CONSENT });
        }
        if (
          registration_state === States.REGISTERED_UPDATE_CONSENT &&
          consent_last_version_id === consent.version_id
        ) {
          this.props.updateSession({ registration_state: States.REGISTERED_AS_IN_STUDY });
        }
      }
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

  _handleNotificationResponse = ({ origin, data, remote }) => {
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

  render() {
    const registration_state = this.props.session.registration_state;
    if (States.REGISTERING_NO_STUDY.includes(registration_state)) {
      return <TourNoStudyNavigationContainer />;
    }
    if (States.REGISTERING_CONSENT.includes(registration_state)) {
      return <ConsentNavigationContainer />;
    }
    if (States.REGISTERING_REGISTRATION.includes(registration_state)) {
      return <RegistrationNavigationContainer />;
    }
    if (States.REGISTRATION_COMPLETE.includes(registration_state)) {
      return (
        <AppNavigator
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        />
      );
    }
    if (registration_state === States.REGISTERED_UPDATE_CONSENT) {
      return <UpdateConsentNavigationContainer />;
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

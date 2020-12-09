import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SQLite from 'expo-sqlite';
import * as Permissions from 'expo-permissions';
import { showMessage } from 'react-native-flash-message';

import * as Sentry from 'sentry-expo';


import moment from 'moment';
import forEach from 'lodash/forEach';
import isObject from 'lodash/isObject';
import map from 'lodash/map';

import NavigationService from '../navigation/NavigationService';

import store from '../store';
import { updateSession } from '../actions/session_actions';
import { apiCreateMilestoneCalendar } from '../actions/milestone_actions';
import { showMomentaryAssessment } from '../actions/notification_actions';


import Colors from '../constants/Colors';
import CONSTANTS from '../constants';

const db = SQLite.openDatabase('babysteps.db');

const notifications = [];

function scheduleNotificaton(localNotification, scheduleTime) {
  const schedulingOptions = { time: scheduleTime.valueOf() };
  Notifications.scheduleNotificationAsync(localNotification, schedulingOptions);
  const notify_at = scheduleTime.toISOString();
  const data = localNotification.data;
  console.log('****** Notfication Scheduled: ', notify_at, data.body);
  createNotifications([{ ...data, notify_at, channel_id: 'screeningEvents' }]);
}

function localNotificationMessage(entry) {
  return {
    title: entry.message,
    body: entry.name,
    data: {
      task_id: entry.task_id,
      momentary_assessment: entry.momentary_assessment,
      response_scale: entry.response_scale,
      title: entry.message,
      body: entry.name,
      type: 'info',
    },
    ios: {
      sound: true,
    },
    android: {
      sound: true,
      vibrate: true,
      priority: 'high',
      channelId: 'screeningEvents',
    },
  };
}

function milestoneFrequency(frequency) {
  switch(frequency) {
    case 'daily':
      return [1, 1];
    case 'bi_weekly':
      return [7, 2];
    case 'weekly':
      return [7, 1];
    case 'bi_monthly':
      return [30, 2];
    case 'monthly':
      return [30, 1];
    case 'bi_annually':
      return [365, 2];
    case 'annually':
      return [365, 1];
    default:
      return [7, 2];
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  //The maximum and minimum are inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function buildMomentaryAssessmentEntries(entry, studyEndDate) {
  // notifications require title and body
  if (!entry.message || !entry.name || !entry.frequency) return null;
  let cycleDate = moment(entry.notify_at).startOf('day');
  if (entry.notify_at === null || moment().isAfter(entry.notify_at)) {
    cycleDate = moment().startOf('day');
  }
  // only construct 14 days of momentary assessments
  // in order to stay under the 64 local notifications
  // limit of IOS.
  let endDate = moment(cycleDate).add(14, 'days');
  if (endDate.isAfter(studyEndDate)) endDate = studyEndDate;
  const term = milestoneFrequency(entry.frequency)[0];
  const number = milestoneFrequency(entry.frequency)[1];
  while (moment(cycleDate).isBefore(endDate)) {
    for (let i = 0; i < number; i++) {
      const scheduleTime = moment(cycleDate)
        .add(getRandomInt(1, term), 'days')
        .add(getRandomInt(8, 19), 'hours')
        .add(getRandomInt(0, 59), 'minutes');
      // generate immediate notification
      // const scheduleTime = moment();
      const localNotification = localNotificationMessage(entry);
      scheduleNotificaton(localNotification, scheduleTime);
      apiCreateCalendarEntry(entry, scheduleTime);
      cycleDate = scheduleTime.startOf('day');
    }
  }
}

export const apiCreateCalendarEntry = (entry, scheduleTime) => {
  const notify_at = scheduleTime.toISOString();
  const data = {
    milestone_trigger: {
      subject_id: entry.subject_id,
      milestone_id: entry.milestone_id,
      task_id: entry.task_id,
      task_type: 'momentary_assessment_notice',
      available_start_at: entry.available_start_at,
      available_end_at: entry.available_end_at,
      study_only: entry.study_only,
      pregnancy_period: entry.pregnancy_period,
      momentary_assessment: entry.momentary_assessment,
      notify_at,
    },
  };
  store.dispatch(apiCreateMilestoneCalendar(entry.subject_id, data));
};

export const setMomentaryAssessments = (entries, studyEndDate) => {
  //Sentry.setExtraContext({ ema_entries: JSON.stringify(entries) });
  forEach(entries, entry => {
    buildMomentaryAssessmentEntries(entry, studyEndDate);
  });
};

export const setNotifications = entries => {
  forEach(entries, entry => {
    // notifications requires a task id, title and body
    if (entry.task_id && (entry.title || entry.body)) {
      const localNotification = localNotificationMessage(entry);
      const scheduleTime = moment(entry.notify_at);
      if (scheduleTime.isValid()) {
        scheduleNotificaton(localNotification, scheduleTime);
      }
    } else {
      Sentry.captureMessage(`Notification for ${entry.title} lacks correct data`);
    }
  });
};

export const deleteNotifications = () => {
  Notifications.cancelAllScheduledNotificationsAsync();
  // console.log('****** All Notifications Cancelled');
};

export const createNotifications = entries => {
  const notificationFields = [
    'task_id',
    'notify_at',
    'momentary_assessment',
    'response_scale',
    'title',
    'body',
    'type',
    'channel_id',
  ];
  const values = map(entries, entry => {
    return `(${entry.task_id}, "${entry.notify_at}", ${entry.momentary_assessment}, "${entry.response_scale}", "${entry.title}", "${entry.body}", "info", "screeningEvents")`;
  });
  const sql =`INSERT INTO notifications ( ${notificationFields.join(', ')} ) VALUES ${values.join(', ')};`;

  //console.log("Creating Notification", entries, sql);

  return db.transaction(tx => {
    tx.executeSql(
      sql,
      [],
      (_, response) => {
        // console.log('****** Notifications Saved');
      },
      (_, error) => {
        console.log('****** Notifications Error', error);
      },
    );
  });
};

const HandleNotificationOnPress = (tasks, data) => {
  const task = find(tasks, ['id', data.task_id]);
  NavigationService.navigate('MilestoneQuestions', { task });
};

const HandleMomentaryAssessment = data => {
  store.dispatch(showMomentaryAssessment(data));
};

const HandleNotificatioResponse = ({ tasks, origin, data, remote }) => {
  // origin
  // 'received' app is open and foregrounded
  // 'received' app is open but was backgrounded (ios)
  // 'selected' app is open but was backgrounded (Andriod)
  // 'selected' app was not open and opened by selecting notification
  // 'selected' app was not open but opened by app icon (ios only)
  if (data.momentary_assessment) {
    HandleMomentaryAssessment(data);
  } else if (origin === 'selected') {
    HandleNotificationOnPress(tasks, data);
  } else {
    showMessage({
      type: data.type,
      message: data.title,
      description: data.body,
      color: Colors.flashMessage,
      backgroundColor: Colors.flashMessageBackground,
      autoHide: false,
      icon: data.type,
      onPress: () => HandleNotificationOnPress(tasks, data),
    });
  }
};

// local notifications - deprecated
export const RegisterForNotifications = async () => {
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

  store.dispatch(updateSession({ notifications_permission: finalStatus }));

  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    console.log('Notifications Permission Denied');
    return null;
  }
  // Watch for incoming notifications
  // Notifications.addListener(this._handleNotificatioResponse);
  Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);
};

// local notifications - deprecated
export const HandleUpdateNotifications = (session, subject) => {
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
    store.dispatch(updateSession({ notifications_updated_at }));
    store.dispatch(deleteAllNotifications());
    store.dispatch(updateNotifications());
    store.dispatch(updateMomentaryAssessments(studyEndDate));

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


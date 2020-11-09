import { Notifications } from 'expo';
import * as SQLite from 'expo-sqlite';

import * as Sentry from 'sentry-expo';

import moment from 'moment';
import forEach from 'lodash/forEach';
import isObject from 'lodash/isObject';
import map from 'lodash/map';

import store from '../store';
import { apiCreateMilestoneCalendar } from '../actions/milestone_actions';

const db = SQLite.openDatabase('babysteps.db');

const notifications = [];

function scheduleNotificaton(localNotification, scheduleTime) {
  const schedulingOptions = { time: scheduleTime.valueOf() };
  Notifications.scheduleLocalNotificationAsync(
    localNotification,
    schedulingOptions,
  );
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
  //if (!isObject(entry)) {
    //Sentry.setExtraContext({ ema_entry_non_object: JSON.stringify(entry) });
  //}

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

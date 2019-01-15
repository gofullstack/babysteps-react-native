import { Notifications, SQLite } from 'expo';

import moment from 'moment';
import forEach from 'lodash/forEach';

const db = SQLite.openDatabase('babysteps.db');

function scheduleNotificaton(localNotification, scheduleTime) {
  const schedulingOptions = { time: scheduleTime.valueOf() };
  Notifications.scheduleLocalNotificationAsync(
    localNotification,
    schedulingOptions,
  );
  console.log('****** Notfication Scheduled: ', scheduleTime.toISOString(), localNotification.body );
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
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  //The maximum and minimum are inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function buildMomentaryAssessmentEntries(entry, studyEndDate) {
  let cycleDate = moment(entry.notify_at);
  if (moment().isAfter(entry.notify_at)) cycleDate = moment();
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
      const localNotification = localNotificationMessage(entry);
      scheduleNotificaton(localNotification, scheduleTime);
      cycleDate = scheduleTime;
    }
  }
}

export const setMomentaryAssessments = (entries, studyEndDate) => {
  forEach(entries, entry => {
    buildMomentaryAssessmentEntries(entry, studyEndDate);
  });
};

export const setNotifications = entries => {
  forEach(entries, entry => {
    const localNotification = localNotificationMessage(entry);
    const scheduleTime = moment(entry.notify_at);
    if (scheduleTime.isValid()) {
      scheduleNotificaton(localNotification, scheduleTime);
    }
  });
};

export const deleteNotifications = () => {
  Notifications.cancelAllScheduledNotificationsAsync();
  console.log('****** All Notifications Cancelled');
};

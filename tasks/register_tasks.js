import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import {
  getFileMetaData,
} from './common';

import TASKS from './constants';

RegisterTasks = async () => {
  TaskManager.defineTask(
    TASKS.UPLOAD_MILESTONE_ATTACHMENT,
    async attachment => {
      const metaData = await getFileMetaData(attachment);
      const active_storage_url = TASKS.ACTIVE_STORAGE_URL;
      try {
        console.log('background fetch running', metaData);

        const result = null;

        return result
          ? BackgroundFetch.Result.NewData
          : BackgroundFetch.Result.NoData;
      } catch (err) {
        return BackgroundFetch.Result.Failed;
      }
    },
  );
};

export default RegisterTasks;

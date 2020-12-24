import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as FileSystem from 'expo-file-system';
//import { FileChecksum } from "@rails/activestorage/src/file_checksum";


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

export const getFileMetaData = async attachment => {
  if (!attachment.size || !attachment.checksum) {
    attachment = await calculateChecksum(attachment);
  }
  return {
    blob: {
      checksum: attachment.checksum,
      filename: attachment.filename,
      content_type: attachment.content_type,
      byte_size: attachment.size,
    },
  };
};

const calculateChecksum = async attachment => {
  const resultFile = await FileSystem.getInfoAsync(attachment.uri, {
    size: true,
    md5: true,
  });
  return { ...attachment, size: resultFile.size, checksum: resultFile.md5 };
};

export const getBlob = async uri => {
  let file = await fetch(uri);
  console.log(file);
  //console.log(await file.blob());
  return file;
};

export default RegisterTasks;

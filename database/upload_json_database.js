import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

import moment from 'moment';

import { store } from '../store';

import { getApiUrl } from './common';

const baseURL = getApiUrl();
const apiToken = Constants.manifest.extra.apiToken;

const executeApiCall = async id => {
  const fileName = `babysteps-${moment().format()}.json`;
  const fileUri = FileSystem.documentDirectory + fileName;

  // save state as json file in file system
  const state = store.getState();
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(state));

  const url = `${baseURL}/users/${id}/attachments`;

  const headers = {
    'Content-Type': 'application/json',
    'Content-File-Name': fileName,
    milestone_token: apiToken,
  };

  const response = await FileSystem.uploadAsync(url, fileUri, {
    headers,
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
    mimeType: 'application/json',
  }).catch(error => {
    console.log({ error });
  });

  return response;
};

const UploadJSONDatabase = async id => {
  console.log('*** Begin Upload JSON Database');
  const response = await executeApiCall(id);
  if (response && response.status === 202) {
    console.log('***** Database uploaded successfully');
  } else {
    console.log({ response });
  }
};

export default UploadJSONDatabase;

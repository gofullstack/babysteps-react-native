import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

import { getApiUrl } from './common';

const baseURL = getApiUrl();
const apiToken = Constants.manifest.extra.apiToken;

const fileUri = FileSystem.documentDirectory + '/SQLite/babysteps.db';

const executeApiCall = async id => {

	const url = `${baseURL}/users/${id}/attachments`;

  const headers = {
    'Content-Type': 'application/vnd.sqlite3',
    'Content-File-Name': 'babysteps.db',
    milestone_token: apiToken,
  };

  const response = await FileSystem.uploadAsync(url, fileUri, {
    headers,
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
    mimeType: 'application/vnd.sqlite3',
  }).catch(error => {
    console.log({ error });
  });

  return response;
};

const UploadSQLiteDatabase = async id => {
	console.log('*** Begin Upload SQLite Database');
	const response = await executeApiCall(id);
  if (response && response.status === 202) {
    console.log('***** Database uploaded successfully');
  } else {
    console.log({ response });
  }
};

export default UploadSQLiteDatabase;

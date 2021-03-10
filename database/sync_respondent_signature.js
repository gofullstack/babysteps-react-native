import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';

import { getApiUrl } from './common';

import CONSTANTS from '../constants';

const baseURL = getApiUrl();
const apiToken = Constants.manifest.extra.apiToken;
const headers = { milestone_token: apiToken };

const fileUri =
  FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY + '/signature.png';

const executeApiCall = async id => {
  const url = `${baseURL}/respondents/${id}/attachments`;

  const headers = {
    'Content-Type': 'image/png',
    'Content-File-Name': 'signature.png',
    milestone_token: apiToken,
  };

  const response = await FileSystem.uploadAsync(url, fileUri, {
    headers,
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
    mimeType: 'image/png',
  }).catch(error => {
    console.log({ error });
  });

  return response;
};

const saveSignature = async id => {
  const response = await executeApiCall(id);
  if (response && response.status === 202) {
    console.log('***** Respondent signature uploaded successfully');
  } else {
    console.log({ response });
  }
};

const SyncRespondentSignature = async id => {
  console.log('*** Begin Respondent Signature Sync');

  const signatureFile = await FileSystem.getInfoAsync(fileUri, { size: true });

  if (!signatureFile.exists) {
    console.log('*** No signature file found');
    return null;
  }

  const url = '/respondents/has_attachment';

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      responseType: 'json',
      baseURL,
      url,
      headers,
      params: { id },
    })
      .then(response => {
        const { status, data } = response;
        if (status !== 404 && !data.has_attachment) {
          saveSignature(id);
        } else if (data.has_attachment) {
          console.log('*** Respondent Signature Exists on Server');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncRespondentSignature;

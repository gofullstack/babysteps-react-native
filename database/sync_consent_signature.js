import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';

import { getApiUrl } from './common';

import CONSTANTS from '../constants';

const baseURL = getApiUrl();
const apiToken = Constants.manifest.extra.apiToken;
const headers = { milestone_token: apiToken };

const executeApiCall = async (version_id, respondent_id) => {
  const signatureFileName = `signature_${version_id}.png`;
  const url = `${baseURL}/respondent_consents/${signatureFileName}`;
  version_id = `${version_id}`;
  respondent_id = `${respondent_id}`;

  const headers = {
    'Content-Type': 'image/png',
    'Content-File-Name': signatureFileName,
    milestone_token: apiToken,
    version_id,
    respondent_id,
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

const confirmSignatureFile = async version_id => {
  const fileUri =
    FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY + `/signature_${version_id}.png`;
  const signatureFile = await FileSystem.getInfoAsync(fileUri);
  if (!signatureFile.exists) console.log('*** No signature file found');
  return signatureFile.exists;
};

export const SaveConsentSignature = async (version_id, respondent_id) => {
  const signatureFileExists = await confirmSignatureFile(version_id);
  if (!signatureFileExists) return null;

  const response = await executeApiCall(version_id, respondent_id);
  if (response && response.status === 202) {
    console.log(`***** Consent version ${version_id} signature uploaded successfully`);
  } else {
    console.log({ response });
  }
};

const SyncConsentSignature = async (version_id, respondent_id) => {
  console.log('*** Begin Consent Signature Sync');

  const signatureFileExists = await confirmSignatureFile(version_id);
  if (!signatureFileExists) return null;

  const url = '/respondent_consents/has_signature';

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      responseType: 'json',
      baseURL,
      url,
      headers,
      params: { version_id, respondent_id },
    })
      .then(response => {
        const { status, data } = response;
        if (status !== 404 && !data.has_attachment) {
          SaveConsentSignature(version_id, respondent_id);
        } else if (data.has_attachment) {
          console.log('*** Consent Signature Exists on Server');
        }
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

export default SyncConsentSignature;

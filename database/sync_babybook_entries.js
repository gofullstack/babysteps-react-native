import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

import { getApiUrl, getBabybookEntries } from './common';

const baseURL = getApiUrl();
const apiToken = Constants.manifest.extra.apiToken;

const executeApiUploadCall = async entry => {
  console.log('*** Begin Babybook Entry Attachment Upload');
  const url = `${baseURL}/babybooks/attachments`;
  const uri = entry.uri;
  const app_id = `${id}`;
  const user_id = `${entry.user_id}`;

  const headers = {
    'Content-Type': entry.content_type,
    'Content-File-Name': entry.filename,
    'User-ID': user_id,
    'App-ID': app_id,
    milestone_token: apiToken,
  };

  const response = await FileSystem.uploadAsync(url, uri, {
    headers,
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
    mimeType: entry.content_type,
  })

  return response;
};

export const AssociateAttachment = async entry => {
  console.log('*** Begin Associate Babybook Attachment');
  const url = '/babybooks/associate_attachment';
  const headers = { milestone_token: apiToken };
  const babybook_entry = { ...entry };
  delete babybook_entry.id;

  const response = await axios({
    method: 'post',
    responseType: 'json',
    baseURL,
    url,
    headers,
    data: {
      babybook_entry,
    },
  })

  return response;
};

export const UploadBabybookEntry = async entry => {
  console.log('*** Begin Babybook Entry Upload');

  let response = null;
  if (entry.choice_id) {
    response = await AssociateAttachment(entry);
  } else {
    response = await executeApiUploadCall(entry);
  }
  if (response && response.status === 202) {
    console.log('***** Babybook Entry uploaded successfully');
  } else {
    console.log({ entry, response });
  }

  return null;
};

export const ConfirmAPIBabybookEntryAttachment = async entry => {

  let has_attachment = false;

  const url = '/babybooks/has_attachment';
  const headers = { milestone_token: apiToken };
  const { id, user_id } = entry;

  await axios({
    method: 'get',
    responseType: 'json',
    baseURL,
    url,
    headers,
    params: {
      user_id,
      app_id: id,
    },
  })
    .then(response => {
      has_attachment = response.data.has_attachment;
    })
    .catch(error => {
      console.log(error);
    });

  return has_attachment;
};

const SyncBabybookEntryAttachments = async () => {
  console.log('*** Begin Babybook Entries Sync');
  const entries = await getBabybookEntries();
  for (const entry of entries) {
    const has_attachment = await ConfirmAPIBabybookEntryAttachment(entry);
    if (!has_attachment) {
      await UploadBabybookEntry(entry);
    }
  }
  return null;
};

export default SyncBabybookEntryAttachments;

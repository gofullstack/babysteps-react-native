import axios from 'axios';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

import isEmpty from 'lodash/isEmpty';

import { store } from '../store';

import { getApiUrl } from './common';

const baseURL = getApiUrl();
const apiToken = Constants.manifest.extra.apiToken;

const executeApiCall = async (userID, subjectID, attachment) => {
  const url = `${baseURL}/answers/attachments`;
  const uri = FileSystem.documentDirectory + attachment.uri;

  const headers = {
    'Content-Type': attachment.content_type,
    'Content-File-Name': attachment.filename,
    'User-ID': `${userID}`,
    'Subject-ID': `${subjectID}`,
    'Choice-ID': `${attachment.choice_id}`,
    milestone_token: apiToken,
  };

  const response = await FileSystem.uploadAsync(url, uri, {
    headers,
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
    mimeType: attachment.content_type,
  }).catch(error => {
    console.log({ error });
  });

  return response;
};

export const UploadMilestoneAttachment = async (userID, subjectID, attachment) => {
  console.log('*** Begin Milestone Attachment Upload');

  const response = await executeApiCall(userID, subjectID, attachment);
  if (response && response.status === 202) {
    console.log('*** Attachment uploaded successfully');
  } else {
    console.log({ attachment, response });
  }

  return null;
};

export const ConfirmAPIAttachment = async (subject_id, choice_id) => {
  let has_attachment = false;
  const url = '/answers/has_attachment';
  const headers = { milestone_token: apiToken };

  await axios({
    method: 'get',
    responseType: 'json',
    baseURL,
    url,
    headers,
    params: {
      subject_id,
      choice_id,
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

export const ConfirmAPIAttachments = async (subject_id, choice_ids) => {

  let has_attachments = [];

  const url = '/answers/has_attachments';
  const headers = { milestone_token: apiToken };

  await axios({
    method: 'get',
    responseType: 'json',
    baseURL,
    url,
    headers,
    params: {
      subject_id,
      choice_ids,
    },
  })
    .then(response => {
      has_attachments = response.data.has_attachments;
    })
    .catch(error => {
      console.log(error);
    });

  return has_attachments;
};

const SyncMilestoneAttachments = async () => {
  console.log('*** Begin Milestone Attachments Sync');

  const state = store.getState();
  const { user, subject } = state.registration;
  const { attachments } = state.milestones;
  if (isEmpty(user.data) || isEmpty(subject.data)) return;
  const user_id = user.data.id;
  const subject_id = subject.data.id;
  for (const attachment of attachments.data) {
    if (!isEmpty(attachment) && attachment.choice_id) {
      const has_attachment = await ConfirmAPIAttachment(
        subject_id,
        attachment.choice_id,
      );
      if (!has_attachment) {
        await UploadMilestoneAttachment(user_id, subject_id, attachment);
      } else {
        console.log(`*** Attachment ${attachment.choice_id} confirmed`);
      }
    } // if isEmpty attachment
  }
  return null;
};

export default SyncMilestoneAttachments;

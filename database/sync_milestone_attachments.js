import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

import { getApiUrl, getAttachments } from './common';

const baseURL = getApiUrl();
const apiToken = Constants.manifest.extra.apiToken;

const executeApiCall = async attachment => {
  const url = `${baseURL}/answers/attachments`;
  const uri = attachment.uri;

  const headers = {
    'Content-Type': attachment.content_type,
    'Content-File-Name': attachment.filename,
    'Subject-ID': attachment.subject_api_id.toString(),
    'Choice-ID': attachment.choice_id.toString(),
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

export const UploadMilestoneAttachment = async attachment => {
  console.log('*** Begin Milestone Attachment Update');

  const response = await executeApiCall(attachment);
  if (response && response.status === 202) {
    console.log('***** Attachment uploaded successfully');
  } else {
    console.log({ attachment, response });
  }

  return null;
};

export const ConfirmAPIAttachment = async attachment => {

  let has_attachment = false;

  const url = '/answers/has_attachment';
  const headers = { milestone_token: apiToken };
  const { subject_api_id, choice_id } = attachment;

  await axios({
    method: 'get',
    responseType: 'json',
    baseURL,
    url,
    headers,
    params: {
      subject_id: subject_api_id,
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
  const attachments = await getAttachments();
  for (const attachment of attachments) {
    const has_attachment = await ConfirmAPIAttachment(attachment);
    if (!has_attachment) {
      await UploadMilestoneAttachment(attachment);
    }
  }
  return null;
};

export default SyncMilestoneAttachments;

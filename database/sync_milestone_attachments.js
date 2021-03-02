import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';

import { delay, getApiUrl, getAnswer } from './common';

const db = SQLite.openDatabase('babysteps.db');

const baseURL = getApiUrl();
const apiToken = Constants.manifest.extra.apiToken;

const executeApiCall = async (answer, attachment) => {
  const url = `${baseURL}/answers/${answer.api_id}/attachments`;

  const headers = {
    'Content-Type': attachment.content_type,
    'Content-File-Name': attachment.filename,
    milestone_token: apiToken,
  };

  const response = await FileSystem.uploadAsync(url, attachment.uri, {
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
  let method = 'answer';
  let id = null;
  if (attachment.answer_id) id = attachment.answer_id;
  if (id === null && attachment.choice_id) {
    method = 'choice';
    id = attachment.choice_id;
  }
  if (!id) {
    console.log('***** Error: answer ID not available. Attachment ID: ', attachment.id);
    return;
  }

  let answer = await getAnswer(id, method);

  if (!answer) {
    console.log('***** Error: answer does not exist. Attachment ID: ', attachment.id);
    return;
  }

  let loop = 0;
  const delayMessage = '***** Waiting for Answer API ID...';
  while (loop < 10 && !answer.api_id) {
    await delay(3000, delayMessage);
    answer = await getAnswer(id, method);
    loop++;
  }

  if (!answer.api_id) {
    console.log('***** Error: answer does not have an API ID. Answer ID: ', answer.id);
  } else {
    const response = await executeApiCall(answer, attachment);
    if (response && response.status === 202) {
      console.log('***** Attachment uploaded successfully');
    } else {
      console.log({ answer, attachment, response });
    }
  }
};

const ConfirmAttachment = async (subject_id, attachment) => {

  const url = '/answers/has_attachment';
  const headers = { milestone_token: apiToken };

  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      responseType: 'json',
      baseURL,
      url,
      headers,
      params: {
        subject_id,
        choice_id: attachment.choice_id,
      },
    })
      .then(response => {
        const data = response.data;
        if (!data.has_attachment) {
          UploadMilestoneAttachment(attachment);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }); // return Promise
};

const ConfirmAttachments = async (subject_id, attachments) => {
  for (const attachment of attachments) {
    ConfirmAttachment(subject_id, attachment);
    const delayMessage = '*** Check if attachment uploaded...';
    await delay(10000, delayMessage);
  }
};

const SyncMilestoneAttachments = subject_id => {
  console.log('*** Begin Milestone Attachments Sync');
  const sql = 'SELECT * FROM attachments ORDER BY choice_id;';

  return db.transaction(tx => {
    tx.executeSql(
      sql,
      [],
      (_, response) => {
        const attachments = response.rows['_array'];
        ConfirmAttachments(subject_id, attachments);
      },
      (_, error) => {
        console.log(error);
      },
    );
  });
};

export default SyncMilestoneAttachments;

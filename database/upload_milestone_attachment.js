import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

import {
  delay,
  getApiUrl,
  getAnswer,
  getAttachment,
  setAttachmentToUploaded,
} from './common';

const apiToken = Constants.manifest.extra.apiToken;

const executeApiCall = async (answer, attachment) => {
  const attachmentUrl = `${getApiUrl()}/answers/${answer.api_id}/attachments`;

  const headers = {
    'Content-Type': attachment.content_type,
    'Content-File-Name': attachment.filename,
    milestone_token: apiToken,
  };

  const response = await FileSystem.uploadAsync(attachmentUrl, attachment.uri, {
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

const UploadMilestoneAttachment = async attachment => {
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
    // may need to mark the attachment as undelivered so as to stop retrying
    //setAttachmentToUploaded(attachment);
  } else {
    const response = await executeApiCall(answer, attachment);
    if (response && response.status === 202) {
      console.log('***** Attachment uploaded successfully');
      if (!attachment.id) {
        if (attachment.answer_id) {
          attachment = await getAttachment(attachment.answer_id, 'answer');
        } else {
          attachment = await getAttachment(attachment.choice_id, 'choice');
        }
      }
      setAttachmentToUploaded(attachment);
    } else {
      console.log({ response });
    }
  }
};

export default UploadMilestoneAttachment;

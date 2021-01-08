import * as FileSystem from 'expo-file-system';

import { getApiUrl, getAnswer, setAttachmentToUploaded } from './common';

const UploadMilestoneAttachment = async (session, attachment) => {
  let method = 'answer';
  let id = null;
  if (attachment.answer_id) id = attachment.answer_id;
  if (id === null && attachment.choice_id) {
    method = 'choice';
    id = attachment.choice_id;
  }
  if (!id) {
    console.log('***** Error: answer ID not available: ', attachment.id);
    return;
  }

  const answer = await getAnswer(id, method);

  if (!answer) {
    console.log('***** Error: answer does not exist: ', attachment.id);
    return;
  }
  if (!answer.api_id) {
    console.log('***** Error: answer does not have an api_ID: ', answer.id);
    return;
  }

  const attachmentUrl = `${getApiUrl()}/answers/${answer.api_id}/attachments`;

  const headers = {
    'Content-Type': attachment.content_type,
    'Content-File-Name': attachment.filename,
    'ACCESS-TOKEN': session.access_token,
    'TOKEN-TYPE': 'Bearer',
    CLIENT: session.client,
    UID: session.uid,
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

  if (response.status === 202) {
    await setAttachmentToUploaded(attachment);
  } else {
    console.log({ response });
  }

};

export default UploadMilestoneAttachment;

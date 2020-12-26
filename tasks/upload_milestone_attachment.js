import * as BackgroundFetch from "expo-background-fetch"
import axios from 'axios';

import {
  getFileMetaData,
  getBlob,
  getAnswer,
  setAttachmentToUploaded,
} from './common';

import Constants from 'expo-constants';
import TASKS from './constants';

const baseURL = TASKS.BASE_URL;

const RegisterUploadMilestoneAttachment = async attachment => {
  if (!attachment.answer_id) {
    console.log('***** Error: answer ID not associated with attachment: ', attachment.id);
    return;
  }

  const answer = await getAnswer(attachment.answer_id);

  if (!answer) {
    console.log('***** Error: answer does exist: ', attachment.answer_id);
    return;
  }
  if (!answer.api_id) {
    console.log('***** Error: answer does not have an api_ID: ', answer.id);
    return;
  }

  // move all remainder to register_tasks when background task is running properly

  let data = await getFileMetaData(attachment);

  const apiToken = Constants.manifest.extra.apiToken;

  let headers = {
    milestone_token: apiToken,
  };

  let url = TASKS.ACTIVE_STORAGE_URL;

  const apiDUResponse = await axios({
    method: 'POST',
    responseType: 'json',
    baseURL,
    url,
    headers,
    data,
  });

  console.log({ apiDUResponse });

  if (apiDUResponse.status !== 200) {
    console.log('***** Error: upload attachment failed: ', apiDUResponse.status);
    return;
  }

  const signed_id = apiDUResponse.data.signed_id;
  headers = apiDUResponse.data.direct_upload.headers;
  url = apiDUResponse.data.direct_upload.url;
  data = await getBlob(attachment.uri);

  console.log({headers});
  console.log({url});

  const awsResponse = await axios({
    method: 'PUT',
    url,
    headers,
    data,
  }).catch(error => {
    console.log({ error });
  });

  if (!awsResponse || awsResponse.status !== 200) {
    console.log('***** Error: upload attachment failed on S3.');
    return;
  }

  console.log({ awsResponse });

  data = { answer: { attachments: [signed_id] } };
  headers = {
    milestone_token: apiToken,
  };

  const apiResponse = await axios({
    method: 'PUT',
    responseType: 'json',
    baseURL,
    url: `${baseURL}/api/answers/${answer.api_id}`,
    headers,
    data,
  }).catch(error => {
    // throws a 500 error if file not saved on S3 first
    // ActiveStorage::FileNotFoundError (ActiveStorage::FileNotFoundError)
    // But record is saved on Rails
    console.log({error});
  });

  console.log({ apiResponse });

  if (false) { // disable to test
    await setAttachmentToUploaded(attachment);
  }

  // end move to background

  // uncomment when background task is working
  //await BackgroundFetch.registerTaskAsync(TASKS.UPLOAD_MILESTONE_ATTACHMENT, [answer, attachment));
};

export default RegisterUploadMilestoneAttachment;

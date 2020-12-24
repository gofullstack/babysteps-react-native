import * as BackgroundFetch from "expo-background-fetch"
import axios from 'axios';

import { getFileMetaData, getBlob } from './register_tasks';

import Constants from 'expo-constants';
import TASKS from './constants';

const baseURL = TASKS.BASE_URL;


const RegisterUploadMilestoneAttachment = async attachment => {

  let data = await getFileMetaData(attachment);
  const apiToken = Constants.manifest.extra.apiToken;
  debugger
  let headers = {
    "milestone_token": apiToken,
  };

  let url = TASKS.ACTIVE_STORAGE_URL;

  const apiResponse = await axios({
    method: 'POST',
    responseType: 'json',
    baseURL,
    url,
    headers,
    data,
  });

  console.log({apiResponse});
  if (apiResponse.status !== 200) {
     console.log('***** Error: upload attachment failed: ', apiResponse.status);
     return;
  }
  const signed_id = apiResponse.data.signed_id;
  headers = apiResponse.data.direct_upload.headers
  url = apiResponse.data.direct_upload.url;
  data = await getBlob(attachment.uri);
  
  const awsResponse = await axios({
    method: 'PUT',
    url,
    headers,
    data,
  });

  console.log({awsResponse});


  //https://evilmartians.com/chronicles/active-storage-meets-graphql-direct-uploads

  //await BackgroundFetch.registerTaskAsync(TASKS.UPLOAD_MILESTONE_ATTACHMENT, attachment);
};


export default RegisterUploadMilestoneAttachment;

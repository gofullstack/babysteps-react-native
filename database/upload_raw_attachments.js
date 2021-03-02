import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

import { getApiUrl } from './common';
import CONSTANTS from '../constants';
import VideoFormats from '../constants/VideoFormats';
import ImageFormats from '../constants/ImageFormats';
import AudioFormats from '../constants/AudioFormats';

const ContentTypes = {...VideoFormats, ...ImageFormats, ...AudioFormats};

const baseURL = getApiUrl();
const apiToken = Constants.manifest.extra.apiToken;

const attachmentDir = FileSystem.documentDirectory + CONSTANTS.ATTACHMENTS_DIRECTORY  + '/';

const executeApiCall = async (fileName, id) => {

  const url = `${baseURL}/users/${id}/attachments`;

  const fileInfo = await FileSystem.getInfoAsync(attachmentDir + fileName);

  if (fileInfo.exists) {

    const ext = fileName.substring(
      fileName.lastIndexOf('.') + 1,
      fileName.length,
    );

    const fileType = ContentTypes[ext];

    const headers = {
      'Content-Type': fileType,
      'Content-File-Name': fileName,
      milestone_token: apiToken,
    };

    const response = await FileSystem.uploadAsync(url, fileInfo.uri, {
      headers,
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
      mimeType: fileType,
    }).catch(error => {
      console.log({ error });
    });

    return response;
  }
  return { message: `*** File ${fileName} not found`, status: 422 };
};

const UploadRawAttachments = async id => {
	console.log('*** Begin Upload Raw Attachments');
  const fileNames = await FileSystem.readDirectoryAsync(attachmentDir);

  for (const fileName of fileNames) {
    const response = await executeApiCall(fileName, id);
    if (response && response.status === 202) {
      console.log(`*** Raw Attachment ${fileName} uploaded successfully`);
    } else {
      console.log({ response });
    }
  }
  return null;
};

export default UploadRawAttachments;
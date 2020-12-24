import Constants from 'expo-constants';
import CONSTANTS from '../constants';

let BASE_URL = '';
if (__DEV__ || Constants.manifest === undefined) {
  BASE_URL = CONSTANTS.BASE_DEVELOPMENT_URL;
} else {
  BASE_URL = Constants.manifest.extra.baseUrl;
}
const ACTIVE_STORAGE_URL = '/api/direct_uploads';

const UPLOAD_MILESTONE_ATTACHMENT = 'upload_milestone_attachment';

export default {
  BASE_URL,
  ACTIVE_STORAGE_URL,
  UPLOAD_MILESTONE_ATTACHMENT,
};

import * as FileSystem from 'expo-file-system';

import CONSTANTS from '../constants';

const checkCustomDirectories = async () => {
  console.log('*** Check Custom Directories');

  const baseDir = FileSystem.documentDirectory;

  const result = await FileSystem.readDirectoryAsync(baseDir);

  if (CONSTANTS.REMOVE_BABYBOOK_DIRECTORY) {
    console.log('*** Remove Directory: ' + CONSTANTS.BABYBOOK_DIRECTORY);
    await FileSystem.deleteAsync(baseDir + CONSTANTS.BABYBOOK_DIRECTORY, {idempotent: true})
  }
  if (!result.includes(CONSTANTS.BABYBOOK_DIRECTORY) || CONSTANTS.REMOVE_BABYBOOK_DIRECTORY ) {
    console.log('*** Create Directory: ' + CONSTANTS.BABYBOOK_DIRECTORY);
    await FileSystem.makeDirectoryAsync(baseDir + CONSTANTS.BABYBOOK_DIRECTORY);
  }

  if (CONSTANTS.REMOVE_SIGNATURE_DIRECTORY) {
    console.log('*** Remove Directory: ' + CONSTANTS.SIGNATURE_DIRECTORY);
    await FileSystem.deleteAsync(baseDir + CONSTANTS.SIGNATURE_DIRECTORY, {idempotent: true})
  }
  if (!result.includes(CONSTANTS.SIGNATURE_DIRECTORY) || CONSTANTS.REMOVE_SIGNATURE_DIRECTORY ) {
    console.log('*** Create Directory: ' + CONSTANTS.SIGNATURE_DIRECTORY);
    await FileSystem.makeDirectoryAsync(baseDir + CONSTANTS.SIGNATURE_DIRECTORY);
  }

  if (CONSTANTS.REMOVE_ATTACHMENTS_DIRECTORY) {
    console.log('*** Remove Directory: ' + CONSTANTS.ATTACHMENTS_DIRECTORY);
    await FileSystem.deleteAsync(baseDir + CONSTANTS.ATTACHMENTS_DIRECTORY, {idempotent: true});
  }
  if (!result.includes(CONSTANTS.ATTACHMENTS_DIRECTORY) || CONSTANTS.REMOVE_ATTACHMENTS_DIRECTORY ) {
    console.log('*** Create Directory: ' + CONSTANTS.ATTACHMENTS_DIRECTORY);
    await FileSystem.makeDirectoryAsync(baseDir + CONSTANTS.ATTACHMENTS_DIRECTORY);
  }
};

export default checkCustomDirectories;

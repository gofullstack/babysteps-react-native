import { PureComponent } from 'react';
import * as FileSystem from 'expo-file-system'
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as SQLite from 'expo-sqlite';
import { _ } from 'lodash';
import { getApiUrl } from '../database/common';

import {
  updateConnectionType,
  apiDisptachTokenRefresh,
} from '../actions/session_actions';

const db = SQLite.openDatabase('babysteps.db');

// This is a rough proof of concept of a component that finds all attachments
// needing to be uploaded.  It then calls FileSystem.uploadAsync to upload those
// attachments to the new attachment upload API endpoint https://github.com/gofullstack/babysteps-web/pull/7

export default class AttachmentUploader extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      uploading_attachments: false,
    };

  }

  componentDidMount(){
    this.processAttachments()
  }

  processAttachments(){

    // This queury joins attachments and answers as attachments.answer_id ends
    // up being null a lot.   This is a known issue that we should correct

    db.transaction(tx => {
      tx.executeSql(
        'SELECT attachments.*, answers.api_id FROM attachments INNER JOIN answers ON attachments.choice_id = answers.choice_id WHERE attachments.uploaded == 0 AND answers.api_id IS NOT NULL', [],
        (transaction, response) => {
          console.log('AttachmentUploader',response)
          console.log('AttachmentUploader',_)
          _.forEach(response.rows['_array'], attachment => {
            this.uploadAttachment(attachment)
          })
        },
        {}
      );
    })
  }

  async uploadAttachment(attachment){

    // Probably only attempt to upload attachments once per day to avoid duplicated uploads

    const attachmentUrl = `${getApiUrl()}/answers/${attachment.api_id}/attachments`;
    console.log("AttachmentUploader", attachment, attachmentUrl);

    // Need to get API token

    let headers = {
      'Content-Type': attachment.content_type,
      'Content-File-Name': attachment.filename
    }

    let response = await FileSystem.uploadAsync(
      attachmentUrl,
      attachment.uri, {
        headers,
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
        mimeType: attachment.content_type,
      }
    ).catch(error => console.log(error)).then(response => {
      console.log("AttachmentUploader", attachment)
    })

    // Need to mark attachments as uploaded

  }

  render() {
    return null;
  }

}

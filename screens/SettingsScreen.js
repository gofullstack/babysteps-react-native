import React from 'react';
import {
  Linking,
  Text,
  View,
  ScrollView,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';

import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

import { Ionicons } from '@expo/vector-icons';

import moment from 'moment';

import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import filter from 'lodash/filter';
import find from 'lodash/find';

import { connect } from 'react-redux';
import { fetchSession } from '../actions/session_actions';
import {
  fetchUser,
  fetchRespondent,
  fetchSubject,
} from '../actions/registration_actions';
import { fetchMilestoneAttachments } from '../actions/milestone_actions';

import UploadSQLiteDatabase from '../database/upload_sqlite_database';
import {
  ConfirmAPIAttachments,
  UploadMilestoneAttachment,
} from '../database/sync_milestone_attachments';

import ConsentDisclosureContent from '../components/consent_disclosure_content';
import SettingsFAQContent from '../components/settings_faq_content';

import CONSTANTS from '../constants';
import IRBInformation from '../constants/IRB';
import Colors from '../constants/Colors';

class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
  };

  constructor(props) {
    super(props);

    this.state = {
      faqModalVisible: false,
      consentModalVisible: false,
      mediaFilesModalVisible: false,
      mediaFileModalRendered: false,
      uploadDatabaseSelected: false,
      apiAttachmentsSubmitted: false,
      missingAPIAttachments: [],
    };

    this.props.fetchSession();
    this.props.fetchUser();
    this.props.fetchRespondent();
    this.props.fetchSubject();
    this.props.fetchMilestoneAttachments();
  }

  componentDidUpdate() {
    const { subject } = this.props.registration;
    const { attachments } = this.props.milestones;
    const { apiAttachmentsSubmitted } = this.state;
    if (subject.fetched && attachments.fetched && !apiAttachmentsSubmitted) {
      this.getMissingAttachments();
      this.setState({ apiAttachmentsSubmitted: true });
    }
  }

  getMissingAttachments = async () => {
    const subject = this.props.registration.subject.data;
    const attachments = this.props.milestones.attachments.data;
    const choiceIDs = map(attachments, 'choice_id');

    const hasAttachments = await ConfirmAPIAttachments(subject.api_id, choiceIDs);

    const missingAPIAttachments = [];
    map(hasAttachments, att => {
      if (!att.has_attachment) {
        const attachment = find(attachments, { choice_id: att.choice_id });
        missingAPIAttachments.push(attachment);
      }
    });

    if (!isEmpty(missingAPIAttachments)) {
      this.setState({ missingAPIAttachments });
    }
  };

  getRelease = () => {
    if (__DEV__) {
      return 'Development';
    }
    return Constants.manifest.extra.release;
  };

  handleFAQPress = () => {
    this.setState({ faqModalVisible: true });
  };

  handleFeedbackPress = () => {
    const build = this.getAppVersion();
    const release = this.getRelease();
    const version = `${Constants.manifest.version}:${build}`;
    const { session, registration } = this.props;
    let body = `\n\n\n________________________\n\n`
    body += `Platform: ${Platform.OS}\n`
    body += `Version: ${version}\n`
    body += `Release: ${release}\n`
    body += `Notifications Updated At: ${moment(this.props.session.notifications_updated_at).format('MMMM Do YYYY, h:mm a Z')}\n`
    body += `Notification Permissions: ${session.notifications_permission}\n`
    body += `User ID: ${registration.user.data.api_id}\n\n`
    body += `________________________\n\n\n`;
    Linking.openURL(
      `mailto:feedback@babystepsapp.net?subject=BabySteps App Feedback (v${version})&body=${body}`,
    );
  };

  handleDirectoryListingPress = async () => {
    const { registration } = this.props;
    const release = this.getRelease();
    const attachmentDir = FileSystem.documentDirectory + CONSTANTS.ATTACHMENTS_DIRECTORY  + '/'
    const fileNames = await FileSystem.readDirectoryAsync(attachmentDir);
    let body = `<div>Release: ${release}</div>`;
    body += `Directory: ${CONSTANTS.ATTACHMENTS_DIRECTORY}\n`;
    body += `User ID: ${registration.user.data.api_id}\n`;
    body += '________________________\n\n';

    for (const fileName of fileNames) {
      const fileInfo = await FileSystem.getInfoAsync(attachmentDir + fileName);
      if (fileInfo.exists) {
        const shortFileName = fileName.substring(24, 100);
        const timeStamp = moment(fileInfo.modificationTime * 1000).format('MM/DD/YYYY hh:MM');
        const fileSize = `${Math.ceil(fileInfo.size / 1000).toLocaleString()}K`;
        body += `${shortFileName} - ${fileSize} - ${timeStamp}\n\n`;
      }
    }

    body += '________________________\n\n';
    Linking.openURL(
      `mailto:feedback@babystepsapp.net?subject=BabySteps App Directory&body=${body}`,
    );
  };

  handleUploadDatabasePress = () => {
    const user = this.props.registration.user.data;
    UploadSQLiteDatabase(user.api_id);
    //UploadRawAttachments(user.api_id);
    this.setState({ uploadDatabaseSelected: true });
  };

  handleUploadMediaFilesPress = () => {
    this.setState({ mediaFilesModalVisible: true });
  };

  handleConsentAgreementPress = () => {
    this.setState({ consentModalVisible: true });
  };

  renderFAQModal = () => {
    return (
      <View style={{ marginTop: 22 }}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.faqModalVisible}
          onRequestClose={() => {}}
        >
          <View>
            <TouchableOpacity
              style={{alignSelf: 'flex-end', marginTop: 24, marginRight: 20}}
              onPress={() => {
                this.setFAQModalVisible(!this.state.faqModalVisible );
              }}
            >
              <Ionicons name = "md-close" size = {36} />
            </TouchableOpacity>
            <SettingsFAQContent setModalVisible={this.setFAQModalVisible} />
          </View>
        </Modal>
      </View>
    );
  };

  renderConsentModal = () => {
    const respondent = this.props.registration.respondent.data;
    const subject = this.props.registration.subject.data;

    return (
      <View style={{ marginTop: 22 }}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.consentModalVisible}
          onRequestClose={() => {}}
        >
          <View>
            <TouchableOpacity
              style={{alignSelf: 'flex-end', marginTop: 24, marginRight: 20}}
              onPress={() => {
                this.setConsentModalVisible(!this.state.consentModalVisible);
              }}
            >
              <Ionicons name="md-close" size={36} />
            </TouchableOpacity>
            <ConsentDisclosureContent
              formState="view"
              tosID={respondent.tos_id}
              screening_blood={subject.screening_blood}
              screening_blood_other={subject.screening_blood_other}
              screening_blood_notification={subject.screening_blood_notification}
              video_sharing={subject.video_sharing}
              video_presentation={subject.video_presentation}
              setModalVisible={this.setConsentModalVisible}
            />
          </View>
        </Modal>
      </View>
    );
  };

  handleUploadMediaFile = async attachment => {
    let { missingAPIAttachments } = this.state;
    UploadMilestoneAttachment(attachment);
    missingAPIAttachments = filter(missingAPIAttachments, missingAttachment => {
      return missingAttachment.id !== attachment.id;
    })
    this.setState({ missingAPIAttachments });
  };

  renderMediaFileItem = attachment => {
    const shortFileName = attachment.filename.substring(24, 100);
    return (
      <View>
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => {
            this.handleUploadMediaFile(attachment);
          }}
        >
          <View style={styles.mediaFileContainer}>
            <Text style={styles.mediaFileText}>Choice ID: {attachment.choice_id}</Text>
            <Text style={styles.mediaFileText}>{shortFileName}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderMediaFilesModal = () => {
    const { mediaFilesModalVisible, missingAPIAttachments } = this.state;

    return (
      <SafeAreaView>
        <View>
          <Modal
            animationType="slide"
            transparent={false}
            visible={mediaFilesModalVisible}
            onRequestClose={() => {}}
          >
            <View style={styles.section}>
              <TouchableOpacity
                style={{alignSelf: 'flex-end', marginTop: 24, marginRight: 20}}
                onPress={() => {
                  this.setMediaFilesModalVisible(!mediaFilesModalVisible);
                }}
              >
                <Ionicons name="md-close" size={36} />
              </TouchableOpacity>
              <Text style={styles.sectionTitle}>Media Files to Upload:</Text>
              <FlatList
                data={missingAPIAttachments}
                renderItem={item => this.renderMediaFileItem(item.item)}
                keyExtractor={item => item.filename}
              />
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    );
  };

  setConsentModalVisible = (visible) => {
    this.setState({ consentModalVisible: visible });
  };

  setFAQModalVisible = (visible) => {
    this.setState({ faqModalVisible: visible });
  };

  setMediaFilesModalVisible = (visible) => {
    this.setState({ mediaFilesModalVisible: visible });
  };

  getAppVersion = () => {
    const manifest = Constants.manifest;
    const build =
      Platform.OS === 'android'
        ? manifest.android.versionCode
        : manifest.ios.buildNumber;
    return build;
  };

  renderIRBinformation = () => {
    const respondent = this.props.registration.respondent.data;
    const irb = IRBInformation[respondent.tos_id];
    if (irb) {
      return (
        <View>
          <Text style={styles.sectionTitle}>IRB Information:</Text>
          <Text>Approved By: {irb.approved_by}</Text>
          <Text>ID Number: {irb.irb_id}</Text>
          <Text>Approval Date: {irb.approval_date}</Text>
          <Text>Accepted On: {moment(respondent.accepted_tos_at).format('MM/DD/YY',)}</Text>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={this.handleConsentAgreementPress}
          >
            <Text style={styles.linkText}>Review Consent Agreement</Text>
            <Ionicons
              name="ios-arrow-forward"
              size={28}
              color="#bdc6cf"
              style={styles.linkIcon}
            />
          </TouchableOpacity>
        </View>
      );
    }
  };

  render() {
    const manifest = Constants.manifest;
    const build = this.getAppVersion();
    const release = this.getRelease();
    const session = this.props.session;
    const user = this.props.registration.user.data;
    const { uploadDatabaseSelected } = this.state;

    return (
      <SafeAreaView>
        <ScrollView style={styles.section}>
          <Text style={styles.sectionTitle}>BabySteps App Information:</Text>
          <Text>
            Version: {manifest.version}:{build}
          </Text>
          <Text>Notification Permission: {session.notifications_permission}</Text>
          <Text>Release: {release}</Text>
          <Text>User ID: {user.api_id}</Text>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={this.handleFAQPress}
          >
            <Text style={styles.linkText}>Frequently Asked Questions</Text>
            <Ionicons
              name="ios-arrow-forward"
              size={28}
              color="#bdc6cf"
              style={styles.linkIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={this.handleFeedbackPress}
          >
            <Text style={styles.linkText}>Ask Questions or Provide Feedback</Text>
            <Ionicons
              name="ios-arrow-forward"
              size={28}
              color="#bdc6cf"
              style={styles.linkIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={this.handleDirectoryListingPress}
          >
            <Text style={styles.linkText}>Provide Media File Feedback</Text>
            <Ionicons
              name="ios-arrow-forward"
              size={28}
              color="#bdc6cf"
              style={styles.linkIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={this.handleUploadDatabasePress}
            disabled={uploadDatabaseSelected}
          >
            <Text style={styles.linkText}>Upload Answers Database</Text>
            <Ionicons
              name="ios-arrow-forward"
              size={28}
              color="#bdc6cf"
              style={styles.linkIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={this.handleUploadMediaFilesPress}
            disabled={uploadDatabaseSelected}
          >
            <Text style={styles.linkText}>Upload Media Files</Text>
            <Ionicons
              name="ios-arrow-forward"
              size={28}
              color="#bdc6cf"
              style={styles.linkIcon}
            />
          </TouchableOpacity>

          {this.renderIRBinformation()}

        </ScrollView>

        {this.renderFAQModal()}
        {this.renderConsentModal()}
        {this.renderMediaFilesModal()}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    paddingLeft: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  linkContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.mediumGrey,
    borderBottomColor: Colors.mediumGrey,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    position: 'relative',
  },
  linkText: {
    fontSize: 16,
    color: Colors.darkGreen,
    marginLeft: 10,
  },
  linkIcon: {
    color: Colors.darkGreen,
    right: 9,
    position: 'absolute',
    top: 6,
  },
  mediaFileContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mediaFileText: {
    fontSize: 16,
    flex: 1,
  },
});

const mapStateToProps = ({
  session,
  notifications,
  milestones,
  registration,
}) => ({
  session,
  notifications,
  milestones,
  registration,
});

const mapDispatchToProps = {
  fetchSession,
  fetchUser,
  fetchRespondent,
  fetchSubject,
  fetchMilestoneAttachments,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsScreen);

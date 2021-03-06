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

import UploadJSONDatabase from '../database/upload_json_database';

import {
  ConfirmAPIAttachments,
  UploadMilestoneAttachment,
} from '../database/sync_milestone_attachments';

import ConsentDisclosureVersion from '../components/consent_disclosure_version';
import SettingsFAQContent from '../components/settings_faq_content';

import CONSTANTS from '../constants';
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
  }

  componentDidUpdate() {
    const { subject } = this.props.registration;
    const { attachments } = this.props.milestones;
    const { apiAttachmentsSubmitted } = this.state;
    if (!apiAttachmentsSubmitted) {
      this.getMissingAttachments();
      this.setState({ apiAttachmentsSubmitted: true });
    }
  }

  getMissingAttachments = async () => {
    const { subject } = this.props.registration;
    const { attachments } = this.props.milestones;
    const choiceIDs = map(attachments.data, 'choice_id');

    const hasAttachments = await ConfirmAPIAttachments(subject.data.id, choiceIDs);

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
    const session = this.props.session;
    const user = this.props.registration.user.data;
    const build = this.getAppVersion();
    const release = this.getRelease();
    const version = `${Constants.manifest.version}:${build}`;

    let body = `\n\n\n________________________\n\n`;
    body += `Platform: ${Platform.OS}\n`;
    body += `Version: ${version}\n`;
    body += `Release: ${release}\n`;
    body += `Notifications Updated At: ${moment(session.notifications_updated_at).format('MMMM Do YYYY, h:mm a Z')}\n`;
    body += `Notification Permissions: ${session.notifications_permission}\n`;
    body += `User ID: ${user.id}\n\n`;
    body += `________________________\n\n\n`;
    Linking.openURL(
      `mailto:feedback@babystepsapp.net?subject=BabySteps App Feedback (v${version})&body=${body}`,
    );
  };

  handleDirectoryListingPress = async () => {
    const user = this.props.registration.user.data;
    const release = this.getRelease();
    const attachmentDir = FileSystem.documentDirectory + CONSTANTS.ATTACHMENTS_DIRECTORY  + '/'
    const fileNames = await FileSystem.readDirectoryAsync(attachmentDir);
    let body = `Release: ${release}\n`;
    body += `Directory: ${CONSTANTS.ATTACHMENTS_DIRECTORY}\n`;
    body += `User ID: ${user.id}\n`;
    body += '________________________\n\n';

    for (const fileName of fileNames) {
      const fileInfo = await FileSystem.getInfoAsync(attachmentDir + fileName);
      if (fileInfo.exists) {
        // const shortFileName = fileName.substring(24, 100);
        const timeStamp = moment(fileInfo.modificationTime * 1000).format('MM/DD/YYYY hh:MM');
        const fileSize = `${Math.ceil(fileInfo.size / 1000).toLocaleString()}K`;
        body += `${fileName} - ${fileSize} - ${timeStamp}\n\n`;
      }
    }

    body += '________________________\n\n';
    Linking.openURL(
      `mailto:feedback@babystepsapp.net?subject=BabySteps App Directory&body=${body}`,
    );
  };

  handleUploadDatabasePress = () => {
    const user = this.props.registration.user.data;
    UploadJSONDatabase(user.id);
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
            <ConsentDisclosureVersion hideButton={true} />
          </View>
        </Modal>
      </View>
    );
  };

  handleUploadMediaFile = async attachment => {
    const { user, subject } = this.props.registration;
    let { missingAPIAttachments } = this.state;
    UploadMilestoneAttachment(user.data.id, subject.data.id, attachment);
    missingAPIAttachments = filter(missingAPIAttachments, missingAttachment => {
      return missingAttachment.id !== attachment.id;
    });
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
            <Text style={styles.mediaFileText}>
              Choice ID: {attachment.choice_id}
            </Text>
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
              {!isEmpty(missingAPIAttachments) && (
                <FlatList
                  data={missingAPIAttachments}
                  renderItem={item => this.renderMediaFileItem(item.item)}
                  keyExtractor={item => item.filename}
                />
              )}
              {isEmpty(missingAPIAttachments) && (
                <Text>None...</Text>
              )}
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

  renderAppinformation = () => {
    const session = this.props.session;
    const user = this.props.registration.user.data;
    const manifest = Constants.manifest;
    const build = this.getAppVersion();
    const release = this.getRelease();
    return (
      <View>
        <Text style={styles.sectionTitle}>BabySteps App Information:</Text>
        <Text>
          Version: {manifest.version}:{build}
        </Text>
        <Text>Notification Permission: {session.notifications_permission}</Text>
        <Text>Release: {release}</Text>
        {user && <Text>User ID: {user.id}</Text>}
      </View>
    );
  }

  renderIRBinformation = () => {
    const respondent = this.props.registration.respondent.data;
    const consent = this.props.registration.consent.data;
    return (
      <View>
        <Text style={styles.sectionTitle}>IRB Information:</Text>
        <Text>Approved By: {consent.tos_approved_by}</Text>
        <Text>ID Number: {consent.irb_id}</Text>
        <Text>Approval Date: {consent.tos_approved_on}</Text>

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
  };

  render() {
    const { uploadDatabaseSelected } = this.state;
    return (
      <SafeAreaView>
        <ScrollView style={styles.section}>

          {this.renderAppinformation()}

          {this.renderIRBinformation()}

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
            <Text
              style={uploadDatabaseSelected ? styles.linkTextDisabled : styles.linkText}
            >
              Upload Answers Database
              {uploadDatabaseSelected ? ' - Done ' : ''}
            </Text>
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
          >
            <Text style={styles.linkText}>Upload Media Files</Text>
            <Ionicons
              name="ios-arrow-forward"
              size={28}
              color="#bdc6cf"
              style={styles.linkIcon}
            />
          </TouchableOpacity>

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
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
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
  linkTextDisabled: {
    fontSize: 16,
    color: Colors.darkGrey,
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

export default connect(mapStateToProps)(SettingsScreen);

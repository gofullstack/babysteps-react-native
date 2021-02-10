import React from 'react';
import {
  Linking,
  Text,
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ListItem } from 'react-native-elements';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import moment from 'moment';

import { connect } from 'react-redux';
import { fetchRespondent } from '../actions/registration_actions';

import ConsentDisclosureContent from '../components/consent_disclosure_content';
import SettingsFAQContent from '../components/settings_faq_content';

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
    };

    this.props.fetchRespondent();
  }

  getRelease = () => {
    if (__DEV__) {
      return 'Development';
    }
    return Constants.manifest.extra.release;
  };

  _handleFAQPress = () => {
    this.setState({ faqModalVisible: true });
  };

  _handleFeedbackPress = () => {
    const build = this.getAppVersion();
    const release = this.getRelease();

    const version = `${Constants.manifest.version}:${build}`;
    const { session, registration } = this.props;
    const body = `\n\n\n________________________\n\nPlatform: ${Platform.OS}\nVersion: ${version}\nRelease: ${release}\nNotifications Updated At: ${moment(this.props.session.notifications_updated_at).format('MMMM Do YYYY, h:mm a Z')}\nNotification Permissions: ${session.notifications_permission}\nUser ID: ${registration.user.data.api_id}\n\n________________________\n\n\n`;

    Linking.openURL(`mailto:feedback@babystepsapp.net?subject=BabySteps App Feedback (v${version})&body=${body}`);
  };

  _handleConsentAgreementPress = () => {
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
              <Ionicons name = "md-close" size = {36} />
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

  setConsentModalVisible = (visible) => {
    this.setState({consentModalVisible: visible});
  };

  setFAQModalVisible = (visible) => {
    this.setState({faqModalVisible: visible});
  }

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
            onPress={this._handleConsentAgreementPress}
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
    const calendar = this.props.milestones.calendar;
    const session = this.props.session;
    const subject = this.props.registration.subject.data;
    const user = this.props.registration.user.data;

    return (
      <SafeAreaView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BabySteps App Information:</Text>
          <Text>
            Version: {manifest.version}:{build}
          </Text>
          <Text>Notification Permission: {session.notifications_permission}</Text>
          <Text>Release: {release}</Text>
          <Text>User ID: {user.api_id}</Text>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={this._handleFAQPress}
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
            onPress={this._handleFeedbackPress}
          >
            <Text style={styles.linkText}>Ask Questions or Provide Feedback</Text>
            <Ionicons
              name="ios-arrow-forward"
              size={28}
              color="#bdc6cf"
              style={styles.linkIcon}
            />
          </TouchableOpacity>

          {this.renderIRBinformation()}

        </View>

        {this.renderFAQModal()}
        {this.renderConsentModal()}
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
    marginTop: 20,
    paddingTop: 15,
    paddingBottom: 15,
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
    top: 12,
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

const mapDispatchToProps = { fetchRespondent };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsScreen);

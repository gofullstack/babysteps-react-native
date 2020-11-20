import React from 'react';
import {
  Linking,
  Text,
  View,
  FlatList,
  ScrollView,
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
import { fetchNotifications } from '../actions/notification_actions';
import { fetchRespondent } from '../actions/registration_actions';

import ConsentDisclosureVersion from '../components/consent_disclosure_version';
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
      notificationPermissions: '',
      faqModalVisible: false,
      consentModalVisible: false,
    };

    this.props.fetchNotifications();
    this.props.fetchRespondent();
    this.getNotificationPermissions();
  }

  renderNotificationList = releaseChannel => {
    if (releaseChannel !== 'Production') {
      const notifications = this.props.notifications.notifications.data;
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications:</Text>
          <FlatList
            scrollEnabled
            data={notifications}
            renderItem={this.renderItem}
          />
        </View>
      );
    }
    return null;
  };

  renderItem = item => {
    const notification = item.item;
    const notify_at = moment(notification.notify_at).format('YYYY-MM-DD h:mm a Z');
    return (
      <ListItem
        key={notification.id.toString()}
        title={notify_at}
        subtitle={notification.body}
      />
    );
  };

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
    const body = `\n\n\n________________________\n\nPlatform: ${Platform.OS}\nVersion: ${version}\nRelease: ${release}\nNotifications Updated At: ${moment(this.props.session.notifications_updated_at).format('MMMM Do YYYY, h:mm a Z')}\nNotification Permissions: ${this.state.notificationPermissions}\n\n________________________\n\n`;

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
            <SettingsFAQContent
              setModalVisible={this.setFAQModalVisible}
            />
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
            <ConsentDisclosureVersion hideButton={true} />
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

  getNotificationPermissions = async () => {
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

    // console.log("Notification Settings: ", status);

    this.setState({ notificationPermissions: status });
  };

  renderDevDebugItems = releaseChannel => {
    return (
      <View>
        <Text>
          Notification Permissions: {this.state.notificationPermissions}
        </Text>
        <Text>
          Notifications Updated:{' '}
          {moment(this.props.session.notifications_updated_at).format(
            'MM/DD/YY',
          )}
        </Text>
      </View>
    );
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

    return (
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BabySteps App Information:</Text>
          <Text>
            Version: {manifest.version}:{build}
          </Text>
          {this.renderDevDebugItems(release)}
          <Text>Release: {release}</Text>

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

        {this.renderNotificationList(release)}

        {this.renderFAQModal()}
        {this.renderConsentModal()}
      </ScrollView>
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

const mapDispatchToProps = { fetchNotifications, fetchRespondent };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsScreen);

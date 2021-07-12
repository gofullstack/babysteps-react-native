import React, { Component } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  AppState,
  LogBox,
} from 'react-native';
import FlashMessage from 'react-native-flash-message';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import * as Sentry from 'sentry-expo';

import RootNavigator from './navigation/RootNavigator';

import RegisterForPushNotifications from './notifications/registerForPushNotifications';
import HandleNotifications from './notifications/handleNotifications';

import MomentaryAssessment from './components/momentary_assessment_modal';
import ConfirmConsentVersion from './components/confirm_consent_version';

import CheckDataIntegrity from './database/check_data_integrity';
import ApiSyncData from './database/api_sync_data';
import ApiOfflineListener from './database/api_offline_listener';
import Player from './components/Player';

import { store, persistor } from './store';

import checkCustomDirectories from './database/check_custom_directories';

import Colors from './constants/Colors';
import soundLibrary from './constants/SoundLibrary';

Sentry.init({
  dsn: Constants.manifest.extra.sentryDSN,
  enableInExpoDevelopment: false,
  debug: true,
});

LogBox.ignoreAllLogs();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default class App extends Component {
  state = {
    isLoadingComplete: false,
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', () => {});
  }

  handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

  handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  loadResourcesAsync = async () => {

    Player.load(soundLibrary);

    await Asset.loadAsync([
      require('./assets/images/milestone_group/img0.png'),
      require('./assets/images/milestone_group/img1.png'),
      require('./assets/images/milestone_group/img2.png'),
      require('./assets/images/milestone_group/img3.png'),
      require('./assets/images/milestone_group/img4.png'),
      require('./assets/images/milestone_group/img5.png'),
      require('./assets/images/milestone_group/img6.png'),
      require('./assets/images/milestone_group/img7.png'),
      require('./assets/images/milestone_group/img8.png'),
      require('./assets/images/milestone_group/img9.png'),
      require('./assets/images/milestone_group/img10.png'),
      require('./assets/images/milestone_group/img11.png'),
      require('./assets/images/milestone_group/img12.png'),
      require('./assets/images/milestone_group/img13.png'),
      require('./assets/images/baby_book_cover_background.png'),
      require('./assets/images/baby_book_inside_background.png'),
      require('./assets/images/baby_book_picture_frame_bottom_left.png'),
      require('./assets/images/baby_book_picture_frame_bottom_right.png'),
      require('./assets/images/baby_book_picture_frame_top_left.png'),
      require('./assets/images/baby_book_picture_frame_top_right.png'),
      require('./assets/images/background.png'),
      require('./assets/images/camera_accept_media_icon.png'),
      require('./assets/images/camera_belly_position.png'),
      require('./assets/images/camera_cancel_camera_icon.png'),
      require('./assets/images/camera_delete_media_save_video.png'),
      require('./assets/images/camera_face_position.png'),
      require('./assets/images/camera_flip_direction_icon.png'),
      require('./assets/images/camera_frustration.gif'),
      require('./assets/images/camera_frustration_frustrate.gif'),
      require('./assets/images/camera_frustration_play.gif'),
      require('./assets/images/camera_frustration_resume.gif'),
      require('./assets/images/camera_frustration_stop.gif'),
      require('./assets/images/camera_toggle_flash_icon.png'),
      require('./assets/images/camera_toggle_flash_icon_active.png'),
      require('./assets/images/milestones_checkbox.png'),
      require('./assets/images/milestones_checkbox_complete.png'),
      require('./assets/images/milestones_checkbox_in_progress.png'),
      require('./assets/images/milestones_checkbox_skipped.png'),
      require('./assets/images/milestones_right_arrow.png'),
      require('./assets/images/overview_camera.png'),
      require('./assets/images/overview_baby_icon.png'),
      require('./assets/images/timeline.png'),
      require('./assets/images/tour_no_study_confirm.png'),
      require('./assets/images/tour_slide_four_baby.png'),
      require('./assets/images/tour_slide_four_brain.png'),
      require('./assets/images/tour_slide_four_face.png'),
      require('./assets/images/tour_slide_four_video.png'),
      require('./assets/images/tour_slide_one.png'),
      require('./assets/images/tour_slide_three.png'),
      require('./assets/images/tour_slide_two.png'),
      require('./assets/images/uofi_logo.png'),
      require('./assets/images/exclamation.png'),
    ]);

    await Font.loadAsync({
      // This is the font that we are using for our tab bar
      ...Ionicons.font,
      FontAwesome: require('./assets/fonts/FontAwesome.ttf'),
      // Need two forms of material icons; one for each OS
      MaterialIcons: require('./assets/fonts/MaterialIcons.ttf'),
      'Material Icons': require('./assets/fonts/MaterialIcons.ttf'),
    });

    await checkCustomDirectories();
  };

  render() {
    const { isLoadingComplete } = this.state;
    const { skipLoadingScreen } = this.props;
    if (!isLoadingComplete && !skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this.loadResourcesAsync}
          onError={this.handleLoadingError}
          onFinish={this.handleFinishLoading}
        />
      );
    }

    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <View style={styles.container}>
            {Platform.OS === 'android' && <StatusBar barStyle="default" />}
            <CheckDataIntegrity />
            <ApiSyncData />
            <ApiOfflineListener />
            <RootNavigator />
            <FlashMessage position="top" />
            <RegisterForPushNotifications />
            <HandleNotifications />
            <MomentaryAssessment />
            <ConfirmConsentVersion />
          </View>
        </PersistGate>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

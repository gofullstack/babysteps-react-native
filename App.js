import React, { Component } from 'react';
import { Platform, StatusBar, StyleSheet, View, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Provider } from 'react-redux';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import * as Notifications from 'expo-notifications';
import FlashMessage from 'react-native-flash-message';
import * as Sentry from 'sentry-expo';

import { Ionicons } from '@expo/vector-icons';

import Constants from 'expo-constants';
import RootNavigator from './navigation/RootNavigator';

import checkMilestonesSchema from './database/check_milestones_schema';
import checkMilestoneTriggersSchema from './database/check_milestone_triggers_schema';
import checkRegistrationSchema from './database/check_registration_schema';
import checkAnswersSchema from './database/check_answers_schema';
import checkNotificationsSchema from './database/check_notifications_schema';
import checkBabyBookSchema from './database/check_babybook_schema';
import checkCustomDirectories from './components/check_custom_directories';
//import moveDataToMainDirectory from './components/move_data_to_main_directory';

import MomentaryAssessment from './components/momentary_assessment_modal';

import ApiOfflineListener from './database/api_offline_listener';

import store from './store';

import Colors from './constants/Colors';

Sentry.init({
  dsn: Constants.manifest.extra.sentryDSN,
  enableInExpoDevelopment: false,
  debug: true,
});

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

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _loadResourcesAsync = async () => {

    await Asset.loadAsync([
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
      require('./assets/sounds/fall.mp3'),
      require('./assets/sounds/trill.mp3'),
      require('./assets/sounds/woosh.mp3'),
    ]);
    await Font.loadAsync({
      // This is the font that we are using for our tab bar
      ...Ionicons.font,
      FontAwesome: require('./assets/fonts/FontAwesome.ttf'),
      // Need two forms of material icons; one for each OS
      MaterialIcons: require('./assets/fonts/MaterialIcons.ttf'),
      'Material Icons': require('./assets/fonts/MaterialIcons.ttf'),
    });

    // async check of schemas
    await checkRegistrationSchema();
    await checkMilestonesSchema();
    await checkMilestoneTriggersSchema();
    await checkAnswersSchema();
    await checkNotificationsSchema();
    await checkBabyBookSchema();
    await checkCustomDirectories();
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    }

    return (
      <Provider store={store}>
        <View style={styles.container}>
          {Platform.OS === 'android' && <StatusBar barStyle="default" />}
          <RootNavigator />
          <FlashMessage position="top" />
          <MomentaryAssessment />
          <ApiOfflineListener />
        </View>
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

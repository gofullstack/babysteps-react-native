import React, { Component } from 'react';
import {
  Text,
  View,
  Modal,
  Vibration,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { Video } from 'expo-av';
import { Camera } from 'expo-camera';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import Constants from 'expo-constants';

import * as moment from 'moment';
import padStart from 'lodash/padStart';
import Colors from '../constants/Colors';
import soundLibrary from '../constants/SoundLibrary';

import Player from './Player.js';

// TODO fix horizontal styles
const { width, height } = Dimensions.get('window');
const imageWidth = width;
const imageHeight = height;
const ratio = '4:3';
const imageButtonsHeight = height * 0.3;
const cameraPositionMargin = 35;
const cameraPositionMarginTop = 100;
const cameraPositionWidth = width - (cameraPositionMargin * 2);
const cameraPositionHeight = (height * 0.6) - cameraPositionMargin;

const mediaTypes = {
  file_audio: 'audio',
  file_image: 'photo',
  file_video: 'video',
  file_video_frustration: 'video',
};

class CameraModal extends Component {
  state = {
    activeOption: 'photo',
    limitOption: false,
    type: Camera.Constants.Type.back,
    flashMode: Camera.Constants.FlashMode.off,
    isLandscape: false,
    recording: false,
    isTakingImage: false,
    confirmingImage: false,
    videoTimer: null,
  };

  componentDidMount() {
    const question = this.props.question;
    if (question) {

      this.setState({
        limitOption: true,
        activeOption: mediaTypes[question.rn_input_type],
      });

      if (Constants.isDevice && question.rn_input_type === 'file_video_frustration') {
        this.setState({
          type: Camera.Constants.Type.front,
          isLandscape: question.rn_input_type === 'file_video_frustration',
        });
      }

    } // if question
  }

  onLayout = () => {
    if (!this.container) return;

    if (width >= height) {
      this.setState({ isLandscape: true });
      return;
    }

    // this.setState({ isLandscape: false });
  };

  onReceiveVideo = (cancelRecording, image) => {
    if (!cancelRecording) {
      this.image = image;
      // do not use confirm view for video
      // this.setState({ confirmingImage: true, recording: false });
      this.props.closeCameraModal(this.image);
      this.image = null;
      Vibration.vibrate();
    } else {
      this.setState({ recording: false });
    }
  };

  startVideo = async () => {
    activateKeepAwake();
    let recordingConfig = {
      quality: String(Camera.Constants.VideoQuality['720p']),
      mirror: true, // flip on iOS
    };
    if (Platform === 'android') {
      recordingConfig = {
        quality: String(Camera.Constants.VideoQuality['480p']),
      };
    }
    this.cancelRecording = false;
    this.setState({ recording: true, videoTimer: moment.duration(0) });
    if (this.videoTimeInterval) clearInterval(setInterval);
    this.videoTimeInterval = setInterval(() => {
      this.setState({ videoTimer: this.state.videoTimer.add(1, 's') });
    }, 1000);

    this.camera.recordAsync(recordingConfig).then(image => {
      this.onReceiveVideo(this.cancelRecording, image);
    });
  };

  stopVideo = () => {
    deactivateKeepAwake();
    if (this.videoTimeInterval) clearInterval(this.videoTimeInterval);
    this.camera.stopRecording();
  };

  cancelVideo = () => {
    deactivateKeepAwake();
    this.cancelRecording = true;
    this.setState({ videoTimer: moment.duration(0) });
    this.stopVideo();
  };

  handlePressVideoOption = () => {
    this.setState({ activeOption: 'video', videoTimer: moment.duration(0) });
  };

  handleCloseModal = () => {
    deactivateKeepAwake();
    this.props.closeCameraModal(null);
  };

  onReceiveImage = image => {
    this.image = image;
    this.setState({ confirmingImage: true });
  };

  handleTakePicture = async () => {
    this.image = null;
    const { activeOption } = this.state;
    if (activeOption === 'video') {
      if (this.state.recording) {
        this.stopVideo();
      } else {
        this.startVideo();
      }
      return;
    }

    setTimeout(() => this.setState({ isTakingImage: true }), 10);
    const image = await this.camera.takePictureAsync();
    this.onReceiveImage(image);
    this.setState({ isTakingImage: false });
  };

  handleChangeFlashMode = () => {
    this.setState({
      flashMode:
        this.state.flashMode === Camera.Constants.FlashMode.off
          ? Camera.Constants.FlashMode.on
          : Camera.Constants.FlashMode.off,
    });
  };

  handleChangeCameraType = () => {
    this.cancelVideo();
    this.setState({
      type:
        this.state.type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back,
    });
  };

  handleCancelImage = () => {
    if (this.videoTimeInterval) clearInterval(this.videoTimeInterval);
    this.videoTimer = moment.duration(0);
    //this.camera.resumePreview();
    this.image = null;
    this.setState({ confirmingImage: false, videoTimer: moment.duration(0) });
  };

  handleConfirmImage = () => {
    if (this.videoTimeInterval) clearInterval(this.videoTimeInterval);
    this.videoTimer = moment.duration(0);
    this.setState({ confirmingImage: false, videoTimer: moment.duration(0) });
    if (this.image) {
      this.props.closeCameraModal(this.image);
      this.image = null;
    }
  };

  handleOnShow = () => {
    //if (this.camera) this.camera.resumePreview();
  };

  handleOnDismiss = () => {
    //if (this.camera) this.camera.pausePreview();
  };

  renderBottomBar = () => {
    const { videoTimer, limitOption, activeOption, isLandscape } = this.state;
    const question = this.props.question;
    const rotateX = '0deg'; // isLandscape ? '90deg' : '0deg';
    let takePictureButtonColor = { backgroundColor: Colors.magenta };
    if (videoTimer) {
      const minutes = videoTimer.minutes();
      const seconds = videoTimer.seconds();
      if (question.rn_input_type === 'file_video_frustration') {
        if (minutes >= 3) {
          if (seconds === 1) {
            Player.playSound('trill');
            Vibration.vibrate();
          }
          takePictureButtonColor = { backgroundColor: Colors.red };
        }
        if (minutes >= 4) {
          takePictureButtonColor = { backgroundColor: Colors.green };
        }
        if (minutes >= 3 && minutes < 5 && (seconds % 2 !== 0)) {
          takePictureButtonColor = { backgroundColor: Colors.black };
        }
      } else if (minutes >= 3) {
        if (seconds % 2 === 0) {
          takePictureButtonColor = { backgroundColor: Colors.red };
        } else {
          takePictureButtonColor = { backgroundColor: Colors.black };
        }
      }
    }

    return (
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarActions}>
          <View style={styles.bottomBarAction}>
            <TouchableOpacity onPress={() => this.handleCloseModal()}>
              <Image
                style={{ width: 22, height: 22, transform: [{ rotateX }] }}
                source={require('../assets/images/camera_cancel_camera_icon.png')}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => this.handleTakePicture()}
            style={styles.takePictureButton}
          >
            <View style={[styles.takePictureButtonInner, takePictureButtonColor]} />
          </TouchableOpacity>

          <View style={styles.bottomBarAction}>
            <TouchableOpacity onPress={this.handleChangeCameraType}>
              <Image
                style={{ width: 27, height: 27, marginRight: 26, transform: [{ rotateX }] }}
                source={require('../assets/images/camera_flip_direction_icon.png')}
              />
            </TouchableOpacity>
            {activeOption === 'photo' && (
              <TouchableOpacity onPress={this.handleChangeFlashMode}>
                <Image
                  style={{ width: 28, height: 27, transform: [{ rotateX }] }}
                  source={
                    this.state.flashMode === Camera.Constants.FlashMode.off
                      ? require('../assets/images/camera_toggle_flash_icon.png')
                      : require('../assets/images/camera_toggle_flash_icon_active.png')
                  }
                />
              </TouchableOpacity>
            )}
            {activeOption === 'video' && (
              <View>
                <Text style={{ color: Colors.white }}>
                  {videoTimer && (
                    `${videoTimer.minutes()}:${padStart(videoTimer.seconds(), 2, '0')}`
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.bottomBarMenu}>
          {!limitOption && (
            <TouchableOpacity
              onPress={() => this.setState({ activeOption: 'photo' })}
            >
              <Text
                style={{
                  marginRight: 72,
                  fontSize: 15,
                  color:
                    activeOption === 'photo' ? Colors.magenta : Colors.white,
                }}
              >
                Photo
              </Text>
            </TouchableOpacity>
          )}
          {(!limitOption) && (
            <TouchableOpacity onPress={this.handlePressVideoOption}>
              <Text
                style={{
                  fontSize: 15,
                  color:
                    activeOption === 'video'
                      ? Colors.magenta
                      : Colors.white,
                }}
              >
                Video
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  renderConfirmImage = () => {
    const rotateX = this.state.isLandscape ? '90deg' : '0deg';
    return (
      <View style={[styles.bottomBar, styles.bottomBarConfirm]}>
        <View style={styles.bottomBarConfirmActions}>
          <TouchableOpacity onPress={() => this.handleCancelImage()}>
            <Image
              style={[styles.bottomBarButtonImage, {transform: [{ rotateX }] }]}
              source={require('../assets/images/camera_delete_media_save_video.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.handleConfirmImage()}>
            <Image
              style={[styles.bottomBarButtonImage, {transform: [{ rotateX }], marginBottom: 4 }]}
              source={require('../assets/images/camera_accept_media_icon.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  renderImagePreview = () => {
    const { activeOption } = this.state;
    //this.camera.pausePreview;
    return (
      <View style={styles.imagePreview}>
        {activeOption === 'photo' && (
          <Image
            source={{ uri: this.image.uri }}
            style={{ width: imageWidth, height: imageHeight }}
            resizeMode="cover"
          />
        )}
        {activeOption === 'video' && (
          <Video
            source={{ uri: this.image.uri }}
            shouldPlay={false}
            resizeMode={Video.RESIZE_MODE_COVER}
            style={{ flex: 1 }}
            useNativeControls
          />
        )}
        {this.renderConfirmImage()}
      </View>
    );
  };

  renderCameraPosition = (question, choice) => {
    const { recording, videoTimer } = this.state;
    //if (this.camera) this.camera.resumePreview();
    let cameraPositionTemplate = '';
    if (choice !== undefined && choice) {
      if (choice.overview_timeline === 'post_birth') {
        cameraPositionTemplate = require('../assets/images/camera_face_position.png');
      }
      if (choice.overview_timeline === 'during_pregnancy') {
        cameraPositionTemplate = require('../assets/images/camera_belly_position.png');
      }
    }
    if (question && question.rn_input_type === 'file_video_frustration') {
      cameraPositionTemplate = require('../assets/images/camera_frustration.gif');
      if (recording && videoTimer) {
        const minutes = videoTimer.minutes();
        if (minutes < 3){
          cameraPositionTemplate = require('../assets/images/camera_frustration_play.gif');
        }
        if (minutes >= 3){
          cameraPositionTemplate = require('../assets/images/camera_frustration_frustrate.gif');
        }
        if (minutes >= 4){
          cameraPositionTemplate = require('../assets/images/camera_frustration_resume.gif');
        }
        if (minutes >= 5){
          cameraPositionTemplate = require('../assets/images/camera_frustration_stop.gif');
        }
      }
    }
    if (cameraPositionTemplate) {
      return (
        <Image
          source={cameraPositionTemplate}
          style={styles.cameraPosition}
          resizeMode='contain'
        />
      );
    }
    return null;
  };

  renderCamera = () => {
    const { flashMode, type } = this.state;
    const { question, choice } = this.props;
    return (
      <Camera
        ref={ref => {this.camera = ref}}
        style={{ flex: 1, height: imageHeight }}
        type={type}
        flashMode={flashMode}
        ratio={ratio}
      >
        {this.renderBottomBar()}
        {this.renderCameraPosition(question, choice)}
      </Camera>
    );
  };

  render() {
    const confirmingImage = this.state.confirmingImage;
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.props.modalVisible}
        onShow={this.handleOnShow()}
        onDismiss={this.handleOnDismiss()}
        onRequestClose={() => {}}
      >
        <View style={styles.camera} ref={ref => (this.container = ref)}>
          {!confirmingImage && this.renderCamera() }
          {confirmingImage && this.image && this.renderImagePreview() }
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  bottomBar: {
    justifyContent: 'space-between',
    height: 165,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  bottomBarConfirm: {
    backgroundColor: 'rgba(0,0,0,.3)',
  },
  bottomBarAction: {
    flex: 0.3,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBarActions: {
    height: 110,
    flex: 1,
    paddingBottom: 10,
    paddingTop: 10,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBarConfirmActions: {
    height: 110,
    flex: 1,
    paddingBottom: 10,
    paddingTop: 10,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBarMenu: {
    height: isIphoneX() ? 50 : 30,
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bottomBarButtonImage: {
    width: 27,
    height: 27,
  },
  camera: {
    flex: 1,
    //flexDirection: 'column',
    //justifyContent: 'flex-end',
  },
  imagePreview: {
    flex: 1,
    //flexDirection: 'column',
    //justifyContent: 'flex-end',
    //width: imageWidth,
    //height: imageHeight,
  },
  cameraPosition: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: cameraPositionWidth,
    height: cameraPositionHeight,
    marginTop: cameraPositionMarginTop,
    marginLeft: cameraPositionMargin,
    marginRight: cameraPositionMargin,
  },
  takePictureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Colors.black,
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
    justifyContent: 'center',
  },
  takePictureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignSelf: 'center',
  },
});

export default CameraModal;

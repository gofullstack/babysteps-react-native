import React, { Component, PureComponent } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import {
  Text,
  Button,
  CheckBox,
  FormLabel,
  FormInput,
  Slider,
} from 'react-native-elements';
import * as Permissions from 'expo-permissions';
import * as WebBrowser from 'expo-web-browser';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import DatePicker from './datePickerInput';

import _ from 'lodash';

import AutoHeightImage from './auto_height_image';
import registerForPermission, {
  renderNoPermissionsMessage,
  openSettingsDialog,
} from './permissions';
import CameraModal from './camera_modal';
import AudioModal from './audio_modal';

import Colors from '../constants/Colors';
import VideoFormats from '../constants/VideoFormats';
import ImageFormats from '../constants/ImageFormats';
import AudioFormats from '../constants/AudioFormats';

const { width } = Dimensions.get('window');

const previewWidth = width - 40;
const previewHeight = width * 0.75;

const videoWidth = previewWidth;
const videoHeight = previewWidth;

const formats = {
  file_audio: 'Audio',
  file_image: 'Photo',
  file_video: 'Video',
  file_video_frustration: 'Video',
};
const mediaTypes = {
  file_audio: 'Audio',
  file_image: 'Images',
  file_video: 'Videos',
  file_video_frustration: 'Videos',
};

// eslint-disable-next-line react/prefer-stateless-function
export class RenderCheckBox extends Component {
  render() {
    const { choices, answers, pregnancy, format } = this.props;
    const collection = _.map(choices, choice => {
      let checked = false;
      let text = '';
      const answer = _.find(answers, {'choice_id': choice.id, pregnancy: pregnancy });

      if (answer) {
        checked = answer.answer_boolean;
        text = answer.answer_text;
      }
      const requireExplanation = (choice.require_explanation === 'if_true' && checked);
      let option_group = 'text_short';
      if (choice.rn_input_type) option_group = choice.rn_input_type;

      return (
        <View key={choice.id} style={styles.checkBoxExplanationContainer}>
          <CheckBox
            title={choice.body}
            textStyle={styles.checkBoxChoiceText}
            containerStyle={styles.checkBoxChoiceContainer}
            checked={checked}
            onPress={() => {
              this.props.saveResponse(
                choice,
                { answer_boolean: !checked },
                { format },
              );
            }}
          />
          {requireExplanation && option_group === 'text_short' && (
            <FormInput
              autoCapitalize="words"
              inputStyle={styles.textInput}
              defaultValue={text}
              onChangeText={value => {
                this.props.saveResponse(
                  choice,
                  { answer_text: value },
                  { preserve: true },
                );
              }}
              containerStyle={{ borderBottomColor: Colors.lightGrey }}
              underlineColorAndroid={Colors.lightGrey}
            />
          )}
          {requireExplanation && option_group === 'number_scale' && (
            <View style={styles.sliderContainer}>
              <Text>Years: {text}</Text>
              <Slider
                style={styles.slider}
                trackStyle={styles.sliderTrack}
                thumbStyle={styles.sliderThumb}
                minimumValue={0}
                maximumValue={30}
                step={1}
                onSlidingComplete={value => {
                  this.props.saveResponse(
                    choice,
                    { answer_text: `${value} years` },
                    { preserve: true },
                  );
                }}
              />
            </View>
          )}
        </View>
      );
    });
    return <View>{collection}</View>;
  } // render
}

// eslint-disable-next-line react/prefer-stateless-function
export class RenderCheckYesNo extends Component {
  render() {
    const { choices, answers, pregnancy } = this.props;
    const collection = _.map(choices, choice => {
      let checked = false;
      const answer = _.find(answers, {'choice_id': choice.id, pregnancy: pregnancy });
      if (answer) checked = answer.answer_boolean;

      //console.log({ answer })

      return (
        <CheckBox
          key={choice.id}
          title={choice.body}
          textStyle={styles.checkBoxChoiceText}
          containerStyle={styles.checkBoxChoiceContainer}
          checked={checked}
          onPress={() => {
            this.props.saveResponse(
              choice,
              { answer_boolean: !checked },
              { format: 'single' },
            );
          }}
        />
      );
    });
    return <View style={{ flexDirection: 'row' }}>{collection}</View>;
  } // render
}

// eslint-disable-next-line react/prefer-stateless-function
export class RenderTextShort extends Component {
  render() {
    const { choices, answers, pregnancy } = this.props;
    const collection = _.map(choices, choice => {
      let text = '';
      const answer = _.find(answers, {'choice_id': choice.id, pregnancy: pregnancy });
      if (answer) text = answer.answer_text;

      return (
        <View key={choice.id}>
          <FormLabel labelStyle={styles.textLabel}>{choice.body}</FormLabel>
          <FormInput
            autoCapitalize="words"
            inputStyle={styles.textInput}
            defaultValue={text}
            onChangeText={value => {
              this.props.saveResponse(choice, { answer_text: value });
            }}
            containerStyle={{ borderBottomColor: Colors.lightGrey }}
            underlineColorAndroid={Colors.lightGrey}
          />
        </View>
      );
    });
    return <View>{collection}</View>;
  } // render
}

// eslint-disable-next-line react/prefer-stateless-function
export class RenderTextLong extends Component {
  render() {
    const { choices, answers, pregnancy } = this.props;
    const collection = _.map(choices, choice => {
      let text = '';
      const answer = _.find(answers, {'choice_id': choice.id, pregnancy: pregnancy });
      if (answer) text = answer.answer_text;

      return (
        <View key={choice.id}>
          <FormLabel labelStyle={styles.textLabel}>{choice.body}</FormLabel>
          <FormInput
            autoCapitalize="sentences"
            inputStyle={styles.textInput}
            defaultValue={text}
            multiline={true}
            numberOfLines={4}
            onChangeText={value => {
              this.props.saveResponse(choice, { answer_text: value });
            }}
            containerStyle={{ borderBottomColor: Colors.lightGrey }}
            underlineColorAndroid={Colors.lightGrey}
          />
        </View>
      );
    });
    return <View>{collection}</View>;
  } // render
}

// eslint-disable-next-line react/prefer-stateless-function
export class RenderTextNumeric extends Component {
  render() {
    const { choices, answers, pregnancy } = this.props;
    const collection = _.map(choices, choice => {
      let text = '';
      const answer = _.find(answers, {'choice_id': choice.id, pregnancy: pregnancy });
      if (answer) text = answer.answer_text;
      return (
        <View key={choice.id}>
          <FormLabel labelStyle={styles.textLabel}>{choice.body}</FormLabel>
          <FormInput
            inputStyle={styles.textInput}
            defaultValue={text}
            keyboardType="numeric"
            onChangeText={value => {
              this.props.saveResponse(choice, { answer_text: value });
            }}
            containerStyle={{ borderBottomColor: Colors.lightGrey }}
            underlineColorAndroid={Colors.lightGrey}
          />
        </View>
      );
    });
    return <View>{collection}</View>;
  } // render
}

// eslint-disable-next-line react/prefer-stateless-function
export class RenderDate extends Component {
  render() {
    const { choices, answers, pregnancy } = this.props;
    const collection = _.map(choices, choice => {
      let value = new Date();
      const answer = _.find(answers, {'choice_id': choice.id, pregnancy: pregnancy });
      value = answer ? answer.answer_text : null;
      return (
        <View key={choice.id}>
          <DatePicker
            label={choice.body}
            date={value}
            style={styles.dateInput}
            handleChange={value => {
              this.props.saveResponse(choice, { answer_text: value });
            }}
            showIcon={false}
            customStyles={{
              dateInput: {
                borderWidth: 0,
                borderBottomWidth: 1,
                borderBottomColor: Colors.lightGrey,
              },
            }}
          />
        </View>
      );
    });
    return <View>{collection}</View>;
  } // render
}

// eslint-disable-next-line react/prefer-stateless-function
export class RenderFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      choice: null,
      hasCameraPermission: false,
      hasMediaLibraryPermission: false,
      hasAudioPermission: false,
      permissionMessage: '',
      imageError: '',
      cameraModalVisible: false,
      audioModalVisible: false,
    };
    this._isMounted = false;
  }

  async componentDidMount() {
    const { question } = this.props;
    const isFileVideo = [
      'file_video',
      'file_video_frustration',
    ].includes(question.rn_input_type);
    const isFileImage = question.rn_input_type === 'file_image';
    const isFileAudio = [
      'file_audio',
      'file_video',
      'file_video_frustration',
    ].includes(question.rn_input_type);

    let message = [];
    let hasCameraPermission = false;
    let hasMediaLibraryPermission = false;
    let hasAudioPermission = false;
    this._isMounted = true;

    if (isFileVideo || isFileImage) {
      hasMediaLibraryPermission = await registerForPermission(Permissions.MEDIA_LIBRARY);
      if (!hasMediaLibraryPermission) message = renderNoPermissionsMessage('library', message);
      hasCameraPermission = await registerForPermission(Permissions.CAMERA);
      if (!hasCameraPermission) message = renderNoPermissionsMessage('camera', message);
    }
    if (isFileAudio) {
      hasAudioPermission = await registerForPermission(Permissions.AUDIO_RECORDING);
      if (!hasAudioPermission) message = renderNoPermissionsMessage('audio', message);
    }

    // disable setState to avoid memory leaks if closing before async finished
    if (this._isMounted) {
      this.setState({
        hasMediaLibraryPermission,
        hasCameraPermission,
        hasAudioPermission,
        permissionMessage: message.join(', '),
      });
      if (Platform.OS === 'ios' && message.length !== 0) {
        openSettingsDialog();
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  pickImage = async (choice, source = null) => {
    const { question } = this.props;
    const { hasMediaLibraryPermission } = this.state;
    let image = {};
    this.setState({ choice });
    if (source === 'library' && hasMediaLibraryPermission) {
      const mediaType = mediaTypes[question.rn_input_type];
      image = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType,
      });
      this.saveFile(image);
    } else {
      this.setState({ cameraModalVisible: true });
    }
  };

  recordAudio = choice => {
    this.setState({ choice, audioModalVisible: true });
  };

  saveFile = (file) => {
    const { question } = this.props;
    const { choice } = this.state;
    if (file && !file.cancelled) {
      file.file_type = question.rn_input_type;
      file.title = question.title;
      this.props.saveResponse(choice, { attachments: [file] });
      this.setState({ choice: null });
    }
  };

  _closeAudioModal = sound => {
    this.saveFile(sound);
    this.setState({ audioModalVisible: false });
  };

  _closeCameraModal = image => {
    this.saveFile(image);
    this.setState({ cameraModalVisible: false });
  };

  render() {
    const { question, answers, attachments, errorMessage } = this.props;
    const format = formats[question.rn_input_type];
    let loadCameraModal = false;
    let loadAudioModal = false;

    const {
      hasMediaLibraryPermission,
      hasCameraPermission,
      hasAudioPermission,
      permissionMessage,
    } = this.state;

    const collection = _.map(question.choices, choice => {
      let { isVideo, isImage, isAudio } = false;
      let { displayVideo, displayImage, displayAudio } = false;

      let allowAttachFile = !['post_birth', 'during_pregnancy'].includes(
        choice.overview_timeline,
      );

      let uri = null;
      let uriParts = [];
      let fileType = null;
      // will not support pregnancy history if attachment is added to questionaire
      const answer = _.find(answers, ['choice_id', choice.id]);
      let attachment = _.find(attachments, ['choice_id', choice.id]);

      if (attachment && attachment.uri) {
        uri = attachment.uri;
        uriParts = uri.split('.');
        fileType = uriParts[uriParts.length - 1];
      }

      switch (question.rn_input_type) {
        case 'file_image':
          isImage = true;
          loadCameraModal = true;
          if (fileType) {displayImage = !!ImageFormats[fileType]};
          break;
        case 'file_video':
          isVideo = true;
          loadCameraModal = true;
          if (fileType) {displayVideo = !!VideoFormats[fileType]};
          break;
        case 'file_video_frustration':
          isVideo = true;
          loadCameraModal = true;
          allowAttachFile = false;
          if (fileType) {displayVideo = !!VideoFormats[fileType]};
          break;
        case 'file_audio':
          isAudio = true;
          loadAudioModal = true;
          if (fileType) {displayAudio = !!AudioFormats[fileType]};
          break;
      }

      return (
        <View key={choice.id} style={styles.fileImageContainer}>
          {(isImage || isVideo) && (
            <View>
              <Text style={styles.questionBody}>{question.body}</Text>
              {allowAttachFile && (
                <Button
                  title={`Attach ${format}`}
                  buttonStyle={styles.libraryButton}
                  titleStyle={styles.buttonTitleStyle}
                  color={Colors.green}
                  onPress={() => this.pickImage(choice, 'library')}
                  disabled={!hasMediaLibraryPermission}
                />
              )}
              <Button
                title={`Take a ${format}`}
                buttonStyle={styles.cameraButton}
                titleStyle={styles.buttonTitleStyle}
                color={Colors.green}
                onPress={() => this.pickImage(choice, 'new')}
                disabled={!hasCameraPermission}
              />
              <Text style={styles.textHelper}>
                Your photos and videos are stored on our secure servers and
                never shared with anyone outside of the study team.
              </Text>
            </View>
          )}
          {isAudio && (
            <View>
              <Text style={styles.questionBody}>{question.body}</Text>
              <Button
                title="Record Audio"
                buttonStyle={styles.libraryButton}
                titleStyle={styles.buttonTitleStyle}
                color={Colors.green}
                onPress={() => this.recordAudio(choice)}
                disabled={!hasAudioPermission}
              />
              <Text style={styles.textHelper}>
                Your personal information is stored on our secure servers and
                never shared with anyone outside of the study team.
              </Text>
            </View>
          )}
          {!!permissionMessage && (
            <Text style={styles.textError}>{permissionMessage}</Text>
          )}
          {!!errorMessage && <Text style={styles.textError}>{errorMessage}</Text>}

          <View style={styles.pickImageContainer}>
            {displayVideo && (
              <Video
                source={{ uri: uri }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode={Video.RESIZE_MODE_COVER}
                shouldPlay={false}
                isLooping
                useNativeControls
                style={styles.video}
              />
            )}
            {displayImage && (
              <AutoHeightImage source={{ uri }} style={styles.image} width={previewWidth} />
            )}
            {displayAudio && (<Text>Recording Attached</Text>)}
            <Text style={styles.textError}>{this.state.imageError}</Text>
          </View>
        </View>
      ); // return
    }); // map choices
    return (
      <View>
        {collection}
        {loadCameraModal && (
          <CameraModal
            modalVisible={this.state.cameraModalVisible}
            closeCameraModal={image => this._closeCameraModal(image)}
            choice={this.state.choice}
            question={this.props.question}
          />
        )}
        {loadAudioModal && (
          <AudioModal
            modalVisible={this.state.audioModalVisible}
            closeAudioModal={sound => this._closeAudioModal(sound)}
            question={this.props.question}
          />
        )}
      </View>
    );
  } // render
}

export class RenderExternalLink extends Component {
  handleLinkPress = choice => {
    WebBrowser.openBrowserAsync(choice.body);
    this.props.saveResponse(choice, { answer_boolean: true });
  };

  render() {
    const { choices, answers, pregnancy } = this.props;
    const collection = _.map(choices, choice => {
      const answer = _.find(answers, {'choice_id': choice.id, pregnancy: pregnancy });
      const completed = answer && answer.answer_boolean;
      return (
        <View key={choice.id}>
          <Button
            title="Link to Task"
            buttonStyle={styles.libraryButton}
            titleStyle={styles.buttonTitleStyle}
            color={Colors.green}
            onPress={() => this.handleLinkPress(choice)}
          />
        </View>
      );
    });
    return <View>{collection}</View>;
  } // render
}

export class RenderInternalLink extends Component {
  handleLinkPress = choice => {
    this.props.saveResponse(choice, { answer_boolean: true });
    const actionToDispatch = StackActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({
          routeName: choice.body,
        }),
      ],
    });
    this.props.navigation.dispatch(actionToDispatch);
  };

  render() {
    const { choices } = this.props;
    const collection = _.map(choices, choice => {
      return (
        <View key={choice.id}>
          <TouchableOpacity onPress={() => this.handleLinkPress(choice)}>
            <Text style={styles.externalLink}>{choice.body}</Text>
          </TouchableOpacity>
        </View>
      );
    });
    return <View key={choice.id}>{collection}</View>;
  } // render
}

export class RenderGroupOptionError extends PureComponent {
  render() {
    const { question } = this.props;
    return (
      <View>
        <Text>
          Error: Group Option {question.rn_input_type} not found for Question
          ID: {question.id}
        </Text>
      </View>
    );
  } // render
}

const styles = StyleSheet.create({
  checkBoxChoiceContainer: {
    padding: 0,
    marginLeft: 20,
    backgroundColor: Colors.white,
    borderWidth: 0,
  },
  checkBoxChoiceText: {
    fontSize: 12,
    fontWeight: '400',
  },
  checkBoxExplanationContainer: {
    flexDirection: 'column',
  },
  textInput: {
    fontSize: 14,
    fontWeight: '600',
  },
  textLabel: {
    fontSize: 12,
    fontWeight: '400',
  },
  textError: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.red,
    alignSelf: 'center',
  },
  textHelper: {
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 20,
    color: Colors.grey,
    height: 44,
  },
  dateInput: {
    width: 200,
    marginBottom: 10,
    marginLeft: 20,
  },
  questionBody: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 0,
  },
  buttonTitleStyle: {
    fontWeight: '900',
  },
  fileImageContainer: {
    marginTop: 20,
  },
  cameraButton: {
    backgroundColor: Colors.lightGreen,
    borderColor: Colors.green,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  libraryButton: {
    backgroundColor: Colors.lightGreen,
    borderColor: Colors.green,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  pickImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flexGrow: 1,
    width: previewWidth,
  },
  video: {
    flex: 1,
    width: videoWidth,
    height: videoHeight,
  },
  externalLink: {
    padding: 10,
    marginLeft: 20,
    fontSize: 16,
    color: Colors.tintColor,
  },
  sliderContainer: {
    marginLeft: 30,
    marginRight: 20,
  },
  sliderThumb: {
    backgroundColor: Colors.darkGreen,
  },
});

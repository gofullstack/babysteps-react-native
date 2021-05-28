import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { Button } from 'react-native-elements';
import { Video } from 'expo-av';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';

import { compose } from 'recompose';
import { Formik } from 'formik';
import * as Yup from 'yup';
import withInputAutoFocus, {
  withNextInputAutoFocusForm,
  withNextInputAutoFocusInput,
} from 'react-native-formik';

import { connect } from 'react-redux';
import {
  createBabyBookEntry,
  apiCreateBabyBookEntry,
} from '../actions/babybook_actions';

import registerForPermission, {
  renderNoPermissionsMessage,
  openSettingsDialog,
} from './permissions';

import TextFieldWithLabel from './textFieldWithLabel';
import DatePicker from './datePickerInput';
import CameraModal from './camera_modal';

import Colors from '../constants/Colors';
import AppStyles from '../constants/Styles';
import VideoFormats from '../constants/VideoFormats';
import ImageFormats from '../constants/ImageFormats';
import AudioFormats from '../constants/AudioFormats';

const { width } = Dimensions.get('window');

const previewWidth = width - 40;
const previewHeight = width * 0.75;

const videoWidth = previewWidth;
const videoHeight = previewWidth;

const TextField = compose(
  withInputAutoFocus,
  withNextInputAutoFocusInput,
)(TextFieldWithLabel);
const DatePickerInput = compose(
  withInputAutoFocus,
  withNextInputAutoFocusInput,
)(DatePicker);

const Form = withNextInputAutoFocusForm(View);

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is Required'),
});

class BabyBookEntryForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      imageError: '',
      hasCameraPermission: false,
      hasCameraRollPermission: false,
      permissionMessage: '',
      cameraModalVisible: false,
    };
    this._isMounted = false;
  }

  async componentDidMount() {
    this._isMounted = true;
    let message = [];
    const hasCameraRollPermission = await registerForPermission(Permissions.CAMERA_ROLL);
    const hasCameraPermission = await registerForPermission(Permissions.CAMERA);
    if (!hasCameraRollPermission) {
      message = renderNoPermissionsMessage('library', message);
    }
    if (!hasCameraPermission) {
      message = renderNoPermissionsMessage('camera', message);
    }
    // disable setState to avoid memory leaks if closing before async finished
    if (this._isMounted) {
      this.setState({
        hasCameraRollPermission,
        hasCameraPermission,
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

  pickImage = async (source = null) => {
    let image = {};
    if (source === 'library') {
      if (this.state.hasCameraRollPermission) {
        image = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'All',
        });
      } else {
        await this.handleCameraRollPermission();
        this.renderNoPermissions(source);
      }
    } else {
      this.setState({ cameraModalVisible: true });
    }

    if (image && !image.cancelled) {
      this.setState({ image });
    }
  };

  closeCameraModal = image => {
    if (image) this.setState({ image });
    this.setState({ cameraModalVisible: false });
  };

  render() {
    const session = this.props.session;
    const user = this.props.registration.user.data;
    const {
      image,
      hasCameraPermission,
      hasCameraRollPermission,
      permissionMessage,
    } = this.state;

    let hasUri = false;
    let isVideo = false;
    let uri = null;
    let uriParts = [];

    if (image && image.uri) {
      uri = image.uri;
      hasUri = true;
      uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      isVideo = !!VideoFormats[fileType];
    }

    return (
      <Formik
        onSubmit={values => {
          const user = this.props.registration.user.data;
          const data = {
            ...values,
            user_id: user.id,
          };
          const apiData = {
            ...values,
            user_id: user.api_id,
          };
          this.props.createBabyBookEntry(data, this.state.image);
          this.props.apiCreateBabyBookEntry(session, apiData, this.state.image);
        }}
        validationSchema={validationSchema}
        initialValues={{
          cover: 0,
          created_at: new Date().toISOString(),
        }}
        render={props => {
          return (
            <Form>
              <TextField
                autoCapitalize="words"
                label="Title"
                name="title"
                inputStyle={AppStyles.registrationTextInput}
                inputContainerStyle={AppStyles.registrationTextInputContainer}
              />
              <DatePickerInput
                label="Date"
                name="created_at"
                date={props.values.created_at}
                labelStyle={AppStyles.registrationLabel}
                containerStyle={[AppStyles.registrationDateContainer, { marginBottom: 20 }]}
                showIcon={false}
                style={{ width: '100%' }}
                customStyles={{
                  dateInput: AppStyles.registrationDateInput,
                  dateText: AppStyles.registrationTextInput,
                }}
                handleChange={value => props.setFieldValue('created_at', value)}
              />

              <Button
                title="Attach Photo or Video"
                buttonStyle={styles.libraryButton}
                titleStyle={styles.buttonTitleStyle}
                color={Colors.green}
                onPressIn={() => this.pickImage('library')}
                disabled={!hasCameraRollPermission}
              />
              <Button
                title="Take a Photo or Video "
                buttonStyle={styles.cameraButton}
                titleStyle={styles.buttonTitleStyle}
                color={Colors.green}
                onPressIn={() => this.pickImage('new')}
                disabled={!hasCameraPermission}
              />
              {!!permissionMessage && (
                <Text style={styles.textError}>{permissionMessage}</Text>
              )}

              <View style={styles.pickImageContainer}>
                {hasUri && isVideo && (
                  <Video
                    source={{ uri }}
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
                {hasUri && !isVideo && (
                  <Image source={{ uri }} style={styles.image} />
                )}

                <Text style={styles.textError}>{this.state.imageError}</Text>
              </View>

              <View style={styles.textAreaContainer}>
                <TextField
                  label="Details"
                  name="detail"
                  autoCapitalize="sentences"
                  underlineColorAndroid="transparent"
                  placeholderTextColor="grey"
                  multiline
                  numberOfLines={10}
                  inputStyle={AppStyles.registrationTextInput}
                  inputContainerStyle={AppStyles.registrationTextInputContainer}
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Save Entry"
                  disabled={props.isSubmitting || !this.state.image}
                  onPress={props.submitForm}
                  buttonStyle={AppStyles.buttonSubmit}
                  titleStyle={{ fontWeight: 900 }}
                  color={Colors.darkGreen}
                />
              </View>

              <CameraModal
                modalVisible={this.state.cameraModalVisible}
                closeCameraModal={image => this.closeCameraModal(image)}
              />
            </Form>
          );
        }} // render
      /> // Formik
    ); // return
  } // render
}

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',

    bottom: 10,
    marginTop: 10,
    width: '100%',
  },
  buttonTitleStyle: {
    fontWeight: '900',
  },
  pickImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  image: {
    flex: 1,
    width: previewWidth,
    height: previewHeight,
  },
  video: {
    flex: 1,
    width: videoWidth,
    height: videoHeight,
  },
  textAreaContainer: {
    flex: 1,
    borderBottomColor: Colors.lightGrey,
    borderBottomWidth: 1,
    padding: 5,
    marginBottom: 20,
  },
  textError: {
    textAlign: 'center',
    color: Colors.errorColor,
    fontSize: 11,
    fontWeight: '400',
    padding: 5,
  },
});

const mapStateToProps = ({ session, babybook, registration }) => ({
  session,
  babybook,
  registration,
});
const mapDispatchToProps = {
  createBabyBookEntry,
  apiCreateBabyBookEntry,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(BabyBookEntryForm);

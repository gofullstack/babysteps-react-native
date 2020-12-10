import React, { Component } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, CheckBox } from 'react-native-elements';
import * as FileSystem from 'expo-file-system';

import { compose } from 'recompose';
import { Formik } from 'formik';
import * as Yup from 'yup';

import withInputAutoFocus, {
  withTouched,
  withNextInputAutoFocusForm,
  withNextInputAutoFocusInput,
} from 'react-native-formik';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import {
  fetchUser,
  fetchConsent,
  resetRespondent,
  createRespondent,
  updateRespondent,
  apiCreateRespondent,
  apiUpdateRespondent,
  apiSaveSignature,
} from '../actions/registration_actions';
import { updateSession } from '../actions/session_actions';

import DatePicker from './datePickerInput';
import Picker from './pickerInput';
import TextFieldWithLabel from './textFieldWithLabel';

import States from '../constants/States';
import Colors from '../constants/Colors';
import AppStyles from '../constants/Styles';
import IRBInformation from '../constants/IRB';
import CONSTANTS from '../constants';

import ActionStates from '../actions/states';

const TextField = compose(
  withInputAutoFocus,
  withTouched,
  withNextInputAutoFocusInput,
)(TextFieldWithLabel);
const PickerInput = compose(
  withInputAutoFocus,
  withTouched,
  withNextInputAutoFocusInput,
)(Picker);
const DatePickerInput = compose(
  withInputAutoFocus,
  withTouched,
  withNextInputAutoFocusInput,
)(DatePicker);

const Form = withNextInputAutoFocusForm(View, { submitAfterLastInput: false });

const validationSchema = Yup.object().shape({
  respondent_type: Yup.string()
    .typeError('Relationship is required')
    .required('Relationship is required'),
  address_1: Yup.string()
    .required('Address is required'),
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required'),
  zip_code: Yup.string()
    .required('Zip code is required')
    .matches(/\d{5}/, 'Zip code must be 5 digits'),
  home_phone: Yup.string()
    .required('Home phone is required'),
  date_of_birth: Yup.date()
    .typeError('Date of birth must be a valid date')
    .required('Date of birth is required'),
  //drivers_license_number: Yup.string()
    //.required("Driver's license number is required"),
  marital_status: Yup.string()
    .required('Marital status is required'),
  //weight: Yup.number('Weight must be a number')
    //.typeError('Weight must be a number')
    //.required('Weight is required')
    //.positive('Weight must be greater than 0'),
  //height: Yup.number()
    //.typeError('Height must be a number')
    //.required('Height is required')
    //.positive('Height must be greater than 0'),
});

const respondentTypes = [
  { label: 'Mother', value: 'mother' },
  { label: 'Father', value: 'father' },
  { label: 'Guardian', value: 'guardian' },
  { label: 'Other', value: 'other' },
];

const maritalStatuses = [
  { label: 'Married', value: 'married' },
  { label: 'Single', value: 'single' },
  { label: 'Living With Father', value: 'living_with_father' },
  { label: 'Living With Other', value: 'living_with_other' },
];

class RegistrationRespondentForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSubmitting: false,
      signatureSubmitted: false,
      respondentSubmitted: false,
      apiErrorMessage: '',
    };

    this.props.fetchUser();
    this.props.fetchConsent();
    this.props.resetRespondent();
  }

  componentDidMount() {
    this.scrollView.scrollTo({ y: 0 });
    if (['none', 'unknown'].includes(this.props.session.connectionType)) {
      this.setState({apiErrorMessage: 'The internet is not currently available'});
    }
  }


  shouldComponentUpdate(nextProps) {
    const user = nextProps.registration.user;
    const respondent = nextProps.registration.respondent;
    const apiRespondent = nextProps.registration.apiRespondent;
    return !user.fetching && !respondent.fetching && !apiRespondent.fetching;
  }

  componentDidUpdate(prevProps, prevState) {
    const respondent = this.props.registration.respondent;
    const isSubmitting = this.state.isSubmitting;
    if (respondent.fetched && !isEmpty(respondent.data) && isSubmitting) {
      this._saveAPIRespondent(respondent);
    }
  }

  _saveAPIRespondent = respondent => {
    const apiRespondent = this.props.registration.apiRespondent;
    const session = this.props.session;
    const { respondentSubmitted, signatureSubmitted } = this.state;
    const consent = this.props.registration.consent.data;
    if (!apiRespondent.fetching) {
      if (!apiRespondent.fetched && !respondentSubmitted) {
        this.props.apiCreateRespondent(session, respondent.data);
        this.setState({ respondentSubmitted: true });
      } else if (apiRespondent.data.id !== undefined) {
        // Upload signature image if we have respondent id
        const api_id = apiRespondent.data.id;
        this.props.updateRespondent({api_id});
        if (!signatureSubmitted) {
          this.saveSignature(api_id);
          this.setState({ signatureSubmitted: true });
        }
        const registrationState = respondent.data.pregnant
          ? ActionStates.REGISTERING_EXPECTED_DOB
          : ActionStates.REGISTERING_SUBJECT;
        this.props.updateSession({
          consent_last_version_id: consent.version_id,
          registration_state: registrationState,
        });
      } // apiRespondent.fetched
    } // apiRespondent.fetching
  };

  getInitialValues = () => {
    const session = this.props.session;
    let initialValues = {};
    if (__DEV__) {
      initialValues = {
        respondent_type: 'mother',
        address_1: '555 Test Address',
        city: 'Test City',
        state: 'IA',
        zip_code: '55555',
        home_phone: '555-555-5555',
        date_of_birth: '1981-04-01',
        drivers_license_number: '5555-5555-5555',
        marital_status: 'married',
        weight: '200',
        height: '72',
        pregnant: true,
      };
    } else {
      initialValues = {
        respondent_type: 'mother',
        address_1: '',
        city: '',
        state: 'IA',
        zip_code: '',
        home_phone: '',
        date_of_birth: '',
        drivers_license_number: '',
        marital_status: 'married',
        weight: '',
        height: '',
        pregnant: true,
      };
    }
    return initialValues;
  };

  saveSignature = async (api_id) => {
    const uri = FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY + '/signature.png';
    const signatureFile = await FileSystem.getInfoAsync(uri, {size: true});
    if (signatureFile.exists) {
      this.props.apiSaveSignature(this.props.session, api_id, uri, consent.version_id);
    } else {
      console.log('no signature available');
    } // signatureFile exists
  };

  _handleOnSubmit = values => {
    const session = this.props.session;
    const user = this.props.registration.user;
    const tos_id = Object.keys(IRBInformation)[0];
    const irb = IRBInformation[tos_id];
    const respondent = {
      ...values,
      user_id: user.data.api_id,
      email: user.data.email,
      first_name: user.data.first_name,
      last_name: user.data.last_name,
      tos_id: tos_id,
      irb_id: irb.irb_id,
      accepted_tos_at: new Date().toISOString(),
    };
    this.setState({ isSubmitting: true });
    this.props.createRespondent(respondent);
  };

  render() {
    return (
      <ScrollView
        ref={ref => this.scrollView = ref}
        keyboardShouldPersistTaps="handled"
      >
        <Formik
          onSubmit={this._handleOnSubmit}
          validationSchema={validationSchema}
          initialValues={this.getInitialValues()}
          render={props => {
            return (
              <Form>
                <Text style={AppStyles.registrationHeader}>Step 2: Update Your Profile</Text>

                <PickerInput
                  label="Relationship"
                  labelStyle={AppStyles.registrationLabel}
                  inputStyle={AppStyles.registrationPickerText}
                  prompt="Relationship"
                  name="respondent_type"
                  values={respondentTypes}
                  selectedValue={props.values.respondent_type}
                />

                <TextField
                  autoCapitalize="words"
                  inputStyle={AppStyles.registrationTextInput}
                  inputContainerStyle={AppStyles.registrationTextInputContainer}
                  label="Address 1"
                  name="address_1"
                />
                <TextField
                  autoCapitalize="words"
                  inputStyle={AppStyles.registrationTextInput}
                  inputContainerStyle={AppStyles.registrationTextInputContainer}
                  label="Address 2"
                  name="address_2"
                />
                <TextField
                  autoCapitalize="words"
                  inputStyle={AppStyles.registrationTextInput}
                  inputContainerStyle={AppStyles.registrationTextInputContainer}
                  label="City"
                  name="city"
                />
                <PickerInput
                  label="State"
                  labelStyle={AppStyles.registrationLabel}
                  inputStyle={AppStyles.registrationPickerText}
                  prompt="State"
                  name="state"
                  values={States}
                  selectedValue={props.values.state}
                />
                <TextField
                  inputStyle={AppStyles.registrationTextInput}
                  inputContainerStyle={AppStyles.registrationTextInputContainer}
                  keyboardType="number-pad"
                  label="Zip Code"
                  name="zip_code"
                  returnKeyType="done"
                />
                <TextField
                  inputStyle={AppStyles.registrationTextInput}
                  inputContainerStyle={AppStyles.registrationTextInputContainer}
                  keyboardType="phone-pad"
                  label="Home Phone"
                  name="home_phone"
                  returnKeyType="done"
                  type="tel"
                />
                <TextField
                  inputStyle={AppStyles.registrationTextInput}
                  inputContainerStyle={AppStyles.registrationTextInputContainer}
                  keyboardType="phone-pad"
                  label="Other Phone"
                  name="other_phone"
                  returnKeyType="done"
                  type="tel"
                />
                <DatePickerInput
                  label="Date of Birth"
                  labelStyle={AppStyles.registrationLabel}
                  name="date_of_birth"
                  containerStyle={AppStyles.registrationDateContainer}
                  date={props.values.date_of_birth}
                  handleChange={value =>
                    props.setFieldValue('date_of_birth', value)
                  }
                  showIcon={ false }
                  style={{ width: "100%" }}
                  customStyles={{
                    dateInput: AppStyles.registrationDateInput,
                    dateText: AppStyles.registrationDateTextInput,
                  }}
                />

                <TextField
                  inputStyle={AppStyles.registrationTextInput}
                  inputContainerStyle={AppStyles.registrationTextInputContainer}
                  label="Driver's License Number"
                  name="drivers_license_number"
                />

                <Text style={AppStyles.registrationTextHelper}>
                  We are asking for your driver's license number to help us
                  recontact you in the future in the event that your usual
                  contact information changes. This field is encouraged but
                  optional.
                </Text>

                <PickerInput
                  label="Marital Status"
                  labelStyle={AppStyles.registrationLabel}
                  inputStyle={AppStyles.registrationPickerText}
                  prompt="Marital Status"
                  name="marital_status"
                  values={maritalStatuses}
                  selectedValue={props.values.marital_status}
                />

                { false && (
                  <TextField
                    inputStyle={AppStyles.registrationTextInput}
                    inputContainerStyle={AppStyles.registrationTextInputContainer}
                    label="Weight"
                    name="weight"
                    type="text"
                    returnKeyType="done"
                    keyboardType="numeric"
                    helper="In pounds"
                  />
                )}
                { false && (
                  <TextField
                    inputStyle={AppStyles.registrationTextInput}
                    inputContainerStyle={AppStyles.registrationTextInputContainer}
                    label="Height"
                    name="height"
                    type="text"
                    returnKeyType="done"
                    keyboardType="numeric"
                    helper="In inches"
                  />
                )}

                <View style={AppStyles.registrationCheckBoxes}>
                  <Text
                    style={[
                      AppStyles.registrationLabel,
                      { marginTop: 20, marginBottom: 10 },
                    ]}
                  >
                    Are You Currently Pregnant?
                  </Text>
                  <CheckBox
                    title="Yes"
                    size={36}
                    checked={props.values.pregnant}
                    containerStyle={styles.checkboxContainer}
                    textStyle={styles.checkboxText}
                    onPress={() => props.setFieldValue('pregnant', true)}

                  />
                  <CheckBox
                    title="No"
                    size={36}
                    checked={!props.values.pregnant}
                    containerStyle={styles.checkboxContainer}
                    textStyle={styles.checkboxText}
                    onPress={() => props.setFieldValue('pregnant', false)}
                  />
                </View>

                <Text style={styles.errorMessage}>
                  {this.state.apiErrorMessage}
                </Text>

                <View style={AppStyles.registrationButtonContainer}>
                  <Button
                    title="NEXT"
                    onPress={props.submitForm}
                    buttonStyle={AppStyles.buttonSubmit}
                    titleStyle={{ fontWeight: 900 }}
                    color={Colors.darkGreen}
                    disabled={props.isSubmitting}
                  />
                </View>
              </Form>
            );
          }}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  checkboxContainer: {
    borderWidth: 0,
    margin: 0,
    padding: 0,
    backgroundColor: Colors.backgroundColor,
  },
  checkboxText: {
    fontSize: 16,
  },
  errorMessage: {
    fontSize: 16,
    margin: 20,
    textAlign: 'center',
    height: 24,
    color: Colors.errorColor,
  },
});

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});

const mapDispatchToProps = {
  fetchUser,
  fetchConsent,
  resetRespondent,
  createRespondent,
  updateRespondent,
  apiCreateRespondent,
  apiUpdateRespondent,
  apiSaveSignature,
  updateSession,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegistrationRespondentForm);

import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { Text, Button, CheckBox } from 'react-native-elements';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
      apiErrorMessage: '',
      apiRespondentSubmitted: false,
    };

    this.props.fetchUser();
    this.props.fetchConsent();
    this.props.resetRespondent();
  }

  componentDidMount() {
    const session = this.props.session;
    if (['none', 'unknown'].includes(session.connectionType)) {
      this.setState({apiErrorMessage: 'The internet is not currently available'});
    }
  }

  shouldComponentUpdate(nextProps) {
    const session = nextProps.session;
    const { user, respondent, apiRespondent } = nextProps.registration;
    return (
      !session.fetching &&
      !user.fetching &&
      !respondent.fetching &&
      !apiRespondent.fetching
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const { respondent, apiRespondent } = this.props.registration;
    const { isSubmitting, apiRespondentSubmitted } = this.state;
    if (isSubmitting && !isEmpty(respondent.data)) {
      if (!apiRespondent.fetched && !apiRespondentSubmitted) {
        this.props.apiCreateRespondent(respondent.data);
        this.setState({ apiRespondentSubmitted: true });
      }
      if (apiRespondentSubmitted) {
        const registration_state = respondent.data.pregnant
          ? ActionStates.REGISTERING_EXPECTED_DOB
          : ActionStates.REGISTERING_SUBJECT;
        this.props.updateSession({ registration_state });
      }
    }
  }

  getInitialValues = () => {
    let initialValues = {
      respondent_type: 'mother',
      address_1: '',
      city: '',
      state: 'IA',
      zip_code: '',
      home_phone: '',
      date_of_birth: '',
      drivers_license_number: '',
      marital_status: 'married',
      pregnant: true,
    };
    if (__DEV__) {
      initialValues = {
        ...initialValues,
        address_1: '555 Test Address',
        city: 'Test City',
        state: 'IA',
        zip_code: '55555',
        home_phone: '555-555-5555',
        date_of_birth: '1981-04-01',
        drivers_license_number: '5555-5555-5555',
      };
    }
    return initialValues;
  };


  handleOnSubmit = values => {
    const user = this.props.registration.user.data;
    const tos_id = Object.keys(IRBInformation)[0];
    const irb = IRBInformation[tos_id];
    const respondent = {
      ...values,
      user_id: user.api_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };

    this.props.createRespondent(respondent);
    this.setState({ isSubmitting: true });
  };

  render() {
    const { apiErrorMessage } = this.state;
    return (
      <ScrollView>
        <Formik
          onSubmit={this.handleOnSubmit}
          validationSchema={validationSchema}
          initialValues={this.getInitialValues()}
          render={props => {
            return (
              <Form>
                <Text style={AppStyles.registrationHeader}>
                  Step 2: Update Your Profile
                </Text>

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
                  We are asking for your driver&#39;s license number to help us
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

                <View style={AppStyles.registrationCheckBoxes}>
                  <Text
                    style={[
                      AppStyles.registrationLabel,
                      { marginTop: 20, marginBottom: 10 },
                    ]}
                  >
                    Are you currently pregnant with the child who will
                    participate in the study?
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

                <Text style={styles.errorMessage}>{apiErrorMessage}</Text>

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

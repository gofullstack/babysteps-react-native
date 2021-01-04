import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-elements';

import { compose } from 'recompose';
import { Formik } from 'formik';
import * as Yup from 'yup';
import withInputAutoFocus, {
  withNextInputAutoFocusForm,
  withNextInputAutoFocusInput,
} from 'react-native-formik';

import moment from 'moment';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import {
  fetchRespondent,
  resetSubject,
  createSubject,
  updateSubject,
  apiCreateSubject,
} from '../actions/registration_actions';
import { apiNewMilestoneCalendar } from '../actions/milestone_actions';
import { fetchSession, updateSession } from '../actions/session_actions';

import TextFieldWithLabel from './textFieldWithLabel';
import DatePicker from './datePickerInput';
import Picker from './pickerInput';

import Colors from '../constants/Colors';
import States from '../actions/states';
import AppStyles from '../constants/Styles';

const TextField = compose(
  withInputAutoFocus,
  withNextInputAutoFocusInput,
)(TextFieldWithLabel);
const PickerInput = compose(
  withInputAutoFocus,
)(Picker);
const DatePickerInput = compose(
  withInputAutoFocus,
)(DatePicker);

const Form = withNextInputAutoFocusForm(View, { submitAfterLastInput: false });

const validationSchema = Yup.object().shape({
  first_name: Yup.string()
    .required("Your baby's first name is required"),
  last_name: Yup.string()
    .required("Your baby's last name is required"),
  gender: Yup.string()
    .typeError("Your baby's gender is required")
    .required("Your baby's gender is required"),
  conception_method: Yup.string()
    .typeError("Please provide your baby's conception method")
    .required("Please provide your baby's conception method"),
  date_of_birth: Yup.date()
    .typeError("Your baby's date of birth must be a date")
    .required("Your baby's date of birth is required"),
});

const genders = [
  { label: 'Unknown', value: 'unknown' },
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
];

const conceptionMethods = [
  { label: 'Natural', value: 'natural' },
  { label: 'IVF', value: 'ivf' },
  { label: 'IUI', value: 'iui' },
  { label: 'ICSI', value: 'icsi' },
];

class RegistrationSubjectForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSubmitting: false,
      dobError: null,
      apiCreateSubjectSubmitted: false,
      apiNewMilestoneCalendarSubmitted: false,
    };

    this.props.resetSubject();
    this.props.fetchRespondent();
    this.props.fetchSession();
  }

  componentDidMount() {
    if (['none', 'unknown'].includes(this.props.session.connectionType)) {
      this.setState({ isSubmitting: true, dobError: 'The internet is not currently available' });
    }
  }

  shouldComponentUpdate(nextProps) {
    const respondent = nextProps.registration.respondent;
    const subject = nextProps.registration.subject;
    const apiSubject = nextProps.registration.apiSubject;
    const session = nextProps.session;

    return (
      !subject.fetching &&
      !respondent.fetching &&
      !apiSubject.fetching &&
      !session.fetching
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const subject = this.props.registration.subject;
    const isSubmitting = this.state.isSubmitting;
    if (subject.fetched && !isEmpty(subject.data) && isSubmitting) {
      this._saveAPISubject(subject);
    }
  }

  _getInitialValues = () => {
    const {
      screening_blood,
      screening_blood_other,
      screening_blood_notification,
      video_presentation,
      video_sharing,
    } = this.props.session;
    let defValues = {}
    if (__DEV__) {
      defValues = {
        date_of_birth: moment().subtract(1, 'years').format("YYYY/MM/DD"),
        first_name: 'Test',
        middle_name: 'Tester',
        last_name: 'Child',
      };
    } else {
      defValues = {
        date_of_birth: null,
        first_name: '',
        middle_name: '',
        last_name: '',
      };
    }
    const initialValues = {
      ...defValues,
      respondent_ids: null,
      gender: 'female',
      conception_method: 'natural',
      outcome: 'live_birth',
      screening_blood,
      screening_blood_other,
      screening_blood_notification,
      video_presentation,
      video_sharing,
    };
    return initialValues;
  };

  _saveAPISubject = subject => {
    const apiSubject = this.props.registration.apiSubject;
    const session = this.props.session;
    const apiCreateSubjectSubmitted = this.state.apiCreateSubjectSubmitted;
    //const auth = nextProps.registration.auth;

    if (!apiSubject.fetching) {
      if (!apiSubject.fetched && !apiCreateSubjectSubmitted) {
        this.props.apiCreateSubject(session, subject.data);
        this.setState({ apiCreateSubjectSubmitted: true });
      } else if (apiSubject.data.id !== undefined) {
        this.props.updateSubject({ api_id: apiSubject.data.id });
        if (
          !session.fetching &&
          session.registration_state !== States.REGISTERED_AS_IN_STUDY
        ) {
          if (!this.state.apiNewMilestoneCalendarSubmitted) {
            this.props.apiNewMilestoneCalendar({
              subject_id: apiSubject.data.id,
            });
            this.setState({ apiNewMilestoneCalendarSubmitted: true });
          }
          this.props.updateSession({
            registration_state: States.REGISTERED_AS_IN_STUDY,
          });
        }
      } // apiSubject fetched
    } // apiSubject fetching
  };

  render() {
    const respondent = this.props.registration.respondent;
    const {
      screening_blood,
      screening_blood_other,
      screening_blood_notification,
      video_presentation,
      video_sharing,
    } = this.props.session;
    const dobError = this.state.dobError;

    return (
      <Formik
        onSubmit={values => {
          if (values.date_of_birth) {
            const newSubject = {
              ...values,
              respondent_ids: [respondent.data.api_id],
              screening_blood,
              screening_blood_other,
              screening_blood_notification,
              video_presentation,
              video_sharing,
            };
            this.setState({ isSubmitting: true });
            this.props.createSubject(newSubject);
          } else {
            this.setState({ dobError: 'You must provide the Date of Birth' });
          }
        }}
        validationSchema={validationSchema}
        initialValues={this._getInitialValues()}
        render={props => {
          return (
            <Form>
              <Text style={AppStyles.registrationHeader}>
                Step 3: Update Your Baby&apos;s Profile
              </Text>
              <TextField
                autoCapitalize="words"
                label="First Name"
                name="first_name"
                inputStyle={AppStyles.registrationTextInput}
                inputContainerStyle={AppStyles.registrationTextInputContainer}
              />
              <TextField
                autoCapitalize="words"
                label="Middle Name"
                name="middle_name"
                inputStyle={AppStyles.registrationTextInput}
                inputContainerStyle={AppStyles.registrationTextInputContainer}
              />
              <TextField
                autoCapitalize="words"
                label="Last Name"
                name="last_name"
                inputStyle={AppStyles.registrationTextInput}
                inputContainerStyle={AppStyles.registrationTextInputContainer}
              />

              <PickerInput
                label="Gender"
                prompt="Gender"
                name="gender"
                values={genders}
                selectedValue={props.values.gender}
                labelStyle={AppStyles.registrationLabel}
                inputStyle={AppStyles.registrationPickerText}
              />

              <PickerInput
                label="Conception Method"
                prompt="Conception Method"
                name="conception_method"
                values={conceptionMethods}
                selectedValue={props.values.conception_method}
                labelStyle={AppStyles.registrationLabel}
                inputStyle={AppStyles.registrationPickerText}
              />

              <DatePickerInput
                label="Date of Birth"
                name="date_of_birth"
                containerStyle={AppStyles.registrationDateContainer}
                date={props.values.date_of_birth}
                handleChange={ value => {
                  this.setState({ dobError: null });
                  props.setFieldValue('date_of_birth', value);
                }}
                showIcon={false}
                style={{ width: '100%' }}
                customStyles={{
                  dateInput: AppStyles.registrationDateInput,
                  dateText: AppStyles.registrationTextInput,
                }}
              />

              <Text style={styles.errorText}>{dobError}</Text>

              <View style={AppStyles.registrationButtonContainer}>
                <Button
                  title="NEXT"
                  onPress={props.submitForm}
                  buttonStyle={AppStyles.buttonSubmit}
                  titleStyle={ { fontWeight: 900 } }
                  color={Colors.darkGreen}
                  disabled={this.state.isSubmitting}
                />
              </View>
            </Form>
          );
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 12,
    marginTop: -20,
    marginBottom: 20,
    color: Colors.errorColor,
  },
});

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});
const mapDispatchToProps = {
  fetchRespondent,
  resetSubject,
  createSubject,
  updateSubject,
  apiCreateSubject,
  apiNewMilestoneCalendar,
  fetchSession,
  updateSession,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegistrationSubjectForm);

import React, { Component } from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';
import { Button } from 'react-native-elements';

import { compose } from 'recompose';
import { Formik } from 'formik';
import * as Yup from 'yup';
import withInputAutoFocus, {
  withNextInputAutoFocusForm,
  withNextInputAutoFocusInput,
} from 'react-native-formik';

import { connect } from 'react-redux';
import {
  createRespondent,
  createSubject,
} from '../actions/registration_actions';
import { apiFetchMilestones } from '../actions/milestone_actions';
import { updateSession } from '../actions/session_actions';

import TextFieldWithLabel from '../components/textFieldWithLabel';
import DatePicker from './datePickerInput';

import Colors from '../constants/Colors';
import States from '../actions/states';
import AppStyles from '../constants/Styles';

const TextField = compose(
  withInputAutoFocus,
  withNextInputAutoFocusInput,
)(TextFieldWithLabel);

const DatePickerInput = compose(
  withInputAutoFocus,
  withNextInputAutoFocusInput,
)(DatePicker);

const Form = withNextInputAutoFocusForm(View, { submitAfterLastInput: false });

const validationSchema = Yup.object().shape({
  first_name: Yup.string()
    .required('Your First Name is Required'),
  last_name: Yup.string()
    .required('Your Last Name is Required'),
});

const { width } = Dimensions.get('window');
const twoButtonWidth = (width / 2) - 30;

class RegistrationNoStudyForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSubmitting: false,
      dobError: null,
      apiMilestoneCalendarSubmitted: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { isSubmitting } = this.state;
    if (isSubmitting) {
      this._fetchAPIMilestoneCalendar();
    }
  }

  _fetchAPIMilestoneCalendar = () => {
    const { apiMilestoneCalendarSubmitted } = this.state;
    if (!apiMilestoneCalendarSubmitted) {
      this.setState({ apiMilestoneCalendarSubmitted: true });
      this.props.apiFetchMilestones();
    }
    this.props.updateSession({
      registration_state: States.REGISTERED_AS_NO_STUDY,
    });
  };

  render() {
    return (
      <Formik
        onSubmit={ values => {
          if (values.expected_date_of_birth) {
            this.props.createRespondent({
              first_name: values.first_name,
              last_name: values.last_name,
              date_of_birth: values.date_of_birth,
              expected_date_of_birth: '',
            });
            this.props.createSubject({ expected_date_of_birth: values.expected_date_of_birth });
            this.setState({ isSubmitting: true });
          } else {
            this.setState({
              isSubmitting: false,
              dobError: 'You must provide the Expected Date of Birth',
            });
          }
        }}
        validationSchema={validationSchema}
        initialValues={{
          expected_date_of_birth: null,
        }}
        render={ props => {
          return (
            <Form>
              <Text style={AppStyles.registrationHeader}>
                Create Your Profile
              </Text>

              <TextField
                autoCapitalize="words"
                inputStyle={AppStyles.registrationTextInput}
                inputContainerStyle={AppStyles.registrationTextInputContainer}
                label="Your First Name"
                name="first_name"
              />

              <TextField
                autoCapitalize="words"
                inputStyle={AppStyles.registrationTextInput}
                inputContainerStyle={AppStyles.registrationTextInputContainer}
                label="Your Last Name"
                name="last_name"
              />

              <DatePickerInput
                label="Your Date of Birth"
                labelStyle={AppStyles.registrationTextLabel}
                name="date_of_birth"
                containerStyle={AppStyles.registrationDateContainer}
                date={props.values.date_of_birth}
                handleChange={value => props.setFieldValue('date_of_birth', value)}
                showIcon={ false }
                style={{ width: "100%" }}
                customStyles={{
                  dateInput: AppStyles.registrationDateInput,
                  dateText: AppStyles.registrationDateTextInput,
                }}
              />

              <DatePickerInput
                label="Your Baby's Due Date"
                labelStyle={AppStyles.registrationLabel}
                name="expected_date_of_birth"
                containerStyle={AppStyles.registrationDateContainer}
                date={props.values.expected_date_of_birth}
                handleChange={ value => {
                  this.setState({ dobError: null });
                  props.setFieldValue('expected_date_of_birth', value);
                }}
                showIcon={ false }
                style={{ width: "100%" }}
                customStyles={{
                  dateInput: AppStyles.registrationDateInput,
                  dateText: AppStyles.registrationDateTextInput,
                }}
              />

              <Text style={styles.errorText}>{this.state.dobError}</Text>

              <View style={AppStyles.registrationButtonContainer}>
                <Button
                  color={Colors.grey}
                  buttonStyle={styles.buttonOneStyle}
                  titleStyle={styles.buttonTitleStyle}
                  disabled={props.isSubmitting}
                  onPress={() => {
                    this.props.updateSession({
                      registration_state: 'none',
                    });
                  }}
                  title="Go Back"
                />
                <Button
                  buttonStyle={styles.buttonTwoStyle}
                  titleStyle={styles.buttonTitleStyle}
                  titleStyle={styles.buttonTitleStyle}
                  color={Colors.darkGreen}
                  disabled={props.isSubmitting}
                  onPress={props.submitForm}
                  title="Submit"
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

  buttonTitleStyle: {
    fontWeight: '900',
  },
  buttonOneStyle: {
    flex: 1,
    width: twoButtonWidth,
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 5,
  },
  buttonTwoStyle: {
    flex: 1,
    width: twoButtonWidth,
    backgroundColor: Colors.lightGreen,
    borderColor: Colors.green,
    borderWidth: 2,
    borderRadius: 5,
  },
  errorText: {
    fontSize: 12,
    marginTop: -20,
    marginBottom: 20,
    color: Colors.errorColor,
  },
});

const mapStateToProps = ({ registration }) => ({ registration });
const mapDispatchToProps = {
  createRespondent,
  createSubject,
  apiFetchMilestones,
  updateSession,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegistrationNoStudyForm);

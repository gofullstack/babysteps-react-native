import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-elements';

import { compose } from 'recompose';
import { Formik } from 'formik';

import withInputAutoFocus, {
  withNextInputAutoFocusForm,
  withNextInputAutoFocusInput,
} from 'react-native-formik';

import isEmpty from 'lodash/isEmpty';

import moment from 'moment';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';
import {
  resetSubject,
  createSubject,
  apiCreateSubject,
} from '../actions/registration_actions';
import { apiFetchMilestoneCalendar } from '../actions/milestone_actions';

import DatePicker from './datePickerInput';

import Colors from '../constants/Colors';
import AppStyles from '../constants/Styles';
import States from '../actions/states';

const DatePickerInput = compose(
  withInputAutoFocus,
  withNextInputAutoFocusInput,
)(DatePicker);

const Form = withNextInputAutoFocusForm(View, { submitAfterLastInput: false });

class RegistrationExpectedDOB extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSubmitting: false,
      dobError: null,
      apiSubjectSubmitted: false,
    };

    this.props.resetSubject();
  }

  componentDidMount() {
    if (['none', 'unknown'].includes(this.props.session.connectionType)) {
      this.setState({ isSubmitting: true, dobError: 'The internet is not currently available' });
    }
  }

  shouldComponentUpdate(nextProps) {
    const session = nextProps.session;
    const { respondent, subject, apiSubject } = nextProps.registration;
    return (
      !session.fetching &&
      !respondent.fetching &&
      !subject.fetching &&
      !apiSubject.fetching
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const { subject, apiSubject } = this.props.registration;
    const { calendar } = this.props.milestones;
    const {
      isSubmitting,
      apiSubjectSubmitted,
      apiFetchCalendarSubmitted,
    } = this.state;

    if (isSubmitting && !isEmpty(subject.data)) {
      if (!apiSubject.fetched && !apiSubjectSubmitted) {
        this.props.apiCreateSubject(subject.data);
        this.setState({ apiSubjectSubmitted: true });
      }
      if (!isEmpty(apiSubject.data) && !apiFetchCalendarSubmitted) {
        const subject_id = apiSubject.data.id;
        this.props.apiFetchMilestoneCalendar({ subject_id });
        this.setState({ apiFetchCalendarSubmitted: true });
      }
      if (!isEmpty(calendar.data)) {
        const registration_state = States.REGISTERED_AS_IN_STUDY;
        this.props.updateSession({ registration_state });
      }
    }
  }

  handleOnSubmit = values => {
    const { respondent, apiRespondent } = this.props.registration;
    const respondent_id = apiRespondent.data.id || respondent.data.api_id;
    const {
      screening_blood,
      screening_blood_other,
      screening_blood_notification,
      video_presentation,
      video_sharing,
    } = this.props.session;

    if (values.expected_date_of_birth) {
      const newSubject = {
        ...values,
        respondent_ids: [respondent_id],
        screening_blood,
        screening_blood_other,
        screening_blood_notification,
        video_presentation,
        video_sharing,
      };
      this.props.createSubject(newSubject);
      this.setState({ isSubmitting: true });
    } else {
      this.setState({ dobError: 'You must provide the Expected Date of Birth' });
    }
  };

  render() {
    const dobError = this.state.dobError;
    return (
      <Formik
        onSubmit={this.handleOnSubmit}
        //validationSchema={validationSchema}
        initialValues={{
          respondent_ids: null,
          gender: 'unknown',
          expected_date_of_birth: null,
          conception_method: 'natural',
        }}
        render={props => {
          return (
            <Form>
              <Text style={AppStyles.registrationHeader}>
                Step 3: Update Your Baby&apos;s Profile
              </Text>
              <DatePickerInput
                label="Your Baby's Due Date"
                labelStyle={AppStyles.registrationLabel}
                name="expected_date_of_birth"
                containerStyle={AppStyles.registrationDateContainer}
                date={props.values.expected_date_of_birth}
                handleChange={value => {
                  props.setFieldValue('expected_date_of_birth', value);
                }}
                showIcon={false}
                style={{ width: "100%" }}
                customStyles={{
                  dateInput: AppStyles.registrationDateInput,
                  dateText: AppStyles.registrationDateTextInput,
                }}
                error={props.errors.expected_date_of_birth}
              />

              <Text style={styles.errorText}>{dobError}</Text>

              <View style={AppStyles.registrationButtonContainer}>
                <Button
                  title="NEXT"
                  onPress={props.submitForm}
                  buttonStyle={AppStyles.buttonSubmit}
                  titleStyle={{ fontWeight: 900 }}
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
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    color: Colors.errorColor,
  },
});

const mapStateToProps = ({ session, registration, milestones }) => ({
  session,
  registration,
  milestones,
});

const mapDispatchToProps = {
  updateSession,
  resetSubject,
  createSubject,
  apiCreateSubject,
  apiFetchMilestoneCalendar,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegistrationExpectedDOB);

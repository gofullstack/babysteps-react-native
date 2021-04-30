import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Button } from 'react-native-elements';
import { StackActions } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import find from 'lodash/find';

import { compose } from 'recompose';
import { Formik } from 'formik';
import * as Yup from 'yup';
import withInputAutoFocus, {
  withTouched,
  withNextInputAutoFocusForm,
  withNextInputAutoFocusInput,
} from 'react-native-formik';

import { connect } from 'react-redux';
import {
  resetSubject,
  updateSubject,
  apiUpdateSubject,
} from '../actions/registration_actions';
import {
  resetMilestoneCalendar,
  fetchMilestoneCalendar,
  apiFetchMilestoneCalendar,
} from '../actions/milestone_actions';
import { deleteAllNotifications } from '../actions/notification_actions';
import { updateSession } from '../actions/session_actions';

import TextFieldWithLabel from '../components/textFieldWithLabel';
import DatePicker from '../components/datePickerInput';
import PickerInput from '../components/pickerInput';

import Colors from '../constants/Colors';
import AppStyles from '../constants/Styles';
import CONSTANTS from '../constants';
import States from '../actions/states';

const TextField = compose(
  withInputAutoFocus,
  withTouched,
  withNextInputAutoFocusInput,
)(TextFieldWithLabel);
const PickerInputField = compose(
  withInputAutoFocus,
  withTouched,
)(PickerInput);
const DatePickerInput = compose(
  withInputAutoFocus,
  withNextInputAutoFocusInput,
)(DatePicker);

const Form = withNextInputAutoFocusForm(View, { submitAfterLastInput: false });

const validationSchema = Yup.object().shape({
  outcome: Yup.string()
    .typeError('Outcome of your pregnancy is required')
    .required('Outcome of your pregnancy is required'),
  first_name: Yup.string().when('outcome', {
    is: 'live_birth',
    then: Yup.string().required("Your baby's first name is required"),
  }),
  last_name: Yup.string().when('outcome', {
    is: 'live_birth',
    then: Yup.string().required("Your baby's last name is required"),
  }),
  gender: Yup.string().when('outcome', {
    is: 'live_birth',
    then: Yup.string()
      .typeError("Your baby's gender is required")
      .required("Your baby's gender is required"),
    //.matches(/(male|female)/, "You must select a gender"),
  }),
  conception_method: Yup.string().when('outcome', {
    is: 'live_birth',
    then: Yup.string()
      .typeError("Please provide your baby's conception method")
      .required("Please provide your baby's conception method"),
  }),
});

const outcomes = [
  { label: 'Live Birth', value: 'live_birth' },
  { label: 'Miscarriage', value: 'miscarriage' },
  { label: 'Still Birth', value: 'still_birth' },
];

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

const { width, height } = Dimensions.get('window');
const twoButtonWidth = (width / 2) - 30;

class OverviewBirthFormScreen extends Component {
  static navigationOptions = {
    title: "Baby Profile",
  };

  constructor(props) {
    super(props);

    this.state = {
      outcomeIsLiveBirth: true,
      outcome: 'live_birth',
      dateError: null,
      values: {},
      submittedSave: false,
      submittedApiUpdateSubject: false,
      submittedFetchMilestoneCalendar: false,
      submittedApiFetchMilestoneCalendar: false,
    };

    this.props.resetSubject();
    this.props.resetMilestoneCalendar();
  }

  shouldComponentUpdate(nextProps) {
    const subject = nextProps.registration.subject;
    const apiSubject = nextProps.registration.apiSubject;
    const calendar = nextProps.milestones.calendar;
    const apiCalendar = nextProps.milestones.api_calendar;
    return (
      !subject.fetching &&
      !apiSubject.fetching &&
      !calendar.fetching &&
      !apiCalendar.fetching
    );
  }

  componentDidUpdate(prevProps, prevState) {
    // incrementally save and update environs
    const submittedSave = this.state.submittedSave;
    if (submittedSave) {
      const session = this.props.session;
      const subject = this.props.registration.subject;
      const inStudy = session.registration_state === States.REGISTERED_AS_IN_STUDY;
      const outcomeIsLiveBirth = this.state.outcomeIsLiveBirth;
      if (!subject.fetching && subject.fetched) {
        if (inStudy && subject.data.api_id) {
          this._handleUpdateInStudyCalendar(outcomeIsLiveBirth);
        } else {
          this._handleUpdateNoStudyCalendar(outcomeIsLiveBirth);
        }
        this._handleUpdateNotification(outcomeIsLiveBirth);
        this.props.navigation.navigate('Overview');
      } // subject.fetching
    } // submittedSave
  }

  _handleUpdateNoStudyCalendar = outcomeIsLiveBirth => {
    const apiCalendar = this.props.milestones.api_calendar;
    const base_date = this.state.values.date_of_birth;
    const study_id = CONSTANTS.STUDY_ID;
    if (outcomeIsLiveBirth) {
      if (!this.state.submittedApiFetchMilestoneCalendar) {
        this.props.apiFetchMilestoneCalendar({ study_id, base_date });
        this.setState({ submittedApiFetchMilestoneCalendar: true });
      } else if (!apiCalendar.fetching && apiCalendar.fetched) {
        if (!this.state.submittedFetchMilestoneCalendar) {
          this.props.fetchMilestoneCalendar();
          this.setState({ submittedFetchMilestoneCalendar: true });
        } // submittedFetchMilestoneCalendar
      } // submittedApiMilestoneCalendar
    } // outcome is live birth
  };

  _handleUpdateInStudyCalendar = outcomeIsLiveBirth => {
    const session = this.props.session;
    const apiSubject = this.props.registration.apiSubject;
    const apiCalendar = this.props.milestones.api_calendar;
    const subject_id = this.props.registration.subject.data.api_id;
    const study_id = CONSTANTS.STUDY_ID;
    const values = this.state.values;
    const data = {...values, api_id: subject.data.api_id}

    if (!this.state.submittedApiUpdateSubject) {
      this.props.apiUpdateSubject(session, study_id, data);
      this.setState({ submittedApiUpdateSubject: true });
    } else if (!apiSubject.fetching && apiSubject.fetched) {
      if (!this.state.submittedApiFetchMilestoneCalendar) {
        // update api calendar
        this.props.apiFetchMilestoneCalendar({ study_id, subject_id });
        this.setState({ submittedApiFetchMilestoneCalendar: true });
      } else if (
        !apiCalendar.fetching && apiCalendar.fetched &&
        !this.state.submittedFetchMilestoneCalendar
      ) {
        this.props.fetchMilestoneCalendar();
        this.setState({ submittedFetchMilestoneCalendar: true });
      } // submittedApiMilestoneCalendar
    }
  };

  _handleUpdateNotification = outcomeIsLiveBirth => {
    const calendar = this.this.props.milestones.calendar;
    if (outcomeIsLiveBirth) {
      if (
        this.state.submittedFetchMilestoneCalendar &&
        !calendar.fetching && calendar.fetched
      ) {
        // trigger generation of notifications and set period
        this.props.updateSession({ notifications_updated_at: '', notification_period: 'post_birth' });
        // reset navigation stack
        this.props.navigation.dispatch(StackActions.popToTop());
        // go to birth questionaire
        const task = find(this.props.milestones.tasks.data, ['id', CONSTANTS.TASK_BIRTH_QUESTIONAIRE_ID]);
        this.props.navigation.navigate('MilestoneQuestions', { task });
      } // calandar.fetched
    } else {
      this.props.deleteAllNotifications();
      this.props.updateSession({ notification_period: 'no_birth' });
    } // outcome is live birth
  };

  _handleOutcomeChange = value => {
    this.node.setFieldValue('outcome', value);
    if (value === 'live_birth') {
      this.setState({ outcomeIsLiveBirth: true, outcome: value });
      this.node.setFieldValue('date_of_loss', '');
    } else {
      this.setState({ outcomeIsLiveBirth: false, outcome: value });
      this.node.setFieldValue('date_of_birth', '');
    }
  };

  _onSubmit = values => {
    if (values.outcome === 'live_birth') {
      if (!values.date_of_birth) {
        this.setState({ dateError: 'Please provide the Date of Birth' });
        return null;
      }
    } else if (!values.date_of_loss) {
      this.setState({ dateError: 'Please provide the Date of Loss' });
      return null;
    }
    this.setState({ values, submittedSave: true });
    this.props.updateSubject(values);
  };

  render() {
    const subject = this.props.registration.subject.data;
    const dateError = this.state.dateError;
    const outcomeIsLiveBirth = this.state.outcomeIsLiveBirth;
    const submittedSave = this.state.submittedSave
    const dateLabel = find(outcomes, ['value', this.state.outcome]);
    return (
      <KeyboardAwareScrollView
        ref={ref => this.scrollView = ref}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        <Formik
          ref={ref => (this.node = ref)}
          onSubmit={values => this._onSubmit(values)}
          validationSchema={validationSchema}
          initialValues={{
            api_id: subject.api_id,
            outcome: 'live_birth',
            gender: subject.gender,
            date_of_birth: new Date().toISOString(),
            conception_method: subject.conception_method,
            last_name: '',
            middle_name: '',
            first_name: '',
          }}
          render={props => {
            return (
              <Form>
                <Text style={AppStyles.registrationHeader}>
                  Update Your Baby&apos;s Profile
                </Text>

                <PickerInputField
                  label="Outcome of Your Pregnancy"
                  prompt="Outcome"
                  name="outcome"
                  values={outcomes}
                  selectedValue={props.values.outcome}
                  onChangeText={value => this._handleOutcomeChange(value)}
                  labelStyle={AppStyles.registrationLabel}
                  inputStyle={AppStyles.registrationPickerText}
                />

                {outcomeIsLiveBirth && (
                  <View>
                    <DatePickerInput
                      label="Date of Birth"
                      labelStyle={AppStyles.registrationLabel}
                      name="date_of_birth"
                      containerStyle={AppStyles.registrationDateContainer}
                      date={props.values.date_of_birth}
                      handleChange={value => {
                        this.setState({ dateError: null });
                        props.setFieldValue('date_of_birth', value);
                      }}
                      showIcon={false}
                      style={{ width: '100%' }}
                      customStyles={{
                        dateInput: AppStyles.registrationDateInput,
                        dateText: AppStyles.registrationTextInput,
                      }}
                    />
                    <Text style={styles.errorText}>{dateError}</Text>

                    <PickerInputField
                      label="Conception Method"
                      prompt="Conception Method"
                      name="conception_method"
                      values={conceptionMethods}
                      selectedValue={props.values.conception_method}
                      labelStyle={AppStyles.registrationLabel}
                      inputStyle={AppStyles.registrationPickerText}
                    />

                    <PickerInputField
                      label="Gender"
                      prompt="Gender"
                      name="gender"
                      values={genders}
                      selectedValue={props.values.gender}
                      labelStyle={AppStyles.registrationLabel}
                      inputStyle={AppStyles.registrationPickerText}
                    />

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
                  </View>
                )}

                {!outcomeIsLiveBirth && (
                  <View>
                    <DatePickerInput
                      label={`Date of ${dateLabel.label}`}
                      labelStyle={AppStyles.registrationLabel}
                      name="date_of_loss"
                      containerStyle={AppStyles.registrationDateContainer}
                      date={props.values.date_of_loss}
                      handleChange={value => {
                        this.setState({ dateError: null });
                        props.setFieldValue('date_of_loss', value);
                      }}
                      showIcon={false}
                      style={{ width: '100%' }}
                      customStyles={{
                        dateInput: AppStyles.registrationDateInput,
                        dateText: AppStyles.registrationTextInput,
                      }}
                    />
                    <Text style={styles.errorText}>{dateError}</Text>
                    <Text style={styles.notLiveBirthText}>
                      We&apos;re so sorry to hear of your loss. We appreciate
                      the contribution you have made to BabySteps.
                    </Text>
                  </View>
                )}

                <View style={AppStyles.registrationButtonContainer}>
                  <Button
                    color={Colors.grey}
                    buttonStyle={styles.buttonOneStyle}
                    titleStyle={styles.buttonTitleStyle}
                    onPress={() => this.props.navigation.navigate('Overview')}
                    disable={submittedSave}
                    title="CANCEL"
                  />
                  <Button
                    color={Colors.pink}
                    buttonStyle={styles.buttonTwoStyle}
                    titleStyle={styles.buttonTitleStyle}
                    onPress={props.submitForm}
                    disable={submittedSave}
                    title="SAVE"
                  />
                </View>
                {submittedSave && (
                  <View style={styles.submittedSave}>
                    <ActivityIndicator size="large" color={Colors.tint} />
                  </View>
                )}
              </Form>
            );
          }}
        />
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 14,
    marginTop: -5,
    marginBottom: 20,
    marginLeft: 20,
    color: Colors.errorColor,
  },
  notLiveBirthText: {
    fontSize: 16,
    margin: 30,
  },
  buttonTitleStyle: {
    fontWeight: '900',
  },
  buttonOneStyle: {
    flex: 1,
    width: twoButtonWidth,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 5,
  },
  buttonTwoStyle: {
    flex: 1,
    width: twoButtonWidth,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
  },
  submittedSave: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = ({ session, registration, milestones }) => ({
  session,
  registration,
  milestones,
});
const mapDispatchToProps = {
  resetSubject,
  updateSubject,
  apiUpdateSubject,
  resetMilestoneCalendar,
  fetchMilestoneCalendar,
  apiFetchMilestoneCalendar,
  deleteAllNotifications,
  updateSession,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OverviewBirthFormScreen);

import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-elements';

import get from 'lodash/get';

import { compose } from 'recompose';
import { Formik } from 'formik';
import * as Yup from 'yup';
import withInputAutoFocus, {
  withNextInputAutoFocusForm,
  withNextInputAutoFocusInput,
} from 'react-native-formik';

import { connect } from 'react-redux';
import {
  createUser,
  fetchUser,
  apiCreateUser,
} from '../actions/registration_actions';
import { updateSession } from '../actions/session_actions';

import TextFieldWithLabel from './textFieldWithLabel';

import SyncMilestones from '../database/sync_milestones';

import CONSTANTS from '../constants';
import Colors from '../constants/Colors';
import States from '../actions/states';
import AppStyles from '../constants/Styles';

const TextField = compose(
  withInputAutoFocus,
  withNextInputAutoFocusInput,
)(TextFieldWithLabel);

const Form = withNextInputAutoFocusForm(View, { submitAfterLastInput: false });

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email Address is Required')
    .email('Not a Valid Email Address'),
  password: Yup.string()
    .required('Password is Required')
    .min(8, 'Password must be at Least 8 Characters'),
  first_name: Yup.string().required('First Name is Required'),
  last_name: Yup.string().required('Last Name is Required'),
});

class RegistrationUserForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSubmitting: false,
      createUserSubmitted: false,
      apiErrorMessage: '',
      user_registration_complete: false,
    };
  }

  componentDidMount() {
    const session = this.props.session;
    if (['none', 'unknown'].includes(session.connectionType)) {
      this.setState({
        isSubmitting: true,
        apiErrorMessage: 'The internet is not currently available',
        sessionSubmitted: false,
        userSubmitted: false,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const session = nextProps.session;
    const { user, apiUser } = nextProps.registration;

    return !session.fetching && !apiUser.fetching && !user.fetching;
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    const { auth, user, apiUser } = this.props.registration;
    const { isSubmitting, sessionSubmitted, userSubmitted } = this.state;
    if (isSubmitting) {
      if (apiUser.error) {
        const apiErrorMessage = apiUser.error;
        this.setState({ isSubmitting: false, apiErrorMessage });
        return;
      }
      if (apiUser.fetched) {
        if (!session.fetched && !sessionSubmitted) {
          this.props.updateSession({
            access_token: auth.accessToken,
            client: auth.client,
            uid: auth.uid,
            user_id: auth.user_id,
            email: apiUser.data.email,
            password: apiUser.data.password,
            uid: apiUser.data.email,
          });
          this.setState({ sessionSubmitted: true });
        }
        if (!user.fetched && !userSubmitted) {
          this.props.createUser({
            ...apiUser.data,
            api_id: auth.user_id,
          });
          this.setState({ userSubmitted: true });
        }
        if (userSubmitted) {
          const registration_state = States.REGISTERING_RESPONDENT;
          this.props.updateSession({ registration_state });
          SyncMilestones(CONSTANTS.STUDY_ID, session.milestones_last_updated_at);
        }
      } // apiUser.fetched
    } // isSubmitting
  }

  _getInitialValues = () => {
    //return {};
    let initialValues = {};
    if (__DEV__) {
      initialValues = {
        first_name: 'Test',
        last_name: 'Tester',
        email: 'test+' + Date.now() + '@gmail.com',
        password: 'test1234',
      };
    } else {
      initialValues = {
        first_name: '',
        last_name: '',
        email: '',
        password: '',
      };
    }
    return initialValues;
  };

  handlePress = (props) => {
    this.setState({ isSubmitting: true, apiErrorMessage: '' });
    props.submitForm();
  };

  handleSignInOnPress = () => {
    const { navigate } = this.props.navigation;
    navigate('SignIn');
  };

  render() {
    const apiUser = this.props.registration.apiUser;
    return (
      <Formik
        onSubmit={values => {
          values.uid = values.email;
          this.props.apiCreateUser(values);
        }}
        initialValues={this._getInitialValues()}
        validationSchema={validationSchema}
        render={props => {
          return (
            <Form>
              <Text style={AppStyles.registrationHeader}>
                Step 1: Create an Account
              </Text>
              <Button
                title="Already created an account? Sign In"
                onPress={() => this.handleSignInOnPress()}
                buttonStyle={styles.signInButton}
                titleStyle={{ fontWeight: 900 }}
                color={Colors.red}
              />
              <TextField
                autoCapitalize="words"
                label="First Name"
                name="first_name"
                type="name"
                inputStyle={AppStyles.registrationTextInput}
                inputContainerStyle={AppStyles.registrationTextInputContainer}
              />
              <TextField
                autoCapitalize="words"
                label="Last Name"
                name="last_name"
                type="name"
                inputStyle={AppStyles.registrationTextInput}
                inputContainerStyle={AppStyles.registrationTextInputContainer}
              />
              <TextField
                keyboardType="email-address"
                label="Email"
                name="email"
                type="email"
                inputStyle={AppStyles.registrationTextInput}
                inputContainerStyle={AppStyles.registrationTextInputContainer}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                inputStyle={AppStyles.registrationTextInput}
                inputContainerStyle={AppStyles.registrationTextInputContainer}
              />

              <Text style={styles.errorMessage}>
                {this.state.apiErrorMessage}
              </Text>

              <View style={AppStyles.registrationButtonContainer}>
                <Button
                  title="NEXT"
                  onPress={() => this.handlePress(props)}
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
  errorMessage: {
    fontSize: 16,
    margin: 20,
    textAlign: 'center',
    height: 24,
    color: Colors.errorColor,
  },
  signInButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.grey,
    borderWidth: 1,
    borderRadius: 5,
  },
});

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});
const mapDispatchToProps = {
  createUser,
  fetchUser,
  apiCreateUser,
  updateSession,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegistrationUserForm);

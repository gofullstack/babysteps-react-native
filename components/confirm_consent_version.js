import React, { Component } from 'react';
import { AppState } from 'react-native';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';
import { fetchConsent } from '../actions/registration_actions';

import States from '../actions/states';

class ConfirmConsentVersion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appState: AppState.currentState,
    };

    this.props.fetchConsent();
  }

  componentDidMount() {
    console.log('*** Check Update Consent Version Confirmation');
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  shouldComponentUpdate(nextProps) {
    const session = nextProps.session;
    const { consent } = nextProps.registration;
    return (
      !session.fetching &&
      !consent.fetching &&
      !isEmpty(consent.data) &&
      session.registration_state === States.REGISTERED_AS_IN_STUDY
    );
  }

  componentDidUpdate() {
    const session = this.props.session;
    const consent = this.props.registration.consent.data;
    if (
      session.consent_last_version_id !== consent.version_id &&
      consent.update_confirmation_type === 'update_signature'
    ) {
      const registration_state = States.REGISTERING_UPDATE_CONSENT;
      this.props.updateSession({ registration_state });
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    const { appState } = this.state;
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      this.setState({
        appState: nextAppState,
        ConsentVersionConfirmed: false,
      });
    } else {
      this.setState({ appState: nextAppState });
    }
  };

  render() {
    return null;
  }
}

const mapStateToProps = ({
  session,
  registration,
}) => ({
  session,
  registration,
});

const mapDispatchToProps = { updateSession, fetchConsent };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfirmConsentVersion);

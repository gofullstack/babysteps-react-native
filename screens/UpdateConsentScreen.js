import React, { Component } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

import { Button, Text } from 'react-native-elements';

import { connect } from 'react-redux';

import {
  fetchConsent,
} from '../actions/registration_actions';

import ConsentDisclosureVersion from '../components/consent_disclosure_version';

import States from '../actions/states';
import Colors from '../constants/Colors';
import AppStyles from '../constants/Styles';

class UpdateConsentScreen extends Component {
  static navigationOptions = {
    title: 'Update Consent Signature',
  };

  constructor(props) {
    super(props);

    this.state = {
      
    };

    
  }

  render() {
    return (
      <ConsentDisclosureVersion 
        showSignature={true}
        hideButton={true}
        navigation={this.props.navigation}
      />
    );
  }
}

const styles = StyleSheet.create({

});

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});

const mapDispatchToProps = {
  fetchConsent,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UpdateConsentScreen);
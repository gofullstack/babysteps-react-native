import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';

import ConsentEligibilityForm from '../components/consent_eligibility_form';
import ConsentSummaryVersion from '../components/consent_summary_version';
import ConsentDisclosureVersion from '../components/consent_disclosure_version';
import ConsentSignatureForm from '../components/consent_signature_form';

import States from '../actions/states';
import Colors from '../constants/Colors';

class ConsentScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: 'Consent',
      headerTitleStyle: {
        textAlign: "center",
        flex: 1,
        marginLeft: -30,
      },
      headerLeft: (
        <TouchableOpacity
          style={{ marginLeft: 15 }}
          onPress={ () => {params.resetForm()} }
        >
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
            size={26}
            color={Colors.white}
          />
        </TouchableOpacity>
      ),
    };
  };


  componentDidMount() {
    this.props.navigation.setParams({ resetForm: this.resetForm });
  }

  resetForm = () => {
    const { registration_state } = this.props.session;
    switch (registration_state) {
      case States.REGISTERING_SIGNATURE: {
        this.props.updateSession({ registration_state: States.REGISTERING_FULL_CONSENT });
        break;
      }
      case States.REGISTERING_FULL_CONSENT: {
        this.props.updateSession({ registration_state: States.REGISTERING_AS_ELIGIBLE });
        break;
      }
      case States.REGISTERING_AS_ELIGIBLE: {
        this.props.updateSession({ registration_state: 'none' });
        break;
      }
    };
  };

  selectForm = () => {
    const registration_state = this.props.session.registration_state;

    if (registration_state === States.REGISTERING_ELIGIBILITY) {
      return <ConsentEligibilityForm />;
    }
    if (registration_state === States.REGISTERING_AS_ELIGIBLE) {
      return <ConsentSummaryVersion />;
    }
    if (registration_state === States.REGISTERING_FULL_CONSENT) {
      return <ConsentDisclosureVersion />;
    }
    if (registration_state === States.REGISTERING_SIGNATURE) {
      return <ConsentSignatureForm />;
    }
  };

  render() {
    return <View style={styles.container}>{this.selectForm()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
});

const mapStateToProps = ({ session }) => ({ session });

const mapDispatchToProps = { updateSession };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsentScreen);

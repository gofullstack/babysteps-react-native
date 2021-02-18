import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Button } from 'react-native-elements';
import * as FileSystem from 'expo-file-system';

import moment from 'moment';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';

import ConsentDisclosureContent001 from './consent_disclosure_content_001';
import ConsentDisclosureContent002 from './consent_disclosure_content_002';
import ConsentDisclosureContent003 from './consent_disclosure_content_003';

import IRBInformation from '../constants/IRB';
import States from '../actions/states';
import Colors from '../constants/Colors';
import CONSTANTS from '../constants';

const { width } = Dimensions.get('window');
const oneButtonWidth = width - 100;

const widthOffset = 60;

const signatureWidth = width - (widthOffset * 2);
const signatureHeight = signatureWidth * 0.4;

const components = {
  '001': ConsentDisclosureContent001,
  '002': ConsentDisclosureContent002,
  '003': ConsentDisclosureContent003,
};

class ConsentDisclosureContent extends Component {

  constructor(props) {
    super(props);

    const screening_blood =
      ['null', null, undefined].includes(this.props.screening_blood) ? null : !!this.props.screening_blood;
    const screening_blood_other =
      ['null', null, undefined].includes(this.props.screening_blood_other) ? null : !!this.props.screening_blood_other;
    const screening_blood_notification =
      ['null', null, undefined].includes(this.props.screening_blood_notification) ? null : !!this.props.screening_blood_notification;
    const video_sharing =
      ['null', null, undefined].includes(this.props.video_sharing) ? null : this.props.video_sharing;
      const video_presentation =
      ['null', null, undefined].includes(this.props.video_presentation) ? null : this.props.video_presentation;
    this.state = {
      screening_blood: screening_blood,
      screening_blood_other: screening_blood_other,
      screening_blood_notification: screening_blood_notification,
      video_sharing: video_sharing,
      video_presentation: video_presentation,
      scrollOffset: 800,
    };
  }

  handleSubmit = action => {
    const {
      screening_blood,
      screening_blood_notification,
      screening_blood_other,
      video_sharing,
      video_presentation,
    } = this.state;

    const registration_state =
      action === 'agree'
        ? States.REGISTERING_SIGNATURE
        : States.REGISTERING_AS_NO_STUDY;
    this.props.updateSession({
      screening_blood,
      screening_blood_other,
      screening_blood_notification,
      video_sharing,
      video_presentation,
      registration_state,
    });
  };

  handleConsentPermissions = (attribute, response) => {
    this.setState({ [attribute]: response });
  };

  renderButton = () => {
    if (this.props.formState === 'edit') {
      const irb = IRBInformation[this.props.tosID];
      const irbExpired = moment() > moment(irb.expiration_date, "MM/DD/YYYY");
      if (irbExpired) {
        return (
          <View style={styles.buttonContainer}>
            <Text style={styles.expired}>
              This Disclosure has EXPIRED as of: {irb.expiration_date}.
            </Text>
            <Button
              title="REGISTER WITH NO STUDY"
              onPress={() => this.handleSubmit('no_study')}
              color={Colors.pink}
              buttonStyle={[styles.buttonNext, {marginBottom: 10}]}
              titleStyle={styles.buttonNextTitle}
            />
            <Button
              title="REGISTER ANYWAY"
              onPress={() => this.handleSubmit('agree')}
              color={Colors.pink}
              buttonStyle={styles.buttonNext}
              titleStyle={styles.buttonNextTitle}
            />
          </View>
        );
      }
      return (
        <View style={styles.buttonContainer}>
          <Text style={styles.expires}>
            This Disclosure expires: {irb.expiration_date}.
          </Text>
          <Button
            title="AGREE"
            onPress={() => this.handleSubmit('agree')}
            color={Colors.pink}
            buttonStyle={styles.buttonNext}
            titleStyle={styles.buttonNextTitle}
          />
        </View>
      );
    }
    return (
      <View style={[styles.buttonContainer, {marginLeft: 15, marginBottom: 60}]}>
        <Button
          title="RETURN"
          onPress={() => this.props.setModalVisible(false)}
          color={Colors.pink}
          buttonStyle={styles.buttonNext}
          titleStyle={styles.buttonNextTitle}
        />
      </View>
    );
  };

  renderSignature = () => {
    if (this.props.formState === 'view') {
      const signatureDir = FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY;
      const fileName = signatureDir + '/signature.png';
      return (
        <View style={{ flex: 1, justifyContent: 'center', marginLeft: widthOffset, marginBottom: 20}}>
          <Text>Signature</Text>
          <Image
            source={{ uri: fileName }}
            width={signatureWidth}
            style={{ height: signatureHeight }}
            resizeMode="cover"
          />
        </View>
      );
    }
    return null;
  };

  render() {
    const { formState, tosID } = this.props;
    const {
      screening_blood,
      screening_blood_other,
      screening_blood_notification,
      video_sharing,
      video_presentation,
    } = this.state;
    let ConsentDisclosureVersion = components[tosID];

    return (
      <ScrollView
        contentContainerStyle={styles.scrollView}
        ref={ref => (this._scrollView = ref)}
      >
        <ConsentDisclosureVersion
          screening_blood={screening_blood}
          screening_blood_other={screening_blood_other}
          screening_blood_notification={screening_blood_notification}
          video_presentation={video_presentation}
          video_sharing={video_sharing}
          formState={formState}
          handleConsentPermissions={(attribute, response) =>
            this.handleConsentPermissions(attribute, response)
          }
        />
        {this.renderSignature()}
        {this.renderButton()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  expires: {
    fontSize: 14,
    padding: 10,
    justifyContent: 'center',
    textAlign: 'center',
    color: Colors.darkGrey,
  },
  expired: {
    fontSize: 14,
    padding: 10,
    justifyContent: 'center',
    textAlign: 'center',
    color: Colors.errorColor,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonNext: {
    width: oneButtonWidth,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
    alignSelf: 'center',
  },
  buttonNextTitle: {
    fontWeight: '900',
  },
});

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});
const mapDispatchToProps = { updateSession };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsentDisclosureContent);

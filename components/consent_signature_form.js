import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Button, CheckBox } from 'react-native-elements';

import * as FileSystem from 'expo-file-system';
import ExpoPixi from 'expo-pixi';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';
import { apiUpdateRespondent } from '../actions/registration_actions';

import Colors from '../constants/Colors';
import States from '../actions/states';
import CONSTANTS from '../constants';

const { width } = Dimensions.get('window');
const twoButtonWidth = (width / 2) - 40;

class ConsentSignatureForm extends Component {
  constructor(props) {
    super(props);

    const session = this.props.session;
    const screening_blood =
      ['null', null].includes(session.screening_blood) ? true : !!session.screening_blood;
    const screening_blood_other =
      ['null', null].includes(session.screening_blood_other) ? true : !!session.screening_blood_other;
    const screening_blood_notification =
      ['null', null].includes(session.screening_blood_notification) ? true : !!session.screening_blood_notification;
    const video_presentation = 
      ['null', null].includes(session.video_presentation) ? 'yes_study_presentations' : !!session.video_presentation;
    const video_sharing = 
      ['null', null].includes(session.video_sharing) ? 'yes_other_researchers' : !!session.video_sharing;

    const remoteDebug = (typeof DedicatedWorkerGlobalScope) !== 'undefined';

    this.state = {
      screening_blood,
      screening_blood_other,
      screening_blood_notification,
      video_presentation,
      video_sharing,
      errorMessage: null,
      remoteDebug,
      scrollEnabled: true,
    };
  }

  handleReset = () => {
    const remoteDebug = this.state.remoteDebug;
    console.log('signature clear');
    if (!remoteDebug) {
      this.signature.clear();
    }
  };

  handleConsentPermissions = (attribute, response) => {
    this.setState({ [attribute]: response });
  };

  handleNestedScrollEvent = scrollEnabled => {
    this.setState({ scrollEnabled });
  };

  handleSubmit = async () => {
    const session = this.props.session;
    const remoteDebug = this.state.remoteDebug;
    let image = null;
    if (!remoteDebug) {
      image = await this.signature.takeSnapshotAsync({
        format: 'png',
        quality: 0.8,
        result: 'file',
      });
    }
    const signatureDir =
      FileSystem.documentDirectory + CONSTANTS.SIGNATURE_DIRECTORY;
    const resultDir = await FileSystem.getInfoAsync(signatureDir);

    if (resultDir.exists) {
      const uri = signatureDir + '/signature.png';
      if (!remoteDebug) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        await FileSystem.copyAsync({ from: image.uri, to: uri });
      }
      const resultFile = await FileSystem.getInfoAsync(uri);

      if (remoteDebug || resultFile.exists) {
        const {
          screening_blood,
          screening_blood_notification,
          screening_blood_other,
          video_sharing,
          video_presentation,
        } = this.state;
        if (
          [
            screening_blood,
            screening_blood_notification,
            screening_blood_other,
            video_sharing,
            video_presentation,
          ].includes(null)
        ) {
          this.setState({
            errorMessage: 'You must answer all the questions.',
          });
          return;
        }

        let registration_state = States.REGISTERING_USER;
        // check to see if already logged in
        if (!isEmpty(session.email)) {
          registration_state = States.REGISTERING_RESPONDENT;
        }

        this.props.updateSession({
          screening_blood,
          screening_blood_other,
          screening_blood_notification,
          video_sharing,
          video_presentation,
          registration_state,
        });
      } else {
        const errorMessage = 'Error: file not saved - ' + resultFile;
        this.setState({ errorMessage });
      }
    } else {
      const errorMessage = 'Error: no directory - ' + resultDir;
      this.setState({ errorMessage });
    }
  };

  render() {
    // GLView won't run with remote debugging running.  Shut off remote debugging or you will get a Can't Find Property 0 error message.

    const {
      screening_blood,
      screening_blood_notification,
      screening_blood_other,
      video_presentation,
      video_sharing,
      remoteDebug,
      scrollEnabled,
    } = this.state;

    return (
      <ScrollView
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.scrollView}
      >
        <View>
          <Text style={styles.explanation}>Please confirm your answers and sign below.</Text>
        </View>

        <View style={styles.checkboxView}>
          <Text style={styles.header}>
            The tests we might want to use to study your child’s blood samples
            may not even exist at this time. Therefore, we are asking for your
            permission to store your child’s blood samples so that we can study
            them in the future. Please indicate Yes or No below:
          </Text>

          <CheckBox
            title="Yes, my child’s blood samples may be stored/shared for future gene
            research in Autism and other developmental disorders."
            textStyle={styles.checkboxText}
            checked={screening_blood === true}
            onPress={() =>
              this.handleConsentPermissions('screening_blood', true)
            }
          />

          <CheckBox
            title="No, my child’s blood samples may NOT be stored/shared for future gene
            research in Autism and other developmental disorders."
            textStyle={styles.checkboxText}
            checked={screening_blood === false}
            onPress={() =>
              this.handleConsentPermissions('screening_blood', false)
            }
          />

          <Text style={styles.header}>
            We might want to use your child’s blood samples for other research.
            Therefore, we are asking for your permission to store your child’s
            blood samples so that we might use them in the future. Please
            indicate Yes or No below:
          </Text>

          <CheckBox
            title="Yes, my child’s blood samples may be stored/shared for future research
            for any other purpose."
            textStyle={styles.checkboxText}
            checked={screening_blood_other === true}
            onPress={() =>
              this.handleConsentPermissions('screening_blood_other', true)
            }
          />

          <CheckBox
            title="No, my child’s blood samples may NOT be stored/shared for future research
            for any other purpose."
            textStyle={styles.checkboxText}
            checked={screening_blood_other === false}
            onPress={() =>
              this.handleConsentPermissions('screening_blood_other', false)
            }
          />
        </View>

        <View style={styles.checkboxView}>
          <Text style={styles.header}>
            In the event of unexpected findings, data will be reviewed by a
            physician who normally reads such results. We can provide you with
            this information so that you may discuss it with your/your child’s
            primary care physician. Please select one of the following options:
          </Text>

          <CheckBox
            title="Yes, I want to be provided with this information."
            textStyle={styles.checkboxText}
            checked={screening_blood_notification === true}
            onPress={() =>
              this.handleConsentPermissions('screening_blood_notification', true)
            }
          />

          <CheckBox
            title="No, I do NOT want to be provided with this information."
            textStyle={styles.checkboxText}
            checked={screening_blood_notification === false}
            onPress={() =>
              this.handleConsentPermissions('screening_blood_notification', false)
            }
          />
        </View>

        <View style={styles.checkboxView}>
          <Text style={styles.header}>
            One aspect of this study involves researchers studying the video
            recordings and photographs of you/your child. Only researchers from
            this study or research collaborators will have access to these
            videos. However, the photos, recordings, and other study data may be
            useful in future research studies. Please select one option below:
          </Text>

          <CheckBox
            title="Yes, I allow the investigators to show digital video clips 
              of the interaction with my child during research presentations. 
              These videos may also be used by researchers at other institutions, 
              who are working with the current Principal Investigator on this study."
            textStyle={styles.checkboxText}
            checked={video_presentation === 'yes_study_presentations'}
            onPress={() =>
              this.handleConsentPermissions('video_presentation', 'yes_study_presentations')
            }
          />

          <CheckBox
            title="Yes, I allow the investigators to show digital video clips of the interaction with my child during research presentations. These videos may NOT be used by researchers at other institutions, who are working with the current Principal Investigator on this study."
            textStyle={styles.checkboxText}
            checked={video_presentation === 'yes_other_presentations'}
            onPress={() =>
              this.handleConsentPermissions('video_presentation', 'yes_other_presentations')
            }
          />

          <CheckBox
            title="No, I don’t allow the investigators to show digital video clips of the interaction with my child during research presentations. These videos may NOT be used by researchers at other institutions."
            textStyle={styles.checkboxText}
            checked={video_presentation === 'no_presentations'}
            onPress={() =>
              this.handleConsentPermissions('video_presentation', 'no_presentations')
            }
          />
        </View>

        <View style={styles.checkboxView}>
          <Text style={styles.header}>
            Video data, including the video of you and your child playing
            together, may also be uploaded to a web-based research library
            called Databrary. Please select one option below:
          </Text>

          <CheckBox
            title="Yes, I allow the investigators to share video clips of me
              and my child to other researchers at other institutions, via the
              Databrary database."
            textStyle={styles.checkboxText}
            checked={video_sharing === 'yes_other_researchers'}
            onPress={() =>
              this.handleConsentPermissions('video_sharing', 'yes_other_researchers')
            }
          />

          <CheckBox
            title="No, I do not allow the investigators to share video clips
              of me or my child to other researchers at other institutions, via
              the Databrary database."
            textStyle={styles.checkboxText}
            checked={video_sharing === 'no_other_researchers'}
            onPress={() =>
              this.handleConsentPermissions('video_sharing', 'no_other_researchers')
            }
          />
        </View>

        <View style={styles.checkboxView}>
          <Text style={styles.header}>
            If you have any questions or concerns about the consent, please
            email: lane-strathern@uiowa.edu or call 319-356-7044.
          </Text>
        </View>

        <View style={styles.sketchContainer}>
          <Text style={styles.signatureHeader}>
            Signature of parent for their own participation and the
            participation of the child.
          </Text>
          {!remoteDebug && (
            <ExpoPixi.Signature
              ref={ref => (this.signature = ref)}
              style={styles.signature}
              onTouchStart={() => this.handleNestedScrollEvent(false)}
              onTouchEnd={() => this.handleNestedScrollEvent(true)}
              strokeColor={Colors.black}
              strokeWidth={8}
              strokeAlpha={0.5}
              transparent={false}
            />
          )}
          {remoteDebug && (
            <Text style={styles.dummySignature}>
              Signature pad disabled when remote debugger enabled.
            </Text>
          )}
        </View>

        {this.state.errorMessage && (
          <View style={styles.textErrorContainer}>
            <Text style={styles.textError}>{this.state.errorMessage}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            color={Colors.grey}
            buttonStyle={styles.buttonOneStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={this.handleReset}
            title="Reset"
          />
          <Button
            color={Colors.pink}
            buttonStyle={styles.buttonTwoStyle}
            titleStyle={styles.buttonTitleStyle}
            onPress={this.handleSubmit}
            title="Done"
          />
        </View>
      </ScrollView>
    ); // return
  } // render
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    marginBottom: 80,
  },
  explanation: {
    fontSize: 16,
    fontWeight: '900',
  },
  header: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 20,
  },
  sketchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.grey,
    borderWidth: 1.5,
    borderRadius: 5,
    marginTop: 20,
  },
  signature: {
    flex: 1,
    height: 150,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 5,
  },
  dummySignature: {
    color: Colors.grey,
    height: 150,
    textAlign: 'center',
    paddingTop: 20,
  },
  signatureHeader: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    marginLeft: 5,
    marginRight: 5,
  },
  buttonContainer: {
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    //position: 'absolute',
    //bottom: 20,
    width: '100%',
    marginTop: 20,
  },
  buttonOneStyle: {
    width: twoButtonWidth,
    backgroundColor: Colors.lightGrey,
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 5,
  },
  buttonTwoStyle: {
    width: twoButtonWidth,
    backgroundColor: Colors.lightPink,
    borderColor: Colors.pink,
    borderWidth: 2,
    borderRadius: 5,
  },
  textErrorContainer: {
    marginTop: 20,
  },
  textError: {
    textAlign: 'center',
    color: Colors.errorColor,
    fontSize: 14,
    padding: 5,
  },
});

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});
const mapDispatchToProps = {
  updateSession,
  apiUpdateRespondent,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConsentSignatureForm);

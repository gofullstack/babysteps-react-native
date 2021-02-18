import React, { Component } from 'react';
import { Text, View, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';

import { connect } from 'react-redux';
import { updateSession } from '../actions/session_actions';

import ConsentSummaryContent002 from './consent_summary_content_002';
import ConsentSummaryContent003 from './consent_summary_content_003';

import IRBInformation from '../constants/IRB';
import States from '../actions/states';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');
const oneButtonWidth = width - 100;

const widthOffset = 60;

const signatureWidth = width - (widthOffset * 2);
const signatureHeight = signatureWidth * 0.4;

const components = {
  '002': ConsentSummaryContent002,
  '003': ConsentSummaryContent003,
};

class ConsentSummaryContent extends Component {
  state = {
    scrollOffset: 800,
  };

  handleSubmit = () => {
    const registration_state = States.REGISTERING_FULL_CONSENT;
    this.props.updateSession({ registration_state });
  };

  renderButton = () => {
    if (this.props.formState === 'edit') {
      const irb = IRBInformation[this.props.tosID];
      return (
        <View style={styles.buttonContainer}>
          <Text style={styles.expires}>
            This Disclosure expires: {irb.expiration_date}.
          </Text>
          <Button
            title="CONTINUE"
            onPress={() => this.handleSubmit()}
            color={Colors.pink}
            buttonStyle={styles.buttonNext}
            titleStyle={styles.buttonNextTitle}
          />
        </View>
      );
    }
  };

  render() {
    const { tosID } = this.props;
    let ConsentSummaryVersion = components[tosID];

    return (
      <ScrollView
        contentContainerStyle={styles.scrollView}
        ref={ref => (this._scrollView = ref)}
      >
        <ConsentSummaryVersion />
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
)(ConsentSummaryContent);

import React, { Component } from 'react';
import { Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { connect } from 'react-redux';

import Colors from '../constants/Colors';

// eslint-disable-next-line react/prefer-stateless-function
class SettingsFAQContent extends Component {
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>General FAQs</Text>

          <Text style={styles.header}>
            The app isn't working. Who do I contact?
          </Text>
          <Text style={styles.text}>
            If you are able to get into the app, you can go to the “Support”
            page and send an email. The support team will try to respond to your
            concern. You can also call the research staff at (319) 353-6838 for
            assistance.
          </Text>

          <Text style={styles.header}>
            I’m unsure if my child is delayed in his/her development. How can I
            get advice?
          </Text>
          <Text style={styles.text}>
            Each child is unique, and some children do take a little longer to
            reach certain milestones. Members of the research team with
            expertise in developmental pediatrics will review the information
            you submit through the BabySteps app. If there are any concerns for
            a possible developmental delay, the research team will contact you
            and refer you to appropriate providers or services. However, if you
            have concerns about your child’s development, or specific medical
            questions, you should speak directly with your child’s pediatrician.
          </Text>

          <Text style={styles.header}>
            Due to some unforeseen events, I cannot continue in this study. What
            should I do?
          </Text>
          <Text style={styles.text}>
            Please send a message to the research team via the “Support” page in
            BabySteps stating your discontinuation in the study. You will
            receive an email response confirming your withdrawal from the study.
          </Text>

          <Text style={styles.header}>
            How do I know which tasks are required for the study?
          </Text>
          <Text style={styles.text}>
            The most important research tasks are highlighted in several ways.
            Sometimes you will get a notification on your phone asking for you
            to complete a question. Other research tasks from your baby’s age
            group will appear in the “Research Activities” list in the app.
            Research-related tasks are highlighted in green and denoted with a
            small baby face.
            <MaterialIcons name="child-care" size={16} color='green' />
          </Text>

          <Text style={styles.header}>
            How often should I be using the app?
          </Text>
          <Text style={styles.text}>
            We request that you use the app whenever you have a research task
            appears. Try to log into the app a minimum of 3 times a week to
            check for new tasks.
          </Text>

          <Text style={styles.header}>
            Do I need to fill out tasks for earlier age groups than my child’s
            current age?
          </Text>
          <Text style={styles.text}>
            You are welcome to fill out these tasks if you have photos or videos
            already saved, but it is not required.
          </Text>

          <Text style={styles.header}>
            I forgot to turn on notifications and/or enable my
            camera/microphone. How do I do this now?
          </Text>
          <Text style={styles.text}>
            For iPhone: Go to Settings and click on “BabySteps” to edit these
            settings.
          </Text>
          <Text style={[styles.text, {marginTop: 5}]}>
            For android: Go to Settings, then General to click on Apps &
            notifications. Under app permissions, you can select
            &quot;Microphone&quot; and &quot;Camera&quot; then select BabySteps
            to enable these.
          </Text>
          <Text style={styles.header}>
            When/how much will I be compensated?
          </Text>
          <Text style={styles.text}>
            Generally, all participants will be compensated after the completion
            of the two major tasks--the video recordings and the blood draw. All
            participants will be awarded a $20 online Amazon gift card following
            your completion of the two videos that are at least 3 minutes long.
            You will be instructed when to record and submit these videos.
          </Text>
          <Text style={[styles.text, {marginTop: 5}]}>
            There will also be compensation for the finger prick blood test
            needed for the study. If the test is done as a routine part of your
            medical visit, you will be compensated $20. If your child has to do
            the test just for the purpose of this study, you will be compensated
            $40.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 150,
  },
  scrollView: {
    paddingBottom: 60,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 15,
    marginBottom: 20,
  },
  header: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'left',
    paddingRight: 5,
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  text: {
    //textAlign: 'center',
    fontSize: 12,
    paddingRight: 5,
    marginLeft: 15,
  },
  elevated: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingRight: 5,
    paddingLeft: 5,
    paddingBottom: 10,
    marginBottom: 20,
    elevation: 2,
  },
});

const mapStateToProps = ({ session }) => ({
  session,
});

export default connect(mapStateToProps)(SettingsFAQContent);

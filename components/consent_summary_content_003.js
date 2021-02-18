import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { connect } from 'react-redux';

import Colors from '../constants/Colors';

// eslint-disable-next-line react/prefer-stateless-function
class ConsentSummaryContent002 extends Component {
  render() {
    return (
      <View>
        <Text style={styles.header}>INFORMED CONSENT SUMMARY</Text>
        <View style={styles.elevated}>
          <Ionicons
            name="md-phone-portrait"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />
          <View style={styles.text}>
            <Text style={styles.bold}>Project Title:</Text>
            <Text style={[styles.listText, {paddingLeft: 10}]}>
              Epigenetics, polygenic risk and the social environment in autism
            </Text>
          </View>
          <View style={styles.text}>
            <Text style={styles.bold}>Principal Investigator:</Text>
            <Text style={[styles.listText, {paddingLeft: 10}]}>
              Lane Strathearn MD PhD
            </Text>
          </View>

          <Text style={styles.text}>
            This page provides key information you need to know about
            participating in this research study. Taking part in a research
            study is voluntary. You don’t need to take part in this study to
            receive care for your child. You can stop taking part in this study
            at any time without any penalty. Feel free to ask the researchers
            any questions you have about this study. The full informed consent
            document that follows includes detailed information about the study. 
          </Text>
        </View>

        <View style={styles.elevated}>
          <Ionicons
            name="md-construct"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />
          <Text style={styles.header}>The purpose of the research study:</Text>
          <Text style={styles.text}>
            This study was designed to examine ways in which a child’s
            development may be influenced by genetic and environmental factors.
            We hope to use information uncovered by this study to identify
            possible risk factors for autism and other early-childhood
            developmental concerns.
          </Text>
        </View>

        <View style={styles.elevated}>
          <Ionicons
            name="md-clipboard"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>
            Main procedures you will undergo if you take part in this research
            study:
          </Text>
          <Text style={styles.text}>
            As a participant in this study, you will be asked to use this
            smartphone application, called “BabySteps,” for about 6 months.
            During this time, you will complete prompts, questionnaires, and
            surveys about you and your child. You will occasionally be asked to
            videotape yourself playing with your child. Researchers will also
            need access to a small amount of your child’s blood. If your child
            has an autism evaluation at the Center for Disabilities and
            Development (CDD), blood will be collected at this time. Otherwise,
            researchers will work with you to plan a time for this sample
            collection to occur. This sample will be compared to a sample of
            blood which is routinely taken from every child born in Iowa for
            newborn screening purposes.
          </Text>
        </View>

        <View style={styles.elevated}>
          <Ionicons
            name="md-people"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />
          <Text style={styles.header}>
            Number of study visits and how long study visits will be:
          </Text>
          <Text style={styles.text}>
            You may or may not need to visit with researchers in-person during
            this study. If your child is scheduled for an autism evaluation at
            the Center for Disabilities and Development (CDD), you will likely
            meet with researchers at this time. Otherwise, you may meet with
            researchers at your child’s well-child appointment or during their
            blood sample collection. If you do not meet with researchers
            in-person, you will still speak with them over the phone or via
            videoconferencing at least once or twice.
          </Text>
        </View>

        <View style={styles.elevated}>
          <Ionicons
            name="md-clock"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />
          <Text style={styles.header}>How long you will be in the study:</Text>
          <Text style={styles.text}>
            Your involvement in this study will last about 6 months.
          </Text>
        </View>

        <View style={styles.elevated}>

          <Ionicons
            name="md-clipboard"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>
            Reasons why I may or may not want to participate in this study.
          </Text>
          <Text style={styles.text}>
            This study will require your active engagement in the BabySteps
            smartphone application. This app will allow you to collect and
            organize your child’s memories and milestones in a convenient,
            shareable format. Finding time to complete prompts and research
            activities may be easy for some families, but more difficult for
            others. To accommodate busy schedules, this study was designed so
            that most of the research activities can take place in your own
            home. It is important to be aware that your child will need to have
            their blood drawn for this study, which may cause a little pain and
            bleeding. You will be compensated for your participation in the
            study. 
          </Text>
        </View>

        <View style={styles.elevated}>

          <Ionicons
            name="md-cog"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>
            Main risks of taking part in this research study:
          </Text>
          <Text style={styles.text}>
            There are a few risks for taking part in this study, such as loss of
            confidentiality. Additionally, aspects of this study, such as being
            videotaped or answering certain prompts on the app, may make you
            feel uncomfortable. It may also be hard to watch or participate in
            your child’s blood sample collection, as this may cause your child
            some pain or distress. Researchers in this study are required by law
            to report any suspected physical or sexual abuse.
          </Text>
        </View>

        <View style={styles.elevated}>

          <Ionicons
            name="md-beaker"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>
            Possible benefits of taking part in this research study:
          </Text>
          <Text style={styles.text}>
            While we do not know if you will benefit from this study, we hope
            that you find the BabySteps app a useful way of collecting,
            organizing, and sharing virtual keepsakes of your child.
          </Text>
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    marginTop: 5,
  },
  header: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  text: {
    //textAlign: 'center',
    fontSize: 12,
    padding: 5,
  },
  bold: {
    fontWeight: '600',
  },
  listText: {
    fontSize: 12,
    paddingLeft: 5,
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

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});

export default connect(mapStateToProps)(ConsentSummaryContent002);

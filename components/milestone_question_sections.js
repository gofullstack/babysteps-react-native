import React, { Component } from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Text } from 'react-native-elements';

import { _ } from 'lodash';

import { RenderChoices } from './milestone_question_components';

import Colors from '../constants/Colors';
import VideoFormats from '../constants/VideoFormats';

const { width } = Dimensions.get('window');

const numberWidth = 20;
const itemWidth = width - numberWidth;

// eslint-disable-next-line import/prefer-default-export
export class RenderSections extends Component {

  renderSection = section => {
    const { task, extraData } = this.props;
    return (
      <View key={section.id} style={{flexGrow: 1}}>
        {section.body && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsLabel}>Instructions: &nbsp;</Text>
            <Text>{section.body}</Text>
            {section.attachment_url && this.renderAttachment(section.attachment_url)}
          </View>
        )}
        {this.renderQuestions(section.questions)}
      </View>
    );
  };

  renderQuestions = questions => {
    let questionsLayout = [];
    _.forEach(questions, question => {
      questionsLayout.push( this.renderQuestion(question) );
    });
    return questionsLayout;
  };

  renderQuestion = question => {
    const {
      answers,
      attachments,
      saveResponse,
      errorMessage,
      navigation,
    } = this.props;
    let question_number = `${question.position}. `;
    if (!_.isEmpty(question.question_number)) {
      question_number = `${question.question_number}. `;
    }
    return (
      <View key={question.id} style={styles.questionContainer}>
        <View style={styles.questionLeft}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.questionNumber}>{question_number}</Text>
            <Text style={styles.question}>{question.title}</Text>
          </View>
          {!!question.body && (
            <Text style={styles.questionBody}>{question.body}</Text>
          )}
        </View>
        <RenderChoices
          question={question}
          answers={answers}
          attachments={attachments}
          navigation={navigation}
          saveResponse={saveResponse}
          errorMessage={errorMessage}
        />
      </View>
    );
  };

  renderAttachment = attachment_url => {
    const fileExtension = attachment_url.split('.').pop();
    if (_.has(VideoFormats, fileExtension)) {
      return this.renderVideoAttachment(attachment_url);
    }
    return this.renderImageAttachement(attachment_url);
  };

  renderImageAttachement = uri => {
    return (
      <Image
        style={styles.image}
        source={{ uri }}
        resizeMethod="scale"
        resizeMode="contain"
      />
    );
  };

  renderVideoAttachment = uri => {
    return (
      <Video
        source={{ uri }}
        resizeMode={Video.RESIZE_MODE_COVER}
        shouldPlay={false}
        isLooping={false}
        useNativeControls
        ref={ref => (this.videoPlayer = ref)}
        style={styles.video}
      />
    );
  };

  render() {
    const { questionData, answers, attachments } = this.props;
    const sectionLayout = [];
    if (!_.isEmpty(questionData)) {
      _.forEach(questionData, section => {
        sectionLayout.push(this.renderSection(section));
      });
    }
    return (
      <ScrollView style={styles.sectionContainer}>{sectionLayout}</ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    flexDirection: 'column',
    flexGrow: 1,
    paddingBottom: 30,
  },
  instructionsContainer: {
    fontSize: 14,
    margin: 10,
  },
  instructionsLabel: {
    fontWeight: 'bold',
  },
  questionContainer: {
    flexGrow: 1,
    padding: 5,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  questionLeft: {
    justifyContent: 'flex-start',
    width: itemWidth,
  },
  questionNumber: {
    fontSize: 14,
    paddingVertical: 2,
    marginLeft: 5,
    color: Colors.tint,
    width: numberWidth,
    justifyContent: 'center',
  },
  question: {
    fontSize: 14,
    paddingVertical: 2,
    paddingLeft: 5,
    paddingRight: 10,
    color: Colors.tint,
    width: itemWidth,
  },
  questionBody: {
    fontSize: 12,
    paddingVertical: 2,
    paddingLeft: 20,
    color: Colors.tint,
  },
  image: {
    flex: 1,
    width: itemWidth,
    height: itemWidth * 0.66,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 10,
    marginBottom: 10,
  },
  video: {
    flex: 1,
    width: itemWidth,
    height: itemWidth * 0.66,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 10,
    marginBottom: 10,
  },
});

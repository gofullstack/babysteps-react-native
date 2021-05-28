import React, { Component } from 'react';

import {
  RenderCheckBox,
  RenderCheckYesNo,
  RenderTextShort,
  RenderTextLong,
  RenderTextNumeric,
  RenderDate,
  RenderFile,
  RenderExternalLink,
  RenderInternalLink,
  RenderGroupOptionError,
} from './milestone_question_elements';

// eslint-disable-next-line import/prefer-default-export
export class RenderChoices extends Component {
  render() {
    const {
      question,
      answers,
      attachments,
      errorMessage,
      saveResponse,
      pregnancy = 0,
    } = this.props;
    const choices = question.choices;

    switch (question.rn_input_type) {
      case 'check_box_multiple': {
        return (
          <RenderCheckBox
            choices={choices}
            format="multiple"
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'check_box_single': {
        return (
          <RenderCheckBox
            choices={choices}
            format="single"
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'check_box_yes_no': {
        return (
          <RenderCheckYesNo
            choices={choices}
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'date_time_date': {
        return (
          <RenderDate
            choices={choices}
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'text_short': {
        return (
          <RenderTextShort
            choices={choices}
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'text_long': {
        return (
          <RenderTextLong
            choices={choices}
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'number': {
        return (
          <RenderTextNumeric
            choices={choices}
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'file_audio':
      case 'file_image':
      case 'file_video':
      case 'file_video_frustration': {
        return (
          <RenderFile
            question={question}
            choices={choices}
            answers={answers}
            attachments={attachments}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
            errorMessage={errorMessage}
          />
        );
      }
      case 'external_link': {
        return (
          <RenderExternalLink
            question={question}
            choices={choices}
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
            errorMessage={errorMessage}
          />
        );
      }
      case 'internal_link': {
        return (
          <RenderInternalLink
            question={question}
            choices={choices}
            navigation={this.props.navigation}
            saveResponse={saveResponse}
            errorMessage={errorMessage}
          />
        );
      }
      default: {
        return (
          <RenderGroupOptionError
            question={question}
          />
        );
      }
    }
  }
}

import React, { PureComponent } from 'react';

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
export class RenderChoices extends PureComponent {
  render() {
    const {
      question,
      answers,
      attachments,
      errorMessage,
      saveResponse,
      pregnancy = 0,
    } = this.props;

    switch (question.rn_input_type) {
      case 'check_box_multiple': {
        return (
          <RenderCheckBox
            choices={question.choices}
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
            choices={question.choices}
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
            choices={question.choices}
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'date_time_date': {
        return (
          <RenderDate
            choices={question.choices}
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'text_short': {
        return (
          <RenderTextShort
            choices={question.choices}
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'text_long': {
        return (
          <RenderTextLong
            choices={question.choices}
            answers={answers}
            pregnancy={pregnancy}
            saveResponse={saveResponse}
          />
        );
      }
      case 'number': {
        return (
          <RenderTextNumeric
            choices={question.choices}
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
            choices={question.choices}
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
            choices={question.choices}
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
            choices={question.choices}
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

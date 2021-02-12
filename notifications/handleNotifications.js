import { PureComponent } from 'react';

import * as Notifications from 'expo-notifications';

import { showMessage } from 'react-native-flash-message';

import NavigationService from '../navigation/NavigationService';

import { connect } from 'react-redux';
import { fetchSession } from '../actions/session_actions';

import find from 'lodash/find';

import { showMomentaryAssessment } from '../actions/notification_actions';

let responseListener = null;

class HandleNotifications extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      requestedPushToken: false,
    };

    this.props.fetchSession();
  }

  componentDidMount() {
    responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        this._handleNotificationResponse(response);
      },
    );

    // temporary code for backward compatibility
    Notifications.cancelAllScheduledNotificationsAsync();
  }

  componentWillUnmount() {
    Notifications.removeNotificationSubscription(responseListener);
  }

  _handleNotificationOnPress = data => {
    const tasks = this.props.milestones.tasks.data;
    const task = find(tasks, ['id', data.task_id]);
    NavigationService.navigate('MilestoneQuestions', { task });
  };

  _handleMomentaryAssessment = data => {
    this.props.showMomentaryAssessment(data);
  };

  _handleNotificationResponse = async response => {
    const data = response.notification.request.content.data;

    if (data.momentary_assessment) {
      this._handleMomentaryAssessment(data);
    } else if (data.task_id) {
      this._handleNotificationOnPress(data);
    } else {
      showMessage({
        type: data.type,
        message: data.title,
        description: data.body,
        color: Colors.flashMessage,
        backgroundColor: Colors.flashMessageBackground,
        autoHide: false,
        icon: data.type,
        onPress: () => this._handleNotificationOnPress(data),
      });
    }
  };

  render() {
    return null;
  }
}

const mapStateToProps = ({
  session,
  registration,
  milestones,
}) => ({
  session,
  registration,
  milestones,
});

const mapDispatchToProps = {
  fetchSession,
  showMomentaryAssessment,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HandleNotifications);

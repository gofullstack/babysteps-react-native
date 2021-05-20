import { PureComponent } from 'react';

import * as Notifications from 'expo-notifications';

import { showMessage } from 'react-native-flash-message';

import find from 'lodash/find';

import { connect } from 'react-redux';

import NavigationService from '../navigation/NavigationService';

import { showMomentaryAssessment } from '../actions/notification_actions';

let responseListener = null;

class HandleNotifications extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      requestedPushToken: false,
    };
  }

  componentDidMount() {
    responseListener = Notifications.addNotificationResponseReceivedListener(
      response => {
        this.handleNotificationResponse(response);
      },
    );

    // temporary code for backward compatibility
    Notifications.cancelAllScheduledNotificationsAsync();
  }

  componentWillUnmount() {
    Notifications.removeNotificationSubscription(responseListener);
  }

  handleNotificationOnPress = data => {
    const tasks = this.props.milestones.tasks.data;
    const task = find(tasks, ['id', data.task_id]);
    NavigationService.navigate('MilestoneQuestions', { task });
  };

  handleMomentaryAssessment = data => {
    this.props.showMomentaryAssessment(data);
  };

  handleNotificationResponse = async response => {
    const data = response.notification.request.content.data;

    if (data.momentary_assessment) {
      this.handleMomentaryAssessment(data);
    } else if (data.task_id) {
      this.handleNotificationOnPress(data);
    } else {
      showMessage({
        type: data.type,
        message: data.title,
        description: data.body,
        color: Colors.flashMessage,
        backgroundColor: Colors.flashMessageBackground,
        autoHide: false,
        icon: data.type,
        onPress: () => this.handleNotificationOnPress(data),
      });
    }
  };

  render() {
    return null;
  }
}

const mapStateToProps = ({ session, registration, milestones }) => ({
  session,
  registration,
  milestones,
});

const mapDispatchToProps = {
  showMomentaryAssessment,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HandleNotifications);

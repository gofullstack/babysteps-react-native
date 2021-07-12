import { PureComponent } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';

import {
  updateSession,
  dispatchPendingActions,
  apiDispatchTokenRefresh,
} from '../actions/session_actions';

import CONSTANTS from '../constants';

class ApiOfflineListener extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dispatching_pending_actions: false,
    };

    this.getConnectionStatus();
    this.addListeners();
  }

  componentDidUpdate(prevProps, prevState) {
    const session = this.props.session;
    // console.log('**** Network Type: ', session.connectionType);
    this.dispatch_pending_actions(session);
  }

  dispatch_pending_actions = session => {
    const { dispatching_pending_actions } = this.state;
    if (
      !['none', 'unknown'].includes(session.connectionType) &&
      !session.dispatching_pending_actions &&
      !dispatching_pending_actions
    ) {
      // should dispatch in the same order as they were pushed onto the array
      const pending_actions = session.pending_actions;
      // console.log('**** Pending Actions: ', pending_actions.length);
      if (Array.isArray(pending_actions) && !isEmpty(pending_actions)) {
        this.props.dispatchPendingActions(pending_actions);
        this.setState({ dispatching_pending_actions: true });
      } else {
        this.setState({ dispatching_pending_actions: false });
      }
    }
  };

  getConnectionStatus = async () => {
    const connectionInfo = await NetInfo.fetch();
    this.updateSession(connectionInfo.type);
  };

  updateSession = type => {
    const session = this.props.session;
    if (CONSTANTS.TESTING_MOCK_DISABLE_NETWORK) {
      this.props.updateSession({ connectionType: 'none' });
    } else if (session.connectionType !== type) {
      this.props.updateSession({ connectionType: type });
    }
  };

  updateUserSession = nextAppState => {
    const session = this.props.session;
    if (nextAppState === 'active' && session.email) {
      this.props.apiDispatchTokenRefresh(session);
    }
  };

  addListeners = () => {
    NetInfo.addEventListener(connectionInfo => {
      this.updateSession(connectionInfo.type);
    });
    // check after application opens or wakes from background
    AppState.addEventListener('change', nextAppState => {
      this.getConnectionStatus();
      this.updateUserSession(nextAppState);
    });
  };

  render() {
    return null;
  }
}

const mapStateToProps = ({ session }) => ({ session });
const mapDispatchToProps = {
  updateSession,
  dispatchPendingActions,
  apiDispatchTokenRefresh,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ApiOfflineListener);

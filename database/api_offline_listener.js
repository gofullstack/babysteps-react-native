import React, { PureComponent } from 'react';
import { AppState, NetInfo } from 'react-native';

import isEmpty from 'lodash/isEmpty';

import { connect } from 'react-redux';

import {
  updateConnectionType,
  dispatchPendingActions,
} from '../actions/session_actions';

import CONSTANTS from '../constants';

class ApiOfflineListener extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dispatching_pending_actions: false,
    };
    this._getConnectionStatus();
    this._addListeners();
  }

  componentWillUpdate(nextProps) {
    const session = nextProps.session;
    const pending_actions = session.pending_actions;
    // console.log('**** Network Type: ', session.connectionType);
    // console.log('**** Pending Actions: ', pending_actions.length);
    if (
      !['none', 'unknown'].includes(session.connectionType) &&
      !session.dispatching_pending_actions &&
      !this.state.dispatching_pending_actions
    ) {
      // should dispatch in the same order as they were pushed onto the array
      if (Array.isArray(pending_actions) && !isEmpty(pending_actions)) {
        this.props.dispatchPendingActions(pending_actions);
        this.setState({ dispatching_pending_actions: true });
      } else {
        this.setState({ dispatching_pending_actions: false });
      }
    }
  }

  _getConnectionStatus = async () => {
    const connectionInfo = await NetInfo.getConnectionInfo();
    this._updateSession(connectionInfo.type);
  };

  _updateSession = type => {
    if (CONSTANTS.TESTING_MOCK_DISABLE_NETWORK) {
      this.props.updateConnectionType('none');
    } else {
      this.props.updateConnectionType(type);
    }
  };

  _addListeners = () => {
    NetInfo.addEventListener('connectionChange', connectionInfo => {
      this._updateSession(connectionInfo.type);
    });
    // check after application opens or wakes from background
    AppState.addEventListener('change', () => {
      this._getConnectionStatus();
    });
  };

  render() {
    return null;
  }
}

const mapStateToProps = ({ session }) => ({ session });
const mapDispatchToProps = { updateConnectionType, dispatchPendingActions };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ApiOfflineListener);

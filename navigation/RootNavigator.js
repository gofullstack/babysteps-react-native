import React, { Component } from 'react';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import { connect } from 'react-redux';
import { fetchSession } from '../actions/session_actions';

import AppNavigator from './AppNavigator';
import NavigationService from './NavigationService';

import TourScreen from '../screens/TourScreen';
import SignInScreen from '../screens/SignInScreen';
import ConsentScreen from '../screens/ConsentScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import TourNoStudyConfirmScreen from '../screens/TourNoStudyConfirmScreen';
import RegistrationNoStudyScreen from '../screens/RegistrationNoStudyScreen';
import UpdateConsentScreen from '../screens/UpdateConsentScreen';

import Colors from '../constants/Colors';
import States from '../actions/states';

const headerOptions = {
  headerStyle: {
    backgroundColor: Colors.headerBackground,
  },
  headerTintColor: Colors.headerTint,
  headerTitleStyle: {
    fontWeight: '900',
  },
};

const ConsentNavigator = createStackNavigator(
  {
    screen: ConsentScreen,
  },
  {
    defaultNavigationOptions: headerOptions,
  },
);

const ConsentNavigationContainer = createAppContainer(ConsentNavigator);

const RegistrationNavigator = createStackNavigator(
  {
    Registration: {
      screen: RegistrationScreen,
    },
    SignIn: {
      screen: SignInScreen,
    },
  },
  {
    defaultNavigationOptions: headerOptions,
  },
);

const RegistrationNavigationContainer = createAppContainer(RegistrationNavigator);

const TourNavigator = createStackNavigator(
  {
    Tour: {
      screen: TourScreen,
    },
    Registration: {
      screen: RegistrationNavigator,
    },
    SignIn: {
      screen: SignInScreen,
    },
  },
  {
    defaultNavigationOptions: () => ({
      header: null,
    }),
  },
);

const TourNavigationContainer = createAppContainer(TourNavigator);

const TourNoStudyNavigator = createStackNavigator(
  {
    Tour: {
      screen: TourNoStudyConfirmScreen,
    },
    Registration: {
      screen: RegistrationNoStudyScreen,
    },
  },
  {
    defaultNavigationOptions: () => ({
      header: null,
    }),
  },
);

const TourNoStudyNavigationContainer = createAppContainer(TourNoStudyNavigator);

class RootNavigator extends Component {
  constructor(props) {
    super(props);
    this.props.fetchSession();
  }

  render() {
    const { registration_state } = this.props.session;

    if (States.REGISTRATION_COMPLETE.includes(registration_state)) {
      return (
        <AppNavigator
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        />
      );
    }
    if (States.REGISTERING_NO_STUDY.includes(registration_state)) {
      return <TourNoStudyNavigationContainer />;
    }
    if (States.REGISTERING_CONSENT.includes(registration_state)) {
      return <ConsentNavigationContainer />;
    }
    if (registration_state === States.REGISTERING_UPDATE_CONSENT) {
      return <UpdateConsentScreen />;
    }
    if (States.REGISTERING_REGISTRATION.includes(registration_state)) {
      return <RegistrationNavigationContainer />;
    }
    if (['none', 'undefined'].includes(registration_state)) {
      return <TourNavigationContainer />;
    }
  }
}

const mapStateToProps = ({ session }) => ({ session });
const mapDispatchToProps = { fetchSession };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RootNavigator);

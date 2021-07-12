import React, { Component } from 'react';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import { connect } from 'react-redux';

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
    height: 40,
    backgroundColor: Colors.headerBackground,
  },
  headerTintColor: Colors.headerTint,
  headerTitleStyle: {
    fontWeight: '900',
    fontSize: 32,
  },
  headerForceInset: {
    top: 'never',
    bottom: 'never',
  },
};

const ConsentNavigator = createStackNavigator(
  {
    screen: ConsentScreen,
  },
  {
    defaultNavigationOptions: headerOptions,
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
      navigationOptions: { header: null },
    },
    Registration: {
      screen: RegistrationNavigator,
      navigationOptions: { header: null },
    },
    SignIn: {
      screen: SignInScreen,
    },
  },
  {
    defaultNavigationOptions: headerOptions,
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

export default connect( mapStateToProps )(RootNavigator);

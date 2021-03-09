import React from 'react';
import { Platform } from 'react-native';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import TabBarIcon from '../components/tab_bar_icon';
import OverviewScreen from '../screens/OverviewScreen';
import OverviewBirthFormScreen from '../screens/OverviewBirthFormScreen';
import MilestonesScreen from '../screens/MilestonesScreen';
import MilestoneQuestionsScreen from '../screens/MilestoneQuestionsScreen';
import MilestonePregnancyHistoryScreen from '../screens/MilestonePregnancyHistoryScreen';
import MilestoneQuestionConfirmScreen from '../screens/MilestoneQuestionConfirmScreen';
import UpdateConsentScreen from '../screens/UpdateConsentScreen';

//import TourScreen from '../screens/TourScreen';
import BabyBookScreen from '../screens/BabyBookScreen';
import BabyBookEntryScreen from '../screens/BabyBookEntryScreen';
import SettingsScreen from '../screens/SettingsScreen';

import Colors from '../constants/Colors';

const headerOptions = {
  headerStyle: {
    backgroundColor: Colors.headerBackground,
  },
  headerTintColor: Colors.headerTint,
  headerTitleStyle: {
    fontWeight: '400',
    fontSize: 20,
  },
};

const MilestonesStack = createStackNavigator(
  {
    Milestones: MilestonesScreen,
    MilestoneQuestions: MilestoneQuestionsScreen,
    MilestonePregnancyHistory: MilestonePregnancyHistoryScreen,
    MilestoneQuestionConfirm: MilestoneQuestionConfirmScreen,
    OverviewBirthForm: OverviewBirthFormScreen,
  },
  {
    defaultNavigationOptions: headerOptions,
  },
);

MilestonesStack.navigationOptions = {
  tabBarLabel: 'Milestones',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios' ? 'ios-list' : 'md-list'
      }
    />
  ),
};

const OverviewStack = createStackNavigator(
  {
    Overview: OverviewScreen,
    OverviewBirthForm: OverviewBirthFormScreen,
    MilestonesStack: MilestonesScreen,
  },
  {
    defaultNavigationOptions: headerOptions,
  },
);

OverviewStack.navigationOptions = {
  tabBarLabel: 'Overview',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios' ? 'ios-information-circle' : 'md-information-circle'
      }
    />
  ),
};

const BabyBookStack = createStackNavigator(
  {
    BabyBook: BabyBookScreen,
    BabyBookEntry: BabyBookEntryScreen,
  },
  {
    defaultNavigationOptions: headerOptions,
  },
);

BabyBookStack.navigationOptions = {
  tabBarLabel: 'BabyBook',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios' ? 'ios-book' : 'md-book'
      }
    />
  ),
};

const SettingsStack = createStackNavigator(
  {
    Settings: SettingsScreen,
  },
  {
    defaultNavigationOptions: headerOptions,
  },
);

SettingsStack.navigationOptions = {
  tabBarLabel: 'Support',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={'md-contacts'}
    />
  ),
};

export default createAppContainer(
  createBottomTabNavigator({
    Overview: OverviewStack,
    Milestones: MilestonesStack,
    BabyBook: BabyBookStack,
    Settings: SettingsStack,
  }),
);

import React from 'react';

import { registerRootComponent, Logs } from 'expo';

import { LogBox } from 'react-native';

import { useKeepAwake } from 'expo-keep-awake';

const App = require('./App').default;

if (__DEV__) {
  //https://github.com/expo/expo/issues/2623
  const isRemoteDebuggingEnabled = typeof atob !== 'undefined';
  if (isRemoteDebuggingEnabled) {
    Logs.disableExpoCliLogging();
    LogBox.ignoreAllLogs();
  } else {
    Logs.enableExpoCliLogging();
  }
  //useKeepAwake();
  const AppEntry = () => {
    return <App />;
  };
  registerRootComponent(AppEntry);
} else {
  registerRootComponent(App);
}

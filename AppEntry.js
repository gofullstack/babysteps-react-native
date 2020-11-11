import React from 'react';

import { registerRootComponent, Logs } from 'expo';

import { useKeepAwake } from 'expo-keep-awake';

const App = require('./App').default;

if (__DEV__) {
  //https://github.com/expo/expo/issues/2623
  const isRemoteDebuggingEnabled = typeof atob !== 'undefined';
  if (isRemoteDebuggingEnabled) {
    Logs.disableExpoCliLogging();
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

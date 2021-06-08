import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/Colors';

// eslint-disable-next-line react/prefer-stateless-function
export default class TabBarIcon extends Component {
  render() {
    const { name, focused } = this.props;
    const color = focused ? Colors.tabIconSelected : Colors.tabIconDefault;
    return <Ionicons name={name} size={26} style={styles.icon} color={color} />;
  }
}

const styles = StyleSheet.create({
  icon: {
    marginBottom: -3,
  },
});

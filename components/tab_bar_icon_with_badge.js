import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { connect } from 'react-redux';

import TabBarIcon from './tab_bar_icon';

import Colors from '../constants/Colors';

// eslint-disable-next-line react/prefer-stateless-function
class TabBarIconWithBadge extends Component {
  render() {
    const session = this.props.session;
    const { name, focused, badgeAttribute } = this.props;
    const badgeCount = session[badgeAttribute];
    return (
      <View>
        <TabBarIcon name={name} focused={focused} />
        {badgeCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: 0,
    backgroundColor: Colors.red,
    borderRadius: 6,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

const mapStateToProps = ({ session }) => ({ session });

export default connect(mapStateToProps)(TabBarIconWithBadge);

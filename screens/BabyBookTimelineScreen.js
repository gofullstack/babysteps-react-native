import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet
} from 'react-native';
import { Button } from 'react-native-elements';
import Timeline from 'react-native-timeline-listview'

import { _ } from 'lodash';

import { connect} from 'react-redux';

import Colors from '../constants/Colors';
import '@expo/vector-icons';

var data = []

class BabyBookTimelineScreen extends Component {

  state = {
    selected: null,
  };

  static navigationOptions = ({navigation}) => {
    return ({
      title: 'BabyBook',
      headerRight: (
        <View style={styles.headerButtonContainer}>
          <Button
            icon={{name: 'photo-album', size: 22, color: 'white'}}
            onPress={ () => navigation.navigate('BabyBook') }
            backgroundColor={Colors.headerBackgroundColor}
            buttonStyle={styles.headerButton}
          />
          <Button
            icon={{name: 'add-a-photo', size: 22, color: 'white'}}
            onPress={ () => navigation.navigate('BabyBookEntry') }
            backgroundColor={Colors.headerBackgroundColor}
            buttonStyle={styles.headerButton}
          />
        </View>
      )
    })
  }

  render() {

    if ( this.props.babybook.entries.data.length ) {
      data = this.props.babybook.entries.data
      _.forEach(data, function(item) {
        item.id = String(item.id) // key needs to be string for SideSwipe
        item.time = new Date(item.created_at).toDateString()
      })
      data = _.orderBy(data, ['created_at'], ['desc'])
    }
    const today = new Date().toDateString()

    return (
      <View style={styles.container}>

          <Text style={styles.todayText}>TODAY</Text>
          <Text style={styles.today}>{ today }</Text>

          <Button
            icon={{name: 'add-circle', size: 60, color: Colors.pink }}
            onPress={ () => this.props.navigation.navigate('BabyBookEntry') }
            backgroundColor={Colors.white}
            buttonStyle={styles.addEntryButton}
          />

          <Timeline
            style={styles.timeline}
            data={data}
            ircleSize={16}
            columnFormat='two-column'
            circleColor={Colors.pink}
            lineColor={Colors.lightGrey}

            timeContainerStyle={{minWidth:52, marginTop: -5}}
            timeStyle={{fontSize: 10, textAlign: 'center', color: Colors.grey, padding:5}}

            descriptionStyle={{color: Colors.grey}}
            options={{
              style:{paddingTop:5}
            }}
            innerCircle={'icon'}
            onEventPress={ (item) => {this.props.navigation.navigate('BabyBook', {itemId: item.id})} }
            separator={false}
            titleStyle={{textAlign: 'center', color: Colors.pink}}
            detailContainerStyle={{ marginTop: -10, marginBottom: 20, paddingLeft: 5, paddingRight: 5}}
            renderFullLine={true}
          />

      </View>
    ) // return

  } // render

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  timeline: {
    flex: 1,
    marginTop: 20,
  },
  headerButtonContainer: {
    flexDirection: 'row',
  },
  headerButton: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    padding: 0,
    margin: -5,
  },
  todayText: {
    alignSelf: 'center',
    fontSize: 10,
    color: Colors.grey,
  },
  today: {
    alignSelf: 'center',
    fontSize: 12
  }
});

const mapStateToProps = ({ babybook }) => ({ babybook });

export default connect(mapStateToProps)(BabyBookTimelineScreen);

import React, { Component } from 'react';
import { ScrollView,View, StyleSheet, SectionList,TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';
import { connect} from 'react-redux';
import _ from 'lodash';
import Colors from '../constants/Colors';
import '@expo/vector-icons';
import { Ionicons,MaterialCommunityIcons } from '@expo/vector-icons';

import fetchMilestones from '../database/fetch_milestones';
import { milestonesTable } from '../actions/milestone_actions'
import {
  FETCH_MILESTONES_PENDING,
  FETCH_MILESTONES_FULFILLED,
  FETCH_MILESTONES_REJECTED
} from '../actions/types';

class MilestoneDetailScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const navData = navigation.getParam('item');
    console.log('navigation data',navData);
    return {
      title : navData.section.key,
    };
  };

  constructor(props){
    super(props);
   

  }

  componentWillMount() {

    if (this.props.milestones.data.length === 0) {
      
      // note redux doesn't actually change state until render
      this.props.milestonesTable(FETCH_MILESTONES_PENDING);
      fetchMilestones()
        .then( (response) => { 
          // dispatch milestones to redux
          this.props.milestonesTable(FETCH_MILESTONES_FULFILLED, response);
        })
        .catch( ( error ) => {
          this.props.milestonesTable(FETCH_MILESTONES_REJECTED, error)
        });
    } // if milestones.data.length
  }

  renderItem = (item) => {
    return  <TouchableOpacity onPress={()=>{console.log('on press',item.item.name)}}> 
              <View style={{flexDirection:'row',padding:5,  justifyContent:'space-between', borderBottomWidth:4, borderBottomColor:'#fff'}}>
              <View style={{flexDirection:'row', justifyContent:'flex-start'}}>
                <MaterialCommunityIcons name='checkbox-blank-outline' style={{ fontSize: 25, color: '#b9b9b9' }} />
                <Text style={styles.text}>{item.item.name}</Text> 
              </View>
              <View>               
                <Ionicons name='md-arrow-forward' style={{ fontSize: 25, color: '#b9b9b9' }} />
              </View>
              </View>
              </TouchableOpacity>
  }
  renderSectionHeader = (headerItem) => {
    return <Text style={styles.section}>{headerItem.section.key}</Text>
  }  

  render() {
    var milestones = [];

    if (this.props.milestones.fetched) {

      milestones = _.filter(this.props.milestones.data._array, function(m) {
        return m.always_visible;
      });
      
      milestones = _.groupBy(milestones, m => m.milestone_group );

      milestones = _.reduce(milestones, (acc, data, index) => {
        acc.push({
          key: index,
          data: data
        });
        return acc;
      }, []);

    }

    return (
      <ScrollView style={styles.container}>
        
      </ScrollView>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: 15,
    paddingVertical:2,
  },
  section: {
    fontSize: 15,
    padding:5,
    color:'#4a4a4a',
    backgroundColor:'#f2f2f2'
  }
});

const mapStateToProps = ({ milestones }) => ({ milestones });
const mapDispatchToProps = { milestonesTable }

export default connect( mapStateToProps, mapDispatchToProps )( MilestoneDetailScreen );
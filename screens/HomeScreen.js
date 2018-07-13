import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Button

} from 'react-native';
// import {Button} from '../components/Button';
import { WebBrowser } from 'expo';

import { connect } from 'react-redux';
import _ from 'lodash';


import { MonoText } from '../components/StyledText';

import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Carousel from 'react-native-snap-carousel';

import {imagesData} from '../data/images';
import {cardsData} from '../data/cards';

import fetchMilestones from '../database/fetch_milestones';
import { milestonesTable } from '../actions/milestone_actions'
import {
  FETCH_MILESTONES_PENDING,
  FETCH_MILESTONES_FULFILLED,
  FETCH_MILESTONES_REJECTED
} from '../actions/types';
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

function wp (percentage) {
    const value = (percentage * viewportWidth) / 100;
    return Math.round(value);
}

const slideHeight = viewportHeight * 0.36;
const slideWidth = wp(75);
const itemHorizontalMargin = wp(2);

const sliderWidth = viewportWidth;
const itemWidth = slideWidth + itemHorizontalMargin * 2;

class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
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
  _renderCarouselItem({item, index}) {
    return (
        <TouchableOpacity key={index} onPress={()=>{this.props.navigation.navigate('Milestones')}} >
          <View style={styles.slideItem} >
            <Image source={imagesData[index].image} style={styles.slideItemImage}  />
            <View style={styles.slideItemFooter} >
              <Text style={styles.slideItemFooterText} >{item.key} </Text>
            </View>
          </View>
        </TouchableOpacity>
    );
}
_renderScreeningCarouselCardItem({item, index}) {
  const learnMoreButton = (
            <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
              Get Started
            </Text>
            );
  return (
    <View style={styles.screeningSlideItem} >
            <View style={{flex:1, alignContent:'flex-start'}}>
              <Text numberOfLines={1}  style={styles.title} >{item.title} </Text>
              <Text numberOfLines={1} style={styles.screeningText}> {item.date}</Text>
              <Text numberOfLines={3}>{item.number} </Text>

              <View style={{flex:1,justifyContent:'flex-end',alignItems:'flex-start'}}>
              <TouchableOpacity style={styles.screeningButton}>
              <Text style={styles.screeningButtonText}> Get Started </Text>
              </TouchableOpacity>
              </View>

            </View>
            </View>
  );
}
    _renderCarouselCardItem({item, index}) {
    const learnMoreButton = (
              <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
                Get Started
              </Text>
              );
    return (
          <TouchableOpacity key={index} >
            <View style={styles.screeningSlideItem} >
              <Text >Some Title </Text>
              <Text> January 19, 2018</Text>
              <Text>itme.number </Text>
            </View>
          
          </TouchableOpacity>
    );
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
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} >
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/robot-dev.png')
                  : require('../assets/images/robot-prod.png')
              }
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.getStartedContainer}>
            {this._maybeRenderDevelopmentModeWarning()}

          </View>

          <View style={styles.helpContainer}>
            <TouchableOpacity onPress={this._handleHelpPress} style={styles.helpLink}>
              {
                //<Text style={styles.helpLinkText}>Help, it didn’t automatically reload!</Text>
              }
            </TouchableOpacity>
          </View>
        </ScrollView>

    <View style={{ height: 215, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.3)', }}>
          <View style={styles.sc} >
            <View style={{ flex: 2 }} >
              <Text style={{ fontSize: 15 }} >Screening Events</Text>
            </View>
            <TouchableOpacity style={styles.opacityStyle} >
              <Text style={{ marginRight: 5, fontSize: 15, color: '#93ecd9' }} >View all</Text>
              <Ionicons name='md-arrow-forward' style={{ fontSize: 15, color: '#93ecd9' }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, paddingLeft: 5, marginBottom: 10  }} >
             <Carousel
                ref={(c) => { this._carousel = c; }}
                data={cardsData}
                renderItem={this._renderScreeningCarouselCardItem}
                sliderWidth={sliderWidth}
                itemWidth={itemWidth-10}
                inactiveSlideScale={0.94}
                inactiveSlideOpacity={0.7}
              />
          </View>
        </View>              
        

        <View style={{ height: 200, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.3)', }}>
          <View style={styles.sc} >
            <View style={{ flex: 2 }} >
              <Text style={{ fontSize: 15 }} >Developmentals Milestone</Text>
            </View>
            <TouchableOpacity style={styles.opacityStyle} onPress={()=>{this.props.navigation.navigate('Milestones')}} >
              <Text style={{ marginRight: 5, fontSize: 15, color: '#93ecd9' }} >View all</Text>
              <Ionicons name='md-arrow-forward' style={{ fontSize: 15, color: '#93ecd9' }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, paddingLeft: 5, marginBottom: 10  }} >
             <Carousel
                ref={(c) => { this._carousel = c; }}
                data={milestones}
                renderItem={this._renderCarouselItem.bind(this)}
                sliderWidth={sliderWidth}
                itemWidth={itemWidth-30}
                inactiveSlideScale={0.94}
                inactiveSlideOpacity={0.7}
              />
          </View>
        </View>

      </ScrollView>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled...
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          App not in development mode.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },

  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  slideItem:{
     width: 250,
     height: 150,
     borderRadius: 5,
     overflow: 'hidden',
     marginLeft: 30

  },
  screeningSlideItem:{
    width: 250,
    height: 140,
    borderRadius: 5,
    overflow: 'hidden',
    marginLeft: 10,
    flex:1,
    flexDirection:'column',
    borderColor:'grey',
    borderWidth:1,
    padding:10,
 },
  slideItemImage : {
    width: null,
    height: null,
    flex: 1
  },
  slideItemFooter: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  slideItemFooterText : {
    color: '#fff',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 10,
    paddingLeft: 10,
  },
  containerStyle: {
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize:14,
    color:'#3f3e40', 
    fontWeight:'bold',
  },
  screeningText: {
    fontSize:15, 
    color:'#58ead0',
  },
  screeningButton: {
    borderBottomColor:Colors.lightPink, 
    borderBottomWidth:1, 
    backgroundColor:'#fdf3fa', 
    padding:5, 
    borderWidth:1,
    borderColor:'#f59bdc', 
    marginBottom:3, 
    borderRadius:5,
  },
  screeningButtonText: {
    fontSize:14, 
    color:'#f59bdc',
  },
  sc: { 
    width: '90%', 
    alignSelf: 'center', 
    flexDirection: 'row', 
    paddingVertical: 10 
  },
  opacityStyle: { 
    flexDirection: 'row', 
    flex: 1, 
    justifyContent: 'flex-end', 
    alignItems: 'center' 
  }
});

const mapStateToProps = ({ session,milestones }) => ({ session,milestones });
const mapDispatchToProps = { milestonesTable }

export default connect( mapStateToProps, mapDispatchToProps )( HomeScreen );
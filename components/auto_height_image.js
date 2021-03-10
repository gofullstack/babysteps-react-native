import React, { Component } from 'react';
import { View, Image, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

class AutoHeightImage extends Component {
  static defaultProps = {
    width: 0,
    source: '',
  };

  state = {
    width: 0,
    height: 0,
  };

  componentDidMount() {
    const { source, width } = this.props;
    if (width > 0 && source !== '') {
      this.getImageSize(source.uri);
    }
  }

  componentDidUpdate(prevProps) {
    const { source, width } = this.props;
    if (width !== prevProps.width || source !== prevProps.source) {
      this.getImageSize(source.uri);
    }
  }

  getImageSize = async uri => {
    let resultFile = await FileSystem.getInfoAsync(uri);
    if (resultFile.exists) {
      Image.getSize(
        resultFile.uri,
        (height, width) => {
          this.updateDimensionState(width, height);
        },
        (error) => {
          console.log(error);
        },
      );
    }
  };

  updateDimensionState = (xWidth, xHeight) => {
    const fixedSize = this.props.fixedSize;
    if (fixedSize) {
      xHeight = fixedSize;
      xWidth = fixedSize;
    }
    let aspectRatio = xHeight / xWidth;
    //if (Platform.OS === 'ios') {
    // android and ios are returning width & height in reverse
    aspectRatio = xWidth / xHeight;
    //} //I commented out the above block as my tests on android (Samsung Galaxy S7 return in the same order as iOS.)
    const width = this.props.width;
    const height = (width * aspectRatio) + 10;
    this.setState({ width, height });
  };

  render() {
    const { width, height } = this.state;
    const { source, style } = this.props;

    return (
      <View>
        <Image
          key={source.uri}
          source={source}
          style={[style, { width, height }]}
        />
      </View>
    );
  }
}

export default AutoHeightImage;

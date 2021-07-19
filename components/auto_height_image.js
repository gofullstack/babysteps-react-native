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
      this.getImageSize(source);
    }
  }

  componentDidUpdate(prevProps) {
    const { source, width } = this.props;
    if (width !== prevProps.width || source !== prevProps.source) {
      this.getImageSize(source);
    }
  }

  getImageSize = async source => {
    const uri = FileSystem.documentDirectory + source.uri;
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
    const aspectRatio = xHeight / xWidth;
    const width = this.props.width;
    const height = (width * aspectRatio) + 10;
    this.setState({ width, height });
  };

  render() {
    const { width, height } = this.state;
    const { source, style } = this.props;
    const uri = FileSystem.documentDirectory + source.uri;

    return (
      <View style={{ flexGrow: 1 }}>
        <Image
          key={source.filename}
          source={{ uri }}
          style={[style, { width, height }]}
        />
      </View>
    );
  }
}

export default AutoHeightImage;

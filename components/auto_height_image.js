import React, { Component } from 'react';
import { Image, Platform } from 'react-native';

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
    if (this.props.width > 0 && this.props.source !== '') {
      this.getImageSize();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.width !== prevProps.width && this.props.source !== prevProps.source) {
      this.getImageSize();
    }
  }

  getImageSize = async () => {
    const source = this.props.source;
    await Image.getSize(
      source.uri, 
      (height, width) => {
        this.updateDimensionState(width, height);
      },
      (error) => {
        console.log(error);
      },
    );
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

  render = () => {
    const { width, height } = this.state;
    const { source, style } = this.props;
    //console.log("Autoheight Image", width, height)
    return (
      <Image
        source={source}
        style={[style, { width, height }]}
      />
    );
  };
}

export default AutoHeightImage;

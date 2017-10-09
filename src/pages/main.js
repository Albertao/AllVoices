import React, { Component } from 'react';
import { Text } from 'react-native';

class MainScreen extends React.Component {
  render() {
	const {navigate} = this.props.navigation;
    return (
      <Text>Hello world!</Text>
    );
  }
}

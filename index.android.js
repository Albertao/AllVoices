import { AppRegistry } from 'react-native'
import {AppWithNavigationState} from './src/router'
import {Provider} from 'react-redux'
import React, {Component} from 'react'
import configureStore from './src/stores/store';
import { DeviceEventEmitter } from 'react-native';
import './src/utils/storage/init'
import onCompletionEventListener from './src/utils/storage/onCompletionListener'
import {playSong} from './src/utils/playSong'
import SplashScreen from 'react-native-splash-screen'
import {isFirstTime, markSuccess} from 'react-native-update'

const store = configureStore();

if (!__DEV__) {
  global.console = {
    info: () => {},
    log: () => {},
    warn: () => {},
    debug: () => {},
    error: () => {},
  };
}

export default class App extends Component {

  componentDidMount = () => {
    if(isFirstTime) {
      markSuccess()
    }
    SplashScreen.hide()
  	DeviceEventEmitter.addListener('completed', (e) => onCompletionEventListener(e, store.dispatch))
  }

  render () {
    return (
      <Provider store={store}>
        <AppWithNavigationState />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('AllVoices', () => App)
import MainScreen from './pages/main'
import {
  DrawerNavigator,
  StackNavigator,
  addNavigationHelpers,
  NavigationActions
} from 'react-navigation';
import {connect} from 'react-redux'
import {DeviceEventEmitter, BackHandler} from 'react-native'
import React, { Component } from 'react';
import Drawer from './components/drawer'
import XiamiIndex from './pages/xiami'
import NetEaseIndex from './pages/netease'
import NetEaseList from './pages/neList'
import search from './pages/search'
import XiamiList from './pages/xmList'
import QQMusicIndex from './pages/qqmusic'
import QQMusicList from './pages/qqList'
import AboutAllVoices from './pages/about'
import SongList from './pages/songList'
import ListDetail from './pages/listDetail'
import SongDetail from './pages/songDetail'
import Test from './pages/test'
import {playSong} from './utils/playSong'

const NeNavigator = StackNavigator({
    Netease: {screen: NetEaseIndex},
    NetEaseList: {screen: NetEaseList},
    Search: {screen: search},
    SongDetail: {screen: SongDetail}
})

const XmNavigator = StackNavigator({
    Xiami: { screen: XiamiIndex },
    XiamiList: {screen: XiamiList},
    Search: {screen: search},
    SongDetail: {screen: SongDetail}
})

const QQNavigator = StackNavigator({
    QQMusic: {screen: QQMusicIndex},
    QQMusicList: {screen: QQMusicList},
})

const AvNavigator = StackNavigator({
    SongList: {screen: SongList},
    ListDetail: {screen: ListDetail},
    SongDetail: {screen: SongDetail}
}, {
    headerMode: 'none'
})

export const Router = DrawerNavigator({
    XmNav: { screen: XmNavigator },
    NeNav: { screen: NeNavigator },
    QQNav: { screen: QQNavigator },
    AboutAllVoices: {screen: AboutAllVoices},
    AvNav: { screen: AvNavigator },
    // Test: {screen: Test},
}, {
    useNativeAnimations: true,
    animationEnabled: true,
    drawerPosition: 'left', // 抽屉在左边还是右边
    contentComponent: Drawer,  // 自定义抽屉组件
    navigationOptions: {
      title: 'AllVoices',
    }
})

class RouterWithState extends Component {

    componentWillMount() {
        DeviceEventEmitter.addListener('playNext', (e) => {
          storage.load({
            key: 'activeSongList',
            id: 1
          }).then((active) => {
            storage.load({
              key: 'songList',
              id: active.activeId
            }).then((ret) => {
              playSong(ret, 'next', this.props.dispatch)
            })
          })
        })
        DeviceEventEmitter.addListener('playPrev', (e) => {
          storage.load({
            key: 'activeSongList',
            id: 1
          }).then((active) => {
            storage.load({
              key: 'songList',
              id: active.activeId
            }).then((ret) => {
              playSong(ret, 'prev', this.props.dispatch)
            })
          })
        })
    }

    render() {
        return (
          <Router navigation={addNavigationHelpers({
            dispatch: this.props.dispatch,
            state: this.props.nav,
          })} />
        )
    }
}

const mapStateToProps = (state) => ({
  nav: state.navReducer
});

export const AppWithNavigationState = connect(mapStateToProps)(RouterWithState);

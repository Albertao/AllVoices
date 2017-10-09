import React, {Component} from 'react';
import {TouchableHighlight, ActivityIndicator, ImageBackground , ToastAndroid, BackHandler, Text, ScrollView, KeyboardAvoidingView, TouchableNativeFeedback, StatusBar, View,  StyleSheet, Image, TextInput, FlatList} from 'react-native';
import getSongList from '../actions/xiami'
import {connect} from 'react-redux'
import {NavigationActions} from 'react-navigation'
// import { Icon } from 'react-native-elements'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Player from '../components/player'

const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

let offset = 1;

class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.item)
  }

  render () {
    var item = this.props.item
    return (
      <View style={styles.songList}>
        <ImageBackground
          defaultSource={require('../static/cd.png')}
          style={styles.songListPic} 
          source={{uri:item.logo}}>
          <TouchableNativeFeedback onPress={this._onPress}>
          <View style={{
              flex: 1,
              justifyContent: 'center',             
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              width: (width-32)/3,
              height: (width-32)/3
            }}>
            <Text numberOfLines={2} style={styles.songListName}>{item.collect_name}</Text>
          </View>
          </TouchableNativeFeedback>
        </ImageBackground>
      </View>
      
    )
  }
}

class XiamiIndex extends React.Component {

  static navigationOptions = ({navigation}) => {
    const {navigate, dispatch} = navigation
    return {
      title: '虾米',    //设置navigator的title
      header: (
        <View>
          <View style={{height: StatusBar.currentHeight, backgroundColor: '#fa8723'}}></View>
          <Icon.ToolbarAndroid
          navIconName="menu"
          iconSize={30}
          onIconClicked ={() => navigate('DrawerOpen')}
          style={{elevation: 2, height: 56, backgroundColor: '#fa8723'}}
          title={'虾米'}
          actions={
            [
              {iconSize: 30, iconName: 'search', title: '搜索', show: 'always'}
            ]
          }
          onActionSelected={() => navigate('Search')}
          titleColor="#fff"
        />
        </View>
      ),
      // headerLeft: (
      //   <View style={{marginLeft: 15}}>
      //     <TouchableNativeFeedback onPress={() => navigate('DrawerOpen')}>
      //       <Icon 
      //         size={30} 
      //         color="#fff"
      //         name="menu" />
      //     </TouchableNativeFeedback>
      //   </View>
      // ),
      // headerRight: (
      //   <View style={{marginRight: 10}}>
      //     <TouchableNativeFeedback onPress={() => navigate('Search')}>
      //       <Icon 
      //         size={30} 
      //         color="#fff" 
      //         name="search" />
      //     </TouchableNativeFeedback>
      //   </View>
      // ),
      // headerStyle: {height: 60+StatusBar.currentHeight,paddingTop: StatusBar.currentHeight, backgroundColor: '#fa8723'},
      // headerTintColor: '#fff'
    }
  }  

  onPressItem = (item) => {
    this.props.dispatch(NavigationActions.navigate({
      routeName: 'XiamiList',
      params: { 
        id: item.list_id,
        name: item.collect_name,
        curl: item.logo,
        creator: item.user_name
      }
    }))
  }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
    }

    onBackPress = () => {
        if(this.lastBack && this.lastBack + 2000 >= Date.now()) {
          BackHandler.exitApp()
        }
        this.lastBack = Date.now()
        ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT)
        return true
    }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
    this.props.dispatch(getSongList(offset));
    offset += 1 // avoid this function run twice so the list has a repetition
  }

  shouldComponentUpdate(nextProps, nextState) {
    // console.log(nextProps.status.toString() + this.props.status.toString())
    if(nextProps.status != this.props.status ) {
      return true;
    }else {
      return false;
    }
    // return true
  }

  renderLoading() {
    return (
      <View style={{flex: 1, paddingTop: 20}}>
          <ActivityIndicator size="large" color="#fa8723" />
          <Text style={{textAlign: 'center', fontSize: 18, color: 'rgba(0, 0, 0, 0.87)'}}>精彩歌单加载中~</Text>
      </View>
    )
  }

  key_extractor = (item, index) => {
    return index
  }

  dispatchNext = () => {
    offset += 15
    this.props.dispatch(getSongList(offset))
  }

  search = () => {
    this.props.navigation.navigate('Test')
  }

  renderDone() {
    return (
    <View style={{padding: 10}}>
      <FlatList
            ListFooterComponent={this.renderFooter}
            data={this.props.song_lists}
            keyExtractor={this.key_extractor}
            numColumns={3}
            initialNumToRender={15}
            onEndReached={this.dispatchNext}
            onEndReachedThreshold={0.1}
            renderItem={this.renderSongList}
          />
    </View>
    )
  }

  renderFooter = () => {
    return (
      <View style={{flex: 1, justifyContent: 'center', flexDirection: 'row', paddingTop: 10}}>
          <ActivityIndicator size="small" color="#fa8723" />
          <Text style={{textAlign: 'center', fontSize: 15, color: 'rgba(0, 0, 0, 0.54)'}}>更多精彩歌单加载中~</Text>
      </View>
    )
  }

  renderSongList = ({item}) => {
    return (
      <MyListItem
        onPressItem={this.onPressItem}
        item={item} />
    )
  }

  renderFail() {
    return (
      <TouchableNativeFeedback
          background={TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.23)')}
          onPress={() => {offset = 1; this.props.dispatch(getSongList(offset))}}>
      <View style={{padding: 20, height: 58}}>
          <Text style={{textAlign: 'center', fontSize: 18, color: 'rgba(0, 0, 0, 0.87)'}}>
            加载失败了，请点击重试
          </Text>
      </View>
      </TouchableNativeFeedback>
    )
  }

  renderBottom() {
    console.log(this.props.status)
    switch(this.props.status) {
      case 'xm_done':
        return this.renderDone();
        break;
      case 'xm_fail':
        return this.renderFail();
        break;
      case 'xm_doing':
        return this.renderLoading();
        break;
      case 'xm_more':
        return this.renderDone();
        break;
      default:
        return this.renderLoading()
        break
    }
  }

  render() {
    return (
      <View style={styles.layout}>
        <StatusBar backgroundColor='rgba(0, 0, 0, 0.3)' translucent={true} /> 
          <View style={styles.bottom}>
            {this.renderBottom()}
          </View>
          <Player
            navigation={this.props.navigation}
            bgColor="#fff"
            btnColor="#000"
            songNameColor="rgba(0, 0, 0, 0.87)"
            artistColor="rgba(0, 0, 0, 0.54)" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column'
  },
  icon: {
    width: 20,
    height: 20,
    position: 'relative',
    top: 10,
    left: 10,
  },
  iconRight: {
    width: 20,
    height: 20,
    position: 'relative',
    top: 10,
    left: 20,
  },
  songList: {
    height: (width-32)/3+4,
    padding: 2,
    marginBottom: 2
  },
  bottom: {
    height: height-116-StatusBar.currentHeight,
    backgroundColor: '#eee'
  },
  top: {
    padding: 15,
    flexDirection: 'row',
    elevation: 10,
    backgroundColor: '#fa8723',
    height: 100,
  },
  songListName: {
    fontWeight: 'bold',
    textAlign: 'center',
    paddingLeft: 5,
    color: '#fff'
  },
  songListPic: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    width: (width-32)/3,
    height: (width-32)/3,
  },
  searchIcon: {
    elevation: 10,
    position: 'relative',
    flex: 1,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    top: 25,
  },
  search: {
    elevation: 10,
    backgroundColor: '#fff',
    paddingTop:10,
    position: 'relative',
    top: 25,
    flex: 5,
    height: 40,
  },
  playCount: {
    flexDirection: 'row',
    padding: 5,
    position: 'relative',
    bottom: (width-32)/3,
    width: (width-32)/3,
    height: 25,
  }
});


function select(store)
{
  return {
    status: store.getXiamiList.status,
    song_lists: store.getXiamiList.song_lists,
    success: store.getXiamiList.success
  }
}

export default connect(select)(XiamiIndex);
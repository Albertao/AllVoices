import React, {Component} from 'react';
import {Text, ScrollView, KeyboardAvoidingView, TouchableNativeFeedback, StatusBar, View,  StyleSheet, Image, TextInput, FlatList} from 'react-native';
import getSongList from '../actions/qqmusic'
import {connect} from 'react-redux'
import { Icon } from 'react-native-elements'
import Player from '../components/player'

const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

let offset = 0;

class QQMusicIndex extends React.Component {

  static navigationOptions = {
     title: '网易云音乐',    //设置navigator的title
  }

  componentDidMount() {
    this.props.dispatch(getSongList(offset, offset+29));
    offset += 29;
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
    <Text>sadasd</Text>
    );
  }

  key_extractor = (item, index) => {
    return index
  }

  dispatchNext = () => {
    this.props.dispatch(getSongList(offset, offset+29))
    offset += 29
  }

  search = () => {
    this.props.navigation.navigate('NetEaseSearch')
  }

  renderDone() {
    return (
    <View style={{padding: 10}}>
      <FlatList
            data={this.props.song_lists}
            keyExtractor={this.key_extractor}
            numColumns={3}
            initialNumToRender={9}
            onEndReached={this.dispatchNext}
            onEndReachedThreshold={0.1}
            renderItem={this.renderSongList}
          />
    </View>
    )
  }

  renderSongList = ({item}) => {
    let playCount = item.listennum.toString()
    return (
      <TouchableNativeFeedback onPress={() => this.props.navigation.navigate('QQMusicList', 
      { id: item.dissid,
        name: item.dissname,
        curl: item.imgurl,
        creator: item.creator.name
      })}>
        <View style={styles.songList}>
        <FastImage style={styles.songListPic} source={{uri:item.imgurl}} />
        <Image style={styles.playCount} source={require('../static/trans.png')} />
        <View style={{flexDirection: 'row', position: 'relative', bottom:147, left: 5}}>
          <Text style={{color: '#fff', fontSize: 14}}>{playCount.substr(0, playCount.length-3)}万</Text>
        </View>
        <View style={styles.songListNameTrans}>
        <Image style={{width: (width-32)/3}} source={require('../static/trans2.png')}>
          <Text style={styles.songListName}  numberOfLines={1}>{item.dissname}</Text>
        </Image>
        </View>
      </View>
      </TouchableNativeFeedback>
    )
  }

  renderFail() {
    return (<Text>Fail</Text>)
  }

  renderBottom() {
    switch(this.props.status) {
      case 'done':
        return this.renderDone();
        break;
      case 'fail':
        return this.renderFail();
        break;
      case 'doing':
        return this.renderLoading();
        break;
      case 'more':
        return this.renderDone();
        break;
    }
  }

  render() {
    return (
      <View style={styles.layout}>
        <StatusBar backgroundColor='rgba(0, 0, 0, 0.3)' translucent={true} />
          <KeyboardAvoidingView behavior='height'>
            <View style={styles.top}>
                <View style={styles.searchIcon}>
                  <Image source={require('../static/search.png')} style={styles.icon} />
                </View>
                <Text 
                  onPress={this.search}
                  style={styles.search}>
                  请输入您要搜索的内容
                </Text>
                <TouchableNativeFeedback
                      onPress={() => this.props.navigation.navigate('DrawerOpen')}>
                  <View style={styles.searchIcon}>  
                    <Image source={require('../static/menu.png')} style={styles.iconRight} />
                  </View>
                </TouchableNativeFeedback>
            </View>
          </KeyboardAvoidingView>   
          <View style={styles.bottom}>
            {this.renderBottom()}
          </View>
          <Player
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
    height: height-160,
    backgroundColor: '#eee'
  },
  top: {
    padding: 15,
    flexDirection: 'row',
    elevation: 10,
    backgroundColor: '#31c27c',
    height: 100,
  },
  songListNameTrans: {
    position: 'relative',
    bottom: 105,
    height: 60,
    width: (width-32)/3
  },
  songListName: {
    paddingLeft: 5,
    position: 'relative',
    top: 35,
    color: '#fff',
    width: (width-32)/3
  },
  songListPic: {
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
    status: store.getQQMusicList.status,
    song_lists: store.getQQMusicList.song_lists,
    success: store.getQQMusicList.success
  }
}

export default connect(select)(QQMusicIndex);
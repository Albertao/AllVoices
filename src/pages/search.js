import React, {Component} from 'react'
import {LayoutAnimation, ActivityIndicator, NativeModules, BackHandler, ToastAndroid, ScrollView,  KeyboardAvoidingView, StyleSheet, Text, View, StatusBar, Image, TouchableNativeFeedback, FlatList} from 'react-native'
import searchNetease from '../actions/neSearch'
import {NavigationActions} from 'react-navigation'
import searchXiami from '../actions/xmSearch'
import {connect} from 'react-redux'
import neEnc from '../utils/neEnc'
import {Header, SearchBar, List, ListItem} from 'react-native-elements'
import Modal from 'react-native-modalbox'
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import getNeteaseSongDetail from "../actions/neDetail"
import Player from '../components/player'
import * as stypes from '../utils/storage/StorageTypes'

const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

let offset = 0

class Search extends Component {
	constructor(props) {
		super(props)
		this.state = {
			source: 'ne', // ne, xm or TBD
			offset: 0,
			storageSongLists: [],
			selectedSong: {},
			text: ''
		}
	}

	static navigationOptions = ({navigation}) => {
		return {
			title: '搜索',
			header: null
		}
	}

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
    }

    onBackPress = () => {
        const { dispatch, nav } = this.props;
        dispatch(NavigationActions.back())
        return true
    };

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
		storage.getAllDataForKey('songList').then((data) => {
			var arr = []
			storage.getIdsForKey('songList').then((ids) => {
				data.map((item, index) => {
					arr.push({
						name: item.name,
						id: ids[index]
					})
				})
			})
			this.setState({storageSongLists: arr})
		})
	}	

	artistName = (artists) => {
		var arName = ''
		artists.map((ar, i) => {
			arName += ar.name + (i+1 === artists.length ? '' : '/')
		})
		return arName
	}

	getNeSongUrl = (item) => {
		var info = this.artistName(item.artists)
		storage.load({
			key: 'songList',
			id: 1
		}).then((ret) => {
			var song = {
				song_id: item.id,
				source: stypes.NETEASE,
				song_name: item.name,
				artist_name: info,
				album_pic:item.album.blurPicUrl,
				playing: true
			}
			ret.songs.splice(ret.index, 0, song)
			storage.save({
				key: 'songList',
				id: 1,
				data: ret
			})
		})
		item.info = info
		var obj = {ids: [item.id], br: 12800, csrf_token: ''}
		this.props.dispatch(getNeteaseSongDetail(neEnc(obj), item))
	}

	getXmSongUrl = (item) => {
		storage.load({
			key: 'songList',
			id: 1
		}).then((ret) => {
			var song = {
				song_id: item.song_id,
				source: stypes.XIAMI,
				song_name: item.song_name,
				artist_name: item.artist_name,
				album_pic:item.album_logo,
			}
			ret.songs.splice(ret.index, 0, song)
			storage.save({
				key: 'songList',
				id: 1,
				data: ret
			})
			song.song_url = item.listen_file
			console.log(song)
			NativeModules.MusicService.play(song)
		})
	}

	renderLoading() {
	  	return (
			<View style={{flex: 1, paddingTop: 20}}>
		        <ActivityIndicator size="large" color="#c20c0c" />
		        <Text style={{textAlign: 'center', fontSize: 18, color: 'rgba(0, 0, 0, 0.87)'}}>精彩歌曲加载中~</Text>
		    </View>
	  	);
	}

	renderXmSearchSongs(item) {
		return (
		<TouchableNativeFeedback onPress={() => this.getXmSongUrl(item)}>	
			<ListItem
			    roundAvatar
			    avatar={{uri:item.album_logo}}
			    rightIcon={{name: 'add'}}
			    onPressRightIcon={() => {
			    this.refs.modal.open()
				var obj = {
					song_id: item.song_id,
					source: stypes.XIAMI,
					song_name: item.song_name,
					artist_name: item.artist_name,
					album_pic: item.album_logo
				}
				this.setState({selectedSong: obj})
			    }}
			    title={item.song_name}
			    subtitle={item.artist_name}
			 />
		</TouchableNativeFeedback>
		)
	}

	renderNeSearchSongs(item) {
		return (
		<TouchableNativeFeedback onPress={() => this.getNeSongUrl(item)}>	
			<ListItem
			    roundAvatar
			    avatar={{uri:item.album.blurPicUrl}}
			    rightIcon={{name: 'add'}}
			    onPressRightIcon={() => {
			    this.refs.modal.open()
				var obj = {
					song_id: item.id,
					source: stypes.NETEASE,
					song_name: item.name,
					artist_name: this.artistName(item.artists),
					album_pic: item.album.blurPicUrl
				}
				this.setState({selectedSong: obj})
			    }}
			    title={item.name}
			    subtitle={this.artistName(item.artists)}
			 />
		</TouchableNativeFeedback>
		)
	}

	renderSearchSongs = ({item}) => {
		switch(this.state.source) {
			case 'ne':
				return this.renderNeSearchSongs(item)
				break
			case 'xm':
				return this.renderXmSearchSongs(item)
		}
	}

	renderDone() {
		return (
			<View style={{height: height}}>
			<FlatList
			  keyExtractor={this.key_extractor}
			  data={this.props[this.state.source].result}
			  renderItem={this.renderSearchSongs}
			  initialNumToRender={15}
			  onEndReached={() => {
				this.setState({offset: this.state.offset + 20})
			  	this.search(this.state.offset, false)
			  }}
			  onEndReachedThreshold={0.1}>
			</FlatList>
			</View>
		)
	}

	renderFail() {
		return (<View style={{height: height-138}}><Text>failed.</Text></View>)
	}

	renderInit() {
		return (
			<View style={{height: height-138, flex: 1, alignItems: 'center'}}>
				<Text style={{marginTop: 20, fontSize: 20, color: 'rgba(0, 0, 0, 0.87)'}}>请输入搜索内容</Text>
			</View>
		)
	}

	renderModal() {
		return (
			<Modal 
			  style={styles.modal} 
			  position={"bottom"} 
			  ref={"modal"}
			  backButtonClose={true}
			  swipeArea={300}>
		      <ScrollView style={{flex: 1, height: 300}}>
				<List containerStyle={{marginTop: 0, marginBottom: 20}}>
				  {
				    this.state.storageSongLists.map((l, i) => (
				      <ListItem
				      	key={i}
				        title={l.name}
				        onPress={() => {
				        	storage.load({
				        		key: 'songList',
				        		id: l.id
				        	}).then((ret) => {
				        		ret.songs.push(this.state.selectedSong)
				        		storage.save({
				        			key: 'songList',
				        			id: l.id,
				        			data: ret
				        		}).then((res) => {
				        			ToastAndroid.show('添加成功', ToastAndroid.SHORT)
				        			this.refs.modal.close()
				        		})
				        	})
				        }}
				        rightIcon={{name: 'done'}}
				      />
				    ))
				  }
				</List>
		      </ScrollView>
		    </Modal>
		)
	}

	renderBottom() {
		switch(this.state.source) {
			case 'ne':
				switch(this.props.ne.status) {
					case 'doing': 
						return this.renderLoading();
						break;
					case 'done':
						return this.renderDone();
						break;
					case 'fail': 
						return this.renderFail();
						break;
					case 'more':
						return this.renderDone()
					case 'init': 
						return this.renderInit();
						break;
					case 'new_done':
						return this.renderDone()
						break;
				}
				break;
			case 'xm' :
				switch(this.props.xm.status) {
					case 'doing': 
						return this.renderLoading();
						break;
					case 'done':
						return this.renderDone();
						break;
					case 'fail': 
						return this.renderFail();
						break;
					case 'more':
						return this.renderDone()
					case 'init': 
						return this.renderInit();
						break;
					case 'new_done':
						return this.renderDone()
						break;
				}
				break
		}
	}

	key_extractor = (item, index) => {
		return index
	}

	changeText = (text) => {
		this.setState({text})
	}

	search = (offset, isNew) => {
		if(this.state.text == '') {
			ToastAndroid.show('您尚未输入任何内容呢~', ToastAndroid.SHORT)
		}else {
			switch(this.state.source) {
				case 'ne':
					var obj = {s: this.state.text, offset: offset, limit: 20, type: 1}
					this.props.dispatch(searchNetease(obj, isNew))
					break;
				case 'xm':
					var obj = {kw: this.state.text, page: Math.floor(offset/20)+1}
					this.props.dispatch(searchXiami(obj, isNew))
					break;
			}
		}
	}

	render() {
		return (
			<View style={{flex: 1}}>
			<StatusBar translucent={true} backgroundColor='rgba(0, 0, 0, 0.3)' />
			<View style={{elevation: 2, paddingTop: StatusBar.currentHeight, backgroundColor: '#e1e8ee'}}>
				<SearchBar 
				containerStyle={{height:58}}
				lightTheme
				placeholder='请输入搜索内容'
				onChangeText={this.changeText}
				onSubmitEditing={() => this.search(0, true)} />
			</View>
			{this.renderBottom()}
			{this.renderModal()}
			{this.renderFAB()}
			</View>
		)
	}

	renderFAB() {
		return (
		<ActionButton fixNativeFeedbackRadius={true} style={{elevation: 5}} buttonColor="rgba(26,188,156,1)">
          <ActionButton.Item buttonColor='#c20c0c' title="netEase" onPress={() => {
          	this.setState({source: 'ne'})
          	this.search(0, true)
          }}>
            <Image style={{width: 15, height: 15}} source={require('../static/nelogoTransparent.png')}/>
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#fa8723' title="Xiami" onPress={() => {
          	this.setState({source: 'xm'})
          	this.search(0, true)
          }}>
            <Image style={{width: 15, height: 15}} source={require('../static/xmlogoTransparent.png')} />
          </ActionButton.Item>
        </ActionButton>
		)
	}
}

const styles = StyleSheet.create({
	top: {
		
	},
	modal: {
		height: 300
	}
})

function select (store) {
	return {
		ne: {
			status: store.neteaseSearch.status,
			success: store.neteaseSearch.success,
			result: store.neteaseSearch.search_result
		},
		xm: {
			status: store.xiamiSearch.status,
			success: store.xiamiSearch.success,
			result: store.xiamiSearch.search_result
		}
	}
}

export default connect(select)(Search)

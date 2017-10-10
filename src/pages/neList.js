import React, {Component} from 'react'
import {ActivityIndicator, BackHandler, FlatList, ToastAndroid, StyleSheet, Text, TextInput, View, StatusBar, Image, TouchableNativeFeedback, ScrollView} from 'react-native'
import getNeteaseListDetail from '../actions/neList'
import getNeteaseSongDetail from '../actions/neDetail'
import {connect} from 'react-redux'
import {NavigationActions} from 'react-navigation'
import {List, ListItem} from 'react-native-elements'
import { Icon, Tile, Button } from 'react-native-elements'
import neEnc from '../utils/neEnc'
import Player from '../components/player'
import * as stypes from '../utils/storage/StorageTypes'
import Modal from 'react-native-modalbox'

const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

class NetEaseList extends Component {

	static navigationOptions = {
		header: null
	}

	constructor(props) {
		super(props)
		this.state = {
			storageSongLists: [],
			selectedSongId: {},
			newListName: this.props.navigation.state.params.name
		}
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
		storage.getAllDataForKey('songList').then((data) => {
			var arr = []
			storage.getIdsForKey('songList').then((ids) => {
				data.map((item, index) => {
					arr.push({
						songCount: item.songs.length,
						name: item.name,
						id: ids[index]
					})
				})
				this.setState({storageSongLists: arr})
			})
		})
		let id = this.props.navigation.state.params.id
		this.props.dispatch(getNeteaseListDetail(id))
	}	

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
	}

	onBackPress = () => {
		const {dispatch} = this.props
		dispatch(NavigationActions.back())
		return true
	}

	_key_extractor = (item) => {
		return item.song_id
	}

	renderTracks() {
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
	  	}
	}

	artistName = (artists) => {
		var arName = ''
		artists.map((ar, i) => {
			arName += ar.name + (i+1 === artists.length ? '' : '/')
		})
		return arName
	}

	getSongUrl = (item, index) => {
		var currentSongList = {
			name: '播放列表',
			index: index,
			type: stypes.SONG_LIST_LOOP,
			songs: this.props.song_list
		}
		storage.save({
			key: 'activeSongList',
			id: 1,
			data: {activeId: 1, activeIndex: index}
		})
		storage.save({
			key: 'songList',
			id: 1,
			data: currentSongList
		})
		var obj = {ids: [item.song_id], br: 12800, csrf_token: ''}
		item.info = item.artist_name
		this.props.dispatch(getNeteaseSongDetail(neEnc(obj), item))
	}

	renderDone() {
		return (
			<View style={{height: height-310}}>
			<FlatList
			  ListFooterComponent={this.renderFooter}
			  keyExtractor={this._key_extractor}
			  data={this.props.song_list}
			  renderItem={this.renderListSongs}>
			</FlatList>
			</View>
		)
	}

	renderFooter = () => {
		return (
		  <View style={{flex: 1, justifyContent: 'center', flexDirection: 'row', padding: 10}}>
	          <ActivityIndicator size="small" color="#fa8723" />
	          <Text style={{textAlign: 'center', fontSize: 15, color: 'rgba(0, 0, 0, 0.54)'}}>更多歌曲加载中~</Text>
	      </View>
		)
	}

	renderListSongs = ({item, index}) => {
		return (
		<TouchableNativeFeedback onPress={() => this.getSongUrl(item, index)}>
			<ListItem
			    roundAvatar
			    avatar={{uri:item.album_pic}}
			    title={item.song_name}
			    rightIcon={{name: 'add'}}
			    onPressRightIcon={() => {
			    	item.souce = stypes.NETEASE
				    this.setState({selectedSong: item})
				    this.refs.modal.open()
				}}
			    subtitle={item.artist_name}
			/>
		</TouchableNativeFeedback>  
		)
	}

	renderSong = ({item}) => {
		return (
			<View style={styles.song}>
				<Text numberOfLines={1} style={styles.songName}>{item.name}</Text>
				<Text numberOfLines={1} style={styles.songInfo}>
					{item.artists.map((artist, index) => {return artist.name + (index+1 == item.artists.length ? '' : '/')})} - {item.album.name}
				</Text>
			</View>
		)
	}

	renderLoading() {
		return (
			<View style={{height:height-310}}>
				<View style={{padding: 20, flexDirection: 'row', justifyContent: 'center'}}>
				  <ActivityIndicator size="small" color="#fa8723" />
		          <Text style={{textAlign: 'center', fontSize: 15, color: 'rgba(0, 0, 0, 0.54)'}}>
		          精彩歌单加载中~
		          </Text>
				</View>
			</View>
		)
	}

	renderFail() {
		return (
			<View style={{height:height-310}}>
			<TouchableNativeFeedback
				onPress={() => {
					let id = this.props.navigation.state.params.id
					this.props.dispatch(getNeteaseListDetail(id))
				}}
				background={TouchableNativeFeedback.Ripple('rgba(0, 0, 0, 0.23)')}>
			<View style={{padding: 20, height: 56}}>
				<Text style={{textAlign: 'center', fontSize: 16, color: 'rgba(0, 0, 0, 0.87)'}}>
		            加载失败了，请点击重试
		        </Text>
	        </View>
			</TouchableNativeFeedback>
			</View>
		)
	}

	renderCard() {
		let params = this.props.navigation.state.params
		return (
			<View>
				<Tile
				   imageSrc={{uri: params.curl}}
				   title={params.name}
				   onPress={this.showCollectModal}
				   featured
				   caption={"Author: " + params.creator}
				/>
			</View>
		)
	}

	showCollectModal = () => {
		this.refs.collectModal.open()
	}

	renderModal() {
		return (
			<Modal 
			  coverScreen={true}
			  style={styles.modal} 
			  position={"bottom"} 
			  ref={"modal"}
			  backButtonClose={true}
			  swipeArea={300}>
		      <ScrollView style={{flex: 1, height: 300}}>
				<List containerStyle={{marginTop: 0, marginBottom: 20}}>
				  {
				    this.state.storageSongLists.map((l, i) => (
				      <TouchableNativeFeedback key={i}
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
				        }}>
				      <ListItem
				      	key={i}
				        title={l.name}
				        subtitle={l.songCount + '首'}
				      />
				      </TouchableNativeFeedback>
				    ))
				  }
				</List>
		      </ScrollView>
		    </Modal>
		)
	}

	renderCollectModal() {
		return(
			<Modal
			  coverScreen={true}
			  style={{height: 300, justifyContent: 'center', alignItems: 'center'}}
			  position={"center"}
			  backButtonClose={true}
			  swipeArea={300}
			  ref={"collectModal"}>
			  	<Text>歌单收藏名称：</Text>
			  	<TextInput
		      		placeholder="请输入歌单名称"
		      		style={{width: 200}}
        			onChangeText={(text) => this.setState({newListName: text})}
        			value={this.state.newListName}
      			/>
				<View style={{flexDirection: 'row', marginTop: 20}}>
				<Button
				  raised
				  onPress={this.collectSongList}
				  icon={{name: 'done'}}
				  backgroundColor='#2096f3'
				  title='确定' />
				<Button
				  raised
				  onPress={() => this.refs.collectModal.close()}
				  icon={{name: 'close'}}
				  title='取消' />
				</View>
			</Modal>
		)
	}

	collectSongList = () => {
		if(this.state.newListName != '') {
			storage.getIdsForKey('songList').then((ids) => {
				if(ids.length == 0) {
					var index = 2
				} else {
					var index = ids[ids.length-1] + 1
				}
				storage.save({
					key: 'songList',
					id: index,
					data: {
						songs: this.props.song_list,
						name: this.state.newListName,
						index: 0,
						type: stypes.SONG_LIST_LOOP
					}
				}).then((ret) => {
					this.refs.collectModal.close()
				})
			})
		}else {
			ToastAndroid.show('您尚未输入歌单名称', ToastAndroid.SHORT)
		}
	}

	render() {
		return (
			<View style={styles.layout}>
		      	<StatusBar backgroundColor='rgba(0, 0, 0, 0.3)' translucent={true} />
		      	{this.renderModal()}  
		      	{this.renderCollectModal()}
		      	<View style={styles.card}>
					{this.renderCard()}
		      	</View>
		      	<View>
		      		{this.renderTracks()}
		      	</View>
		      	<Player
		      	  navigation={this.props.navigation}
		      	  bgColor="#fff"
		      	  btnColor="#000"
		      	  songNameColor="rgba(0, 0, 0, 0.87)"
		      	  artistColor="rgba(0, 0, 0, 0.54)" />
		    </View>
		)
	}
}

const styles = StyleSheet.create({
	card: {
		elevation: 10,
		height: 250
	},
	song: {
		height: 55,
		paddingTop: 7,
		paddingLeft: 15,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0, 0, 0, 0.23)'
	},
	songName: {
		width: 350,
		color: 'rgba(0, 0, 0, 0.87)',
		fontSize: 15,
	},
	songInfo: {
		width: 350,
		color: 'rgba(0, 0, 0, 0.54)',
		fontSize: 13
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 30
	},
	creator: {
		color: '#fff',
		marginLeft: 10,
		fontSize: 13,
		lineHeight: 22
	},
	songListName: {
		color: '#fff',
		width: 230,
		fontSize: 17,
		marginBottom: 35,
	},
	bar: {
		flexDirection: 'row',
		paddingTop: 15,
		paddingLeft: 15
	},
	cardDetail: {
		flexDirection: 'row',
		padding: 15,
	},
	coverImg: {
		width: 150,
		height: 150
	},
	cardRight: {
		padding: 15,
		flexDirection: 'column',
	},
	modal: {
		height: 300,
		backgroundColor: '#dedede'
	}
});

function select(store) {
	return {
		status: store.getNeteaseListDetail.status,
		success: store.getNeteaseListDetail.success,
		song_list: store.getNeteaseListDetail.song_list,
		song_url_lists: store.getNeteaseSongDetail.song_list
	}
}

export default connect(select)(NetEaseList)
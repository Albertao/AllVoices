import React, {Component} from 'react'
import {ImageBackground, ActivityIndicator, BackHandler, FlatList, ToastAndroid, NativeModules, StyleSheet, Text, TextInput, View, StatusBar, Image, TouchableNativeFeedback, ScrollView} from 'react-native'
import getXiamiListDetail from '../actions/xmList'
import {connect} from 'react-redux'
import {NavigationActions} from 'react-navigation'
import {List, ListItem} from 'react-native-elements'
import { Icon, Button } from 'react-native-elements'
import Modal from 'react-native-modalbox'
import xmEnc from '../utils/xmEnc'
import Player from '../components/player'
import * as types from '../actions/ActionTypes'
import * as stypes from '../utils/storage/StorageTypes'


const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

class XiamiList extends Component {

	constructor(props) {
		super(props)
		this.state = {
			newListName: this.props.navigation.state.params.name,
			storageSongLists: [],
			selectedSongId: {}
		}
	}

	static navigationOptions = {
		header: null
	}

	componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
    }

    onBackPress = () => {
    	const {dispatch} = this.props
        dispatch(NavigationActions.back())
        return true
    };

	componentWillMount() {
		// BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
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
		this.props.dispatch(getXiamiListDetail(id))
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

	playSong = (item, index) => {
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
		NativeModules.MusicService.play(item)
		this.props.dispatch({'type': types.SET_XM_PLAYER_DETAIL, data: item})
	}

	renderDone() {
		return (
			<View style={{height: height-60}}>
			<FlatList
			  ListHeaderComponent={
			  	<View style={{backgroundColor: 'rgba(0, 0, 0, 0.33)'}}>
					<View style={{height: StatusBar.currentHeight}}></View>
				 	   {this.renderCard()}
				</View>
			  }
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
			<TouchableNativeFeedback onPress={() => this.playSong(item, index)}>
			  <ListItem
			  	containerStyle={{backgroundColor: 'rgba(255,255,255,0.2)'}}
			    roundAvatar
			    avatar={{uri:item.album_pic}}
			    titleStyle={{color: 'rgba(0,0,0,0.87)'}}
			    subtitleStyle={{color: 'rgba(0, 0, 0, 0.54)'}}
			    rightIcon={{name: 'add', color: 'rgba(0, 0, 0, 0.6)'}}
			    onPressRightIcon={() => {
					this.setState({selectedSong: item})
					this.refs.modal.open()
			    }}
			    title={item.song_name}
			    subtitle={item.artist_name}
			  />
			</TouchableNativeFeedback>  
		)
	}

	renderLoading() {
		return (
			<View style={{backgroundColor: 'rgba(255,255,255,0.2)', height:height-60}}>
				<View style={{backgroundColor: 'rgba(0, 0, 0, 0.33)'}}>
					<View style={{height: StatusBar.currentHeight}}></View>
				    {this.renderCard()}
				</View>
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
			<View style={{height:height-60}}>
			<TouchableNativeFeedback
				onPress={() => {
					let id = this.props.navigation.state.params.id
					this.props.dispatch(getXiamiListDetail(id))
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
			<View style={{
				width: width,
				height: 0.2*height,
				backgroundColor: 'rgba(0, 0, 0, 0.3)',
				justifyContent: 'center',
				alignItems: 'center'
			}}>
				<Text numberOfLines={1} style={{
					textAlign: 'center',
					width: 0.6*width,
					marginBottom: 10,
					color: 'white',
					fontSize: 25
				}}>{params.name}</Text>
				<View style={{
					borderWidth: 1,
					borderColor: 'white',
					padding: 5,
					borderRadius: 5
				}}>
					<Text style={{color: 'white'}}>{'Author: ' + params.creator}</Text>
				</View>
			</View>
			<View style={{
				width: width,
				height: 0.1*height,
				backgroundColor: 'rgba(0, 0, 0, 0.3)',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<TouchableNativeFeedback onPress={this.showModal}>
					<View style={{
					  	flex: 1,
					  	width: 0.5*width,
					  	height: 0.1*height,
					  	justifyContent: 'center',
					  	alignItems: 'center'
					}}>
						<Icon name="star" color="#fff" />
						<Text style={{color: '#fff'}}>收藏歌单</Text>
					</View>
				</TouchableNativeFeedback>
				<TouchableNativeFeedback 
				  onPress={() => {
				  	if(this.props.status != 'done') {
				  		ToastAndroid.show('歌单正在加载中', ToastAndroid.SHORT)
				  	}else {
				  		this.playSong(this.props.song_list[0], 0)
				  	}
				  }}>
				  	<View style={{
				  		flex: 1,
					  	width: 0.5*width,
					  	height: 0.1*height,
					  	justifyContent: 'center',
					  	alignItems: 'center'
				  	}}>
				  		<Icon name="play-arrow" color="#fff" />
						<Text style={{color: '#fff'}}>播放歌单</Text>
					</View>
				</TouchableNativeFeedback>
			</View>
			</View>
		)
	}

	showModal = () => {
		this.refs.collectModal.open()
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
					ToastAndroid.show('收藏成功！', ToastAndroid.SHORT)
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
		      	<ImageBackground 
		      	  source={{uri:this.props.navigation.state.params.curl}}
		      	  style={{width: width, height: height}}
		      	  blurRadius={5} >
			      	<View>
			      		{this.renderTracks()}
			      	</View>
			      	<Player
			      	  navigation={this.props.navigation}
			      	  bgColor="rgba(255,255,255,0.6)"
			      	  btnColor="#000"
			      	  songNameColor="rgba(0, 0, 0, 0.87)"
			      	  artistColor="rgba(0, 0, 0, 0.54)" />
		      	</ImageBackground>
		      	{this.renderModal()}  
		      	{this.renderCollectModal()}
		    </View>
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
				        }} >
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
		backgroundColor: '#ededed'
	}
});

function select(store) {
	return {
		status: store.getXiamiListDetail.status,
		success: store.getXiamiListDetail.success,
		song_list: store.getXiamiListDetail.song_list
	}
}

export default connect(select)(XiamiList)
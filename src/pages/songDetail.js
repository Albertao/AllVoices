import React, {Component} from 'react'
import {Clipboard, Easing, Animated, BackHandler, ScrollView, FlatList, DeviceEventEmitter, NativeModules, ProgressBar, TouchableNativeFeedback, StyleSheet, ToastAndroid, StatusBar, ImageBackground, Image, View, Text} from 'react-native'
import {connect} from 'react-redux'
import Icon from 'react-native-vector-icons/MaterialIcons'
import {ListItem, Button, Slider} from 'react-native-elements'
import {NavigationActions} from 'react-navigation'
import * as types from '../actions/ActionTypes'
import * as stypes from '../utils/storage/StorageTypes'
import {playSong, playSourceSong} from '../utils/playSong'
import Modal from 'react-native-modalbox'
import * as WeChat from 'react-native-wechat';

const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

class SongDetail extends Component {

	static navigationOptions = ({navigation}) => {
		return {
			header: null
		}
	}

	constructor(props) {
		super(props)
		animation: null,
		this.state = {
			rotationDeg: new Animated.Value(0),
			value: 0,
			current: '0:00',
			duration: '--:--',
			song_list: [],
			song_list_id: 1,
			mode: stypes.SONG_LIST_LOOP
		}
	}

	componentDidMount() {
		this.animation = Animated.loop(Animated.timing(this.state.rotationDeg, {
			toValue: 360,
			duration: 20000,
			easing: Easing.linear
		}))
		if(this.props.playing) {
			this.animation.start()
		}
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
    }

	componentWillMount() {
		storage.load({
			key: 'activeSongList',
			id: 1
		}).then((active) => {
			storage.load({
				key: 'songList',
				id: active.activeId
			}).then((ret) => {
				console.log(ret.type)
				this.setState({
					mode: ret.type,
					song_list_id: active.activeId,
					song_list: ret.songs
				})
			})
		})
		DeviceEventEmitter.addListener('playerProgress', this.moveProgress)
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
		DeviceEventEmitter.removeListener('playerProgress', this.moveProgress)
	}

	onBackPress = () => {
    	const {dispatch} = this.props
        dispatch(NavigationActions.back())
        return true
    };

	moveProgress = (e) => {
		this.setState({
			value: e.current/e.duration,
			current: this.convertTime(e.current),
			duration: this.convertTime(e.duration)
		})
	}

	convertTime(time) {
		var seconds = time/1000
		var Minutes = Math.floor(seconds/60)
		var Second = Math.floor(seconds%60)
		if(Second < 10) {
			Second = '0' + Second
		}
		return Minutes + ':' + Second
	}

	nextSong = () => {
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
	}

	prevSong = () => {
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
	}

	playOrPause = () => {
		if(this.props.playing) {
			this.animation.stop()
			NativeModules.MusicService.pause()
			this.props.dispatch({'type':types.SET_PLAYER_PAUSE})
		}else {
			this.animation = Animated.loop(Animated.timing(this.state.rotationDeg, {
				toValue: 360,
				duration: 20000,
				easing: Easing.linear
			}))
			this.animation.start()
			NativeModules.MusicService.resume()
			this.props.dispatch({'type':types.SET_PLAYER_RESUME})
		}
	}

	copyUrl = () => {
		var songUrl = this.props.songUrl
		Clipboard.setString(songUrl)
		ToastAndroid.show('已将歌曲链接复制到剪贴板', ToastAndroid.SHORT)
	}

	shareMusicToTimeline = () => {
		if(this.props.status != 'done') {
			ToastAndroid.show('歌曲信息加载中……', ToastAndroid.SHORT)
		}
		WeChat.isWXAppInstalled().then((isInstalled) => {
			if(isInstalled) {				
				WeChat.shareToTimeline({
					title: this.props.songName,
					description: this.props.artiseName,
					thumbImage: this.props.albumPic,
					type:'audio',
					musicUrl:this.props.songUrl
				}).then((e) => {
					console.log(e)
				}).catch((error) => {
					ToastAndroid.show(error.message, ToastAndroid.SHORT)
				})
			}else {
				ToastAndroid.show('该手机尚未安装微信，请前往应用市场下载！', ToastAndroid.SHORT)
			}
		})
	}

	shareMusic = () => {
		// if(this.props.status != 'done') {
		// 	ToastAndroid.show('歌曲信息加载中……', ToastAndroid.SHORT)
		// }
		// WeChat.isWXAppInstalled().then((isInstalled) => {
		// 	if(isInstalled) {
		// 		WeChat.shareToSession({
		// 			title: this.props.songName,
		// 			description: this.props.artiseName,
		// 			thumbImage: this.props.albumPic,
		// 			type:'audio',
		// 			musicUrl: this.props.songUrl,
		// 			webpageUrl:'http://baidu.com/'
		// 		}).then((errCode) => {
					
		// 		})
		// 	}else {
		// 		ToastAndroid.show('该手机尚未安装微信，请前往应用市场下载！', ToastAndroid.SHORT)
		// 	}
		// })
		ToastAndroid.show('由于微信原因，该功能暂不可用', ToastAndroid.SHORT)
	}

	changeMode = () => {
		storage.load({
			key: 'activeSongList',
			id: 1
		}).then((active) => {
			storage.load({
				key: 'songList',
				id: active.activeId
			}).then((ret) => {
				switch(ret.type) {
					case stypes.SONG_LIST_LOOP:
						ret.type = stypes.RANDOM_LOOP
						break
					case stypes.RANDOM_LOOP:
						ret.type = stypes.SINGLE_SONG_LOOP
						break
					case stypes.SINGLE_SONG_LOOP:
						ret.type = stypes.SONG_LIST_LOOP
						break
				}
				this.setState({
					mode: ret.type
				})
				storage.save({
					key: 'songList',
					id: active.activeId,
					data: ret
				})
			})
		})
	}

	getPlayMode() {
		switch(this.state.mode) {
			case stypes.SONG_LIST_LOOP:
				return "repeat"
				break
			case stypes.RANDOM_LOOP:
				return "shuffle"
				break
			case stypes.SINGLE_SONG_LOOP:
				return "repeat-one"
				break
		}
	}

	render() {
		return (
			<View>
				<StatusBar backgroundColor='rgba(0, 0, 0, 0)' translucent={true} />
				<ImageBackground
				source={{uri: this.props.albumPic}}
				style={{width: width, height: height}}
				blurRadius={5}
				>
				<View style={{backgroundColor: 'rgba(0, 0, 0, 0.33)'}}>
					<View style={{height: StatusBar.currentHeight}}></View>
			        <Icon.ToolbarAndroid
			          navIconName="navigate-before"
			          iconSize={30}
			          onIconClicked ={() => this.props.navigation.goBack()}
			          style={{
			          	elevation: 2, 
			          	height: 60,
			          }}
			          title={this.props.songName}
			          subtitle={this.props.artiseName}
			          subtitleColor='rgba(255, 255, 255, 0.54)'
			          actions={
			            [
			              {iconSize: 25, iconName: 'share', title: '分享', show: 'always'}
			            ]
			          }
			          onActionSelected={() => {this.refs.shareModal.open()}}
			          titleColor="#fff"
			        />
			        <View style={styles.cdWrapper}>
			        	<Animated.View style={
			        		{
			        			width:0.705*width,
			        			height: 0.705*width,
			        			borderRadius: 0.705*width,
			        			justifyContent: 'center',
			        			alignItems: 'center',
			        			backgroundColor: 'rgba(255,255,255,0.3)',
			        	  		transform: [
			        	  			{
			        	  				rotateZ: this.state.rotationDeg.interpolate({
			        	  					inputRange: [0, 360],
			        	  					outputRange: ['0deg', '360deg']
			        	  				})
			        	  			}
			        	  		]
			        	  	}
			        	}>
			        	<ImageBackground 
			        	  source={require('../static/disk.png')}
			        	  style={styles.disk}>
			        		<View style={{elevation: 2}}>
				        		<Image
								  style={styles.cd}
								  source={{uri: this.props.albumPic}}
								/>
			        		</View>
			        	</ImageBackground>
			        	</Animated.View>
			        </View>
			        <View style={styles.bottomButtons}>
			        	<View style={{justifyContent: 'center'}}>
							<View style={{justifyContent: 'center', alignItems: 'center'}}>
				        		<Text style={styles.time}>{this.state.current}</Text>
				        	</View>
				        	<Slider
								style={styles.progress}
								value={this.state.value}
								thumbTintColor="#fff"
								minimumTrackTintColor="#31c27c"
								onValueChange={(value) => this.setState({value:value})}
								onSlidingComplete={() => 
									NativeModules.MusicService.seekTo({progress: this.state.value})
								} />
							<View style={{justifyContent: 'center', alignItems: 'center'}}>
				        		<Text style={styles.time}>{this.state.duration}</Text>
				        	</View>
			        	</View>
			        	<View style={styles.buttonGroup}>
							<TouchableNativeFeedback
							onPress={this.changeMode}
							background={TouchableNativeFeedback.SelectableBackgroundBorderless()}>
								<View style={styles.playmode}>
									<Icon color="#f5f5f5" size={25} name={this.getPlayMode()} />
								</View>
							</TouchableNativeFeedback>
							<TouchableNativeFeedback
							onPress={this.prevSong}
							background={TouchableNativeFeedback.SelectableBackgroundBorderless()}>
								<View style={styles.prev}>
									<Icon color="#f5f5f5" size={40} name='skip-previous' />
								</View>
							</TouchableNativeFeedback>
							<TouchableNativeFeedback
							onPress={this.playOrPause}
							background={TouchableNativeFeedback.SelectableBackgroundBorderless()}>
								<View style={styles.playing}>
									<Icon color="#f5f5f5" size={50} name={this.props.playing ? 'pause' : 'play-arrow'} />
								</View>
							</TouchableNativeFeedback>
							<TouchableNativeFeedback
							onPress={this.nextSong}
							background={TouchableNativeFeedback.SelectableBackgroundBorderless()}>
								<View style={styles.next}>
									<Icon color="#f5f5f5" size={40} name='skip-next' />
								</View>
							</TouchableNativeFeedback>
							<TouchableNativeFeedback
							onPress={() => {
								this.refs.modal.open()
							}}
							background={TouchableNativeFeedback.SelectableBackgroundBorderless()}>
								<View style={styles.playlist}>
									<Icon color="#f5f5f5" size={25} name='playlist-play' />
								</View>
							</TouchableNativeFeedback>
			        	</View>
			        </View>
			    </View>
				</ImageBackground>
				{this.renderShareModal()}
				{this.renderModal()}
			</View>
		)
	}

	renderSongList = ({item, index}) => {
		return (
			<TouchableNativeFeedback key={index} onPress={() => this.playSong(item, index)}>
			<ListItem
				containerStyle={{
					backgroundColor: 'rgba(0,0,0,0.3)',
					borderBottomWidth: 0
				}}
				titleStyle={{color: "rgba(255,255,255,0.87)"}}
				key={index}
				title={item.song_name}
				subtitle={item.artist_name} />
			</TouchableNativeFeedback>
		)
	}

	playSong = (item, index) => {
		this.setState({
			current: '0:00',
			duration: '--:--',
			value: 0
		})
		storage.save({
			key: 'activeSongList',
			id: 1,
			data: {
				activeIndex: index,
				activeId: this.state.song_list_id
			}
		})
		storage.load({
			key: 'songList',
			id: this.state.song_list_id
		}).then((ret) => {
			ret.index = index
			storage.save({
				key: 'songList',
				id: this.state.song_list_id,
				data: ret
			})
		})
		playSourceSong(item, this.props.dispatch)
	}

	_key_extractor = (item) => {
		return item.song_id
	}

	renderShareModal() {
		return (
			<Modal
			  style={{height: 0.4*height, backgroundColor: '#fff'}}
			  position={"bottom"}
			  ref={"shareModal"}
			  backButtonClose={true}
			  swipeToClose={true}
			  swipeArea={(height-60)/2}>
				<View style={{height: 0.2*height, padding: 20}}>
					<Text style={{color: 'rgba(0,0,0,0.87)'}}>复制</Text>
					<ScrollView style={{height: 0.15*height, paddingTop: 5}} horizontal={true}>
						<TouchableNativeFeedback onPress={this.copyUrl}>
						<View style={{alignItems: 'center', marginRight: 20}}>
							<Image style={{marginBottom: 5, width: 0.07*height, height: 0.07*height}} source={require('../static/link39.png')} />
							<Text style={{textAlign: 'center', color: 'rgba(0,0,0,0.54)'}}>复制链接</Text>
						</View>
						</TouchableNativeFeedback>
					</ScrollView>
				</View>
				<View style={{height: 0.2*height, padding: 20}}>
					<Text style={{color: 'rgba(0,0,0,0.87)'}}>分享到</Text>
					<ScrollView style={{height: 0.15*height, paddingTop: 5}} horizontal={true}>
						<TouchableNativeFeedback onPress={this.shareMusicToTimeline}>
						<View style={{alignItems: 'center', marginRight: 20}}>
							<Image style={{marginBottom: 5, width: 0.07*height, height: 0.07*height}} source={require('../static/timeline.png')} />
							<Text style={{textAlign: 'center', color: 'rgba(0,0,0,0.54)'}}>朋友圈</Text>
						</View>
						</TouchableNativeFeedback>
						<TouchableNativeFeedback onPress={this.shareMusic}>
						<View style={{alignItems: 'center', marginRight: 10}}>
							<Image style={{marginBottom: 5, width: 0.07*height, height: 0.07*height}} source={require('../static/wechat.png')} />
							<Text style={{textAlign: 'center', color: 'rgba(0,0,0,0.54)'}}>微信好友</Text>
						</View>
						</TouchableNativeFeedback>
					</ScrollView>
				</View>
			</Modal>
		)
	}

	renderModal() {
		return (
			<Modal 
			  style={styles.modal} 
			  position={"bottom"} 
			  ref={"modal"}
			  backButtonClose={true}
			  swipeToClose={false}
			  swipeArea={(height-60)/2}>
		      {this.state.song_list.length == 0 ?
		      	(<View style={{
		      		justifyContent: 'center',
		      		alignItems: 'center',
		      		backgroundColor: 'rgba(0, 0, 0, 0.3)',
			      	height: 50,
		      	}}>
			      	<Text style={{
			      		color: 'rgba(255,255,255,0.87)',
			      	}}>尚未有任何歌曲，快去曲库中添加吧！</Text>
		      	</View>) : 
		      	(<FlatList
		      	style={{flex: 1, height: 300}}
		     	ref={"sl"}
		      	initialNumToRender={9}
		      	keyExtractor={this._key_extractor}
		      	data={this.state.song_list}
		      	renderItem={this.renderSongList} />)
		      }
		    </Modal>
		)
	}
}

function select(store) {
	return {
		songName: store.getPlayerDetail.songName,
		songUrl: store.getPlayerDetail.songUrl,
		artiseName: store.getPlayerDetail.artiseName,
		albumPic: store.getPlayerDetail.albumPic,
		playing: store.getPlayerDetail.playing,
		status: store.getPlayerDetail.status
	}
} 

const styles = StyleSheet.create({
	cd: {
		// borderWidth: 5,
		// borderColor: 'rgba(0, 0, 0, 0.75)',
		width: 0.45*width,
		height: 0.45*width,
		borderRadius: 0.5*width,
	},
	disk: {
		width: 0.7*width,
		height: 0.7*width,
		justifyContent: 'center',
		alignItems: 'center'
	},
	cdWrapper: {
		borderTopWidth: 1,
		borderTopColor: 'rgba(255,255,255,0.1)',
		width: width,
		height: width,
		alignItems: 'center',
		justifyContent: 'center'
	},
	progress: {
		marginLeft: 0.1*width,
		marginRight: 0.1*width
	},
	time: {
		color: 'rgba(255,255,255,0.87)'
	},
	bottomButtons: {
		justifyContent: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		width: width,
		height: height-60-width,
		padding: 10
	},
	buttonGroup: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	playing: {
		margin: 20
		// width: 70,
		// height: 70,
		// borderWidth: 5,
		// justifyContent: 'center',
		// alignItems: 'center',
		// borderColor: '#2f5e75',
		// borderRadius: 70
	},
	next: {

	},
	prev: {

	},
	playlist: {
		marginLeft: 40
	},
	playmode: {
		marginRight: 40
	},
	modal: {
		height: (height-60)/2,
		backgroundColor: 'rgba(255, 255, 255, 0.5)'
	}
})

export default connect(select)(SongDetail)
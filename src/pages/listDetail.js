import React, {Component} from 'react'
import {ToastAndroid, FlatList, ImageBackground, BackHandler, ToolbarAndroid, StyleSheet, Text, View, StatusBar, Image, TouchableNativeFeedback, ScrollView} from 'react-native'
import getNeteaseListDetail from '../actions/neList'
import getNeteaseSongDetail from '../actions/neDetail'
import {connect} from 'react-redux'
import {List, ListItem} from 'react-native-elements'
import { Icon, Tile } from 'react-native-elements'
import neEnc from '../utils/neEnc'
import Player from '../components/player'
import * as stypes from '../utils/storage/StorageTypes'
import {playSourceSong} from '../utils/playSong'

const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

class ListDetail extends Component {
	constructor(props) {
		super(props)
		this.state = {
			songlist: {
				name: '加载中……',
				songs: []
			}
		}
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
		let sid = this.props.navigation.state.params.sid
		storage.load({
			key: 'songList',
			id: sid
		}).then((data) => {
			this.setState({songlist: data})
		})
	}	

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
	}

	onBackPress = () => {
		this.props.navigation.goBack()
		return true
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
				}}>{this.state.songlist.name}</Text>
			</View>
			<View style={{
				width: width,
				height: 0.1*height,
				backgroundColor: 'rgba(0, 0, 0, 0.3)',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				<TouchableNativeFeedback 
				  onPress={() => {
				  	if(this.state.songlist.songs.length == 0) {
				  		ToastAndroid.show('当前歌单尚未有歌曲', ToastAndroid.SHORT)
				  	}else {
				  		this.playSong(this.state.songlist.songs[0], 0)
				  	}
				  }}>
				  	<View style={{
				  		flex: 1,
				  		flexDirection: 'column',
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

	playSong = (item, index) => {
		storage.save({
			key: 'activeSongList',
			id: 1,
			data: {
				activeIndex: index,
				activeId: this.props.navigation.state.params.sid
			}
		})
		storage.load({
			key: 'songList',
			id: this.props.navigation.state.params.sid
		}).then((ret) => {
			ret.index = index
			storage.save({
				key: 'songList',
				id: this.props.navigation.state.params.sid,
				data: ret
			})
		})
		playSourceSong(item, this.props.dispatch)
	}

	renderTracks() {
		if(this.state.songlist.songs.length == 0) {
			return (
				<View style={{height: height-60, backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
					<View style={{backgroundColor: 'rgba(0, 0, 0, 0.33)'}}>
						<View style={{height: StatusBar.currentHeight}}></View>
					 	   {this.renderCard()}
					</View>
					<View style={styles.nullSongList}>
						<Text style={styles.nullTitle}>暂无曲目</Text>
						<Text style={styles.nullSubtitle}>去曲库或歌单中添加吧！</Text>
					</View>
				</View>
			)
		}else {
			return (
				<View style={{height: height-60}}>
					<FlatList
					  ListHeaderComponent={
					  	<View style={{backgroundColor: 'rgba(0, 0, 0, 0.33)'}}>
							<View style={{height: StatusBar.currentHeight}}></View>
						 	   {this.renderCard()}
						</View>
					  }
					  initialNumToRender={10}
					  keyExtractor={this._key_extractor}
					  data={this.state.songlist.songs}
					  renderItem={this.renderListSongs}>
					</FlatList>
				</View>
			)
		}
	}

	_key_extractor = (item) => {
		return item.song_id
	}

	renderListSongs = ({item, index}) => {
		return (
			<TouchableNativeFeedback key={index} onPress={() => this.playSong(item, index)}>
				<ListItem
				    roundAvatar
				    avatar={{uri:item.album_pic}}
			        title={item.song_name}
				    subtitle={item.artist_name}
			    />
			</TouchableNativeFeedback>  
		)
	}

	render() {
		return (
			<View style={styles.layout}>
		      	<StatusBar backgroundColor='rgba(0, 0, 0, 0.3)' translucent={true} />
		      	<ImageBackground 
		      	  source={this.state.songlist.songs.length == 0 ? 
		      	  	require('../static/disk.png') : 
		      	  	{uri:this.state.songlist.songs[0].album_pic}
		      	  }
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
		    </View>
		)
	}
}

function select(store) {
	return {

	}
}

export default connect(select)(ListDetail)

const styles = StyleSheet.create({
	layout: {
		flex: 1
	},
	card: {
		elevation: 10,
		height: 250
	},
	nullSongList: {
		alignItems: 'center',
		paddingTop: 50,
		height: height-310,
		padding: 10
	},
	nullTitle: {
		fontSize: 24,
		color: 'rgba(0, 0, 0, 0.87)'
	},
	nullSubtitle: {
		fontSize: 18,
		color: 'rgba(0, 0, 0, 0.54)'
	}
})
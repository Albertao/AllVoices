import React, {Component} from 'react'
import {BackHandler, ToolbarAndroid, StyleSheet, Text, View, StatusBar, Image, TouchableNativeFeedback, ScrollView} from 'react-native'
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
			console.log(data)
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
				<Tile
				   imageSrc={this.state.songlist.songs.length == 0 ? require('../static/cd.png') : {uri: this.state.songlist.songs[0].album_pic}}
				   title={this.state.songlist.name}
				   featured
				/>
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
				<View style={styles.nullSongList}>
					<Text style={styles.nullTitle}>暂无曲目</Text>
					<Text style={styles.nullSubtitle}>去曲库或歌单中添加吧！</Text>
				</View>
			)
		}else {
			return (
				<ScrollView style={{height: height-310}}>
				<List containerStyle={{marginTop: 0, marginBottom: 20}}>
				  {
				    this.state.songlist.songs.map((l, i) => (
				      <TouchableNativeFeedback key={i} onPress={() => this.playSong(l, i)}>
				      <ListItem
				        roundAvatar
				        avatar={{uri:l.album_pic}}
				        title={l.song_name}
				        subtitle={l.artist_name}
				      />
				      </TouchableNativeFeedback>  
				    ))
				  }
				</List>
				</ScrollView>
			)
		}
	}

	render() {
		return (
			<View style={styles.layout}>
		      	<StatusBar backgroundColor='rgba(0, 0, 0, 0.3)' translucent={true} />
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
import React, {Component} from 'react';
import {TouchableNativeFeedback, StyleSheet, View, Text, NativeModules, DeviceEventEmitter} from 'react-native';
import {connect} from 'react-redux'
import { Avatar, Icon, Grid, Col, Row } from 'react-native-elements'
import * as types from '../actions/ActionTypes'
import {NavigationActions} from 'react-navigation'
import * as stypes from '../utils/storage/StorageTypes'
import {playSong} from '../utils/playSong'

class Player extends React.Component {

	componentWillMount() {
		DeviceEventEmitter.addListener("playerPause", (e) => {
			this.props.dispatch({'type': types.SET_PLAYER_PAUSE})
		})
		DeviceEventEmitter.addListener("playerResume", (e) => {
			this.props.dispatch({'type': types.SET_PLAYER_RESUME})
		})
	}

	componentDidMount() {
		if(this.props.status == 'init') {
			storage.load({
				key: 'activeSongList',
				id: 1
			}).then((active) => {
				storage.load({
					key: 'songList',
					id: active.activeId
				}).then((ret) => {
					if (ret.songs.length != 0) {
						var song = ret.songs[ret.index]
						NativeModules.MusicService.getMediaplayerStatus((isPlaying) => {
							var playing = isPlaying
							switch(song.source) {
								case stypes.NETEASE:
									this.props.dispatch({'type': types.SET_NE_PLAYER_DETAIL, storage: true, data: song, playing: playing})
									break
								case stypes.XIAMI:
									this.props.dispatch({'type': types.SET_XM_PLAYER_DETAIL, storage: true, data: song, playing: playing})
									break
							}
						})
					}
				}).catch((err) => {
					console.log(err)
				})
			})
		}
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

	render() {
		return (
			<TouchableNativeFeedback onPress={() => {
				this.props.navigation.navigate('SongDetail')
			}}>
			<View style={{flexDirection: 'row', height: 60, elevation: 10, backgroundColor: this.props.bgColor,}}>
				<View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
					<Avatar
					  width={40}
					  height={40}
					  rounded
					  source={{uri: this.props.albumPic}}
					  onPress={() => console.log("Works!")}
					  activeOpacity={0.7}
					/>
				</View>
				<View style={{flex: 6, justifyContent: 'center'}}>
					<View><Text numberOfLines={1} style={{fontSize: 16, color: this.props.songNameColor}}>{this.props.songName}</Text></View>
					<View><Text numberOfLines={1} style={{fontSize: 14, color: this.props.artistColor}}>{this.props.artiseName}</Text></View>
				</View>
				<View style={{flexDirection: 'row', alignItems: 'center', flex: 3}}>
					<TouchableNativeFeedback
					  background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
					  onPress={this.prevSong}>
					<Icon
						size={35}
						name='navigate-before'
						color={this.props.btnColor} />
					</TouchableNativeFeedback>
					<TouchableNativeFeedback 
					  background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
					  onPress={() => {
						if(this.props.playing) {
							NativeModules.MusicService.pause()
							this.props.dispatch({'type':types.SET_PLAYER_PAUSE})
						}else {
							NativeModules.MusicService.resume()
							this.props.dispatch({'type':types.SET_PLAYER_RESUME})
						}
					}} >
					<Icon
						size={30}
						name={this.props.playing ? 'pause-circle-outline' : 'play-circle-outline'}
						color={this.props.btnColor} />
					</TouchableNativeFeedback>
					<TouchableNativeFeedback 
					  background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
					  onPress={this.nextSong}>
					<Icon
						size={35}
						name='navigate-next'
						color={this.props.btnColor} />
					</TouchableNativeFeedback>
				</View>
			</View>
			</TouchableNativeFeedback>
		)
	}
}

function select(store) {
	return {
		songName: store.getPlayerDetail.songName,
		artiseName: store.getPlayerDetail.artiseName,
		albumPic: store.getPlayerDetail.albumPic,
		playing: store.getPlayerDetail.playing,
		status: store.getPlayerDetail.status
	}
} 

export default connect(select)(Player);

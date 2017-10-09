import React, {Component} from 'react'
import {BackHandler, ToastAndroid, TextInput, TouchableNativeFeedback, StyleSheet, ScrollView, StatusBar, ToolbarAndroid, View, Text, Image} from 'react-native'
import {Button, List, ListItem} from 'react-native-elements'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Player from '../components/player'
import Modal from 'react-native-modalbox'
import * as stypes from '../utils/storage/StorageTypes'

const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

export default class SongList extends Component {

	constructor(props) {
		super(props)
		this.state = {
			deleteId: 0,
			isSetting: false,
			songLists: [],
			text: '',
			isOpen: false,
      		isDisabled: false,
      		swipeToClose: true,
      		sliderValue: 0.3
		}
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
		storage.getIdsForKey('songList').then(ret => console.log(ret))
		this.refreshSongLists()
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

	refreshSongLists() {
		storage.getIdsForKey('songList').then((ret) => console.log(ret))
		storage.getAllDataForKey('songList').then((data) => {
			this.setState({
				songLists: data
			})
		})
	}

	createSongList = () => {
		if(this.state.text != '') {
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
						songs: [],
						name: this.state.text,
						index: 0,
						type: stypes.SONG_LIST_LOOP
					}
				}).then((ret) => {
					this.refreshSongLists()
				})
			})
			this.refs.modal.close()
		}else {
			ToastAndroid.show('您尚未输入歌单名称', ToastAndroid.SHORT)
		}
	}

	renderDeleteButton(index) {
		return (
			<TouchableNativeFeedback 
				background={TouchableNativeFeedback.SelectableBackground()}
				onPress={() => {
					storage.getIdsForKey('songList').then((ids) => {
						if(ids[index] == 1) {
							ToastAndroid.show('无法删除默认的播放列表~', ToastAndroid.SHORT)
						}else {
							this.setState({deleteId: ids[index]})
					    	this.refs.deleteModal.open()
						} 
	      			})
				}}>
				<View style={{justifyContent: 'center', alignItems: 'center', backgroundColor: 'red', height: 20, top: 9, left: 15, padding: 10, borderRadius: 10}}>
					<Text style={{fontSize: 11, color: '#fff'}}>删除</Text>
				</View>
			</TouchableNativeFeedback>
		)
	}

	renderLists() {
		if(this.state.songLists.length == 0) {
			return (
				<View style={{paddingTop: 20, alignItems: 'center'}}>
					<Text>您当前尚未有歌单，快去创建吧！</Text>
				</View>
			)
		}else {
			if(this.state.isSetting) {
				return (
					<List containerStyle={{marginTop: 0, marginBottom: 20}}>
					  {
					    this.state.songLists.map((l, i) => (
					      <ListItem
					      	onPress={() => {
					      		storage.getIdsForKey('songList').then((ids) => {
					      			this.props.navigation.navigate('ListDetail', {
					      				sid: ids[i]
					      			})
					      		})
					      	}}	
					      	badge={{element: this.renderDeleteButton(i)}}
					      	roundAvatar
					        avatar={l.songs.length == 0 ? require('../static/cd.png') : {uri: l.songs[0].album_pic}}
					        key={i}
					        title={l.name}
					        subtitle={l.songs.length + '首'}
					      />
					    ))
					  }
					</List>
				)
			}else {
				return (
					<List containerStyle={{marginTop: 0, marginBottom: 20}}>
					  {
					    this.state.songLists.map((l, i) => (
					      <ListItem
					      	onPress={() => {
					      		storage.getIdsForKey('songList').then((ids) => {
					      			this.props.navigation.navigate('ListDetail', {
					      				sid: ids[i]
					      			})
					      		})
					      	}}		
					      	roundAvatar
					        avatar={l.songs.length == 0 ? require('../static/cd.png') : {uri: l.songs[0].album_pic}}
					        key={i}
					        title={l.name}
					        subtitle={l.songs.length + '首'}
					      />
					    ))
					  }
					</List>
				)
			}
		}
	}

	renderDeleteModal() {
		return (
			<Modal style={styles.modal} position={"center"} ref={"deleteModal"}>
		      	<Text>您确定要删除该歌单吗？</Text>
				<View style={{flexDirection: 'row', marginTop: 20}}>
				<Button
				  raised
				  onPress={() => {
				  	if(this.state.deleteId != 0) {
				  		storage.load({
							key: 'activeSongList',
							id: 1
						}).then((ret) => {
							if(ret.activeId == this.state.deleteId) {
								storage.save({
									key: 'activeSongList',
									id: 1,
									data: {
										activeId: 1,
										activeIndex: 0
									}
								})
							}
							storage.remove({
								key: 'songList',
								id: this.state.deleteId
							}).then((ret) => {
								this.refs.deleteModal.close()
								this.refreshSongLists()
							})	
						})
				  	}else {
				  		ToastAndroid.show('错误的歌单id，请重试~', ToastAndroid.SHORT)
				  	}
				  }}
				  icon={{name: 'done'}}
				  backgroundColor='#2096f3'
				  title='确定' />
				<Button
				  raised
				  onPress={() => this.refs.deleteModal.close()}
				  icon={{name: 'close'}}
				  title='取消' />
				</View>
		    </Modal>
		)
	}

	renderModal() {
		return (
			<Modal style={styles.modal} position={"center"} ref={"modal"}>
		      	<TextInput
		      		placeholder="请输入歌单名称"
		      		style={{width: 200}}
        			onChangeText={(text) => this.setState({text})}
        			value={this.state.text}
      			/>
				<View style={{flexDirection: 'row', marginTop: 20}}>
				<Button
				  raised
				  onPress={this.createSongList}
				  icon={{name: 'done'}}
				  backgroundColor='#2096f3'
				  title='确定' />
				<Button
				  raised
				  onPress={() => this.refs.modal.close()}
				  icon={{name: 'close'}}
				  title='取消' />
				</View>
		    </Modal>
		)
	}
 
	render() {
		return (
			<View>
				<StatusBar backgroundColor='rgba(0, 0, 0, 0.3)' translucent={true} />
				<View style={{height: StatusBar.currentHeight, backgroundColor: '#03a9f4'}}></View>
				<Icon.ToolbarAndroid
				  navIconName="menu"
				  iconSize={30}
				  onIconClicked ={() => this.props.navigation.navigate('DrawerOpen')}
				  style={{elevation: 2, height: 56, backgroundColor: '#03a9f4'}}
				  title={'我的歌单'}
				  titleColor="#fff"
				/>
				<ScrollView style={{height:height-116-StatusBar.currentHeight}}>
					<View style={styles.SectionTitle}>
						<Text>我创建的歌单</Text>
						<View style={{flexDirection: 'row'}}>
						<TouchableNativeFeedback
						  onPress={() => this.refs.modal.open()}
						  >
							<Icon style={[styles.icon, styles.AddCircle]} name="add-circle" />
						</TouchableNativeFeedback>
						<TouchableNativeFeedback
						  onPress={() => this.setState({isSetting: !this.state.isSetting})}
						  >
							<Icon style={styles.icon} name="settings" />
						</TouchableNativeFeedback>
						</View>
					</View>
					{this.renderLists()}
				</ScrollView>
				<Player
				  navigation={this.props.navigation}
		      	  bgColor="#fff"
		      	  btnColor="#000"
		      	  songNameColor="rgba(0, 0, 0, 0.87)"
		      	  artistColor="rgba(0, 0, 0, 0.54)" />
		      	{this.renderDeleteModal()}
		      	{this.renderModal()}
			</View>
		)
	}
}

const styles = StyleSheet.create({
	SectionTitle: {
		borderTopWidth: 1,
		borderTopColor: '#cbd2d9',
		paddingLeft: 10,
		paddingRight: 10,
		marginTop:20, 
		flex: 1, 
		flexDirection: 'row', 
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: "#e3e3e3", 
		width: width, 
		height: 30
	},
	AddCircle: {
		marginRight: 10,
	},
	icon: {
		justifyContent: 'flex-end',
		fontSize: 18
	},
	modal: {
		justifyContent: 'center',
    	alignItems: 'center',
		height: 300
	}
})
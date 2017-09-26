import React, {Component} from 'react'
import {ToolbarAndroid, StyleSheet, Text, View, StatusBar, Image, TouchableNativeFeedback, ScrollView} from 'react-native'
import getQQMusicListDetail from '../actions/qqList'
import {connect} from 'react-redux'
import {List, ListItem} from 'react-native-elements'
import { Icon, Tile } from 'react-native-elements'
import neEnc from '../utils/neEnc'
import Player from '../components/player'
import getQQMusicSongDetail from '../actions/qqDetail'


const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

class QQMusicList extends Component {

	componentDidMount() {
		let id = this.props.navigation.state.params.id
		this.props.dispatch(getQQMusicListDetail(id))
	}	

	_key_extractor = (item) => {
		return item.id
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
		this.props.dispatch(getQQMusicSongDetail(item.songmid))
	}

	renderDone() {
		return (
			<ScrollView style={{height: height-310}}>
			<List containerStyle={{marginTop: 0, marginBottom: 20}}>
			  {
			    this.props.song_list.songlist.map((l, i) => (
			      <TouchableNativeFeedback key={i} onPress={() => this.getSongUrl(l, i)}>
			      <ListItem
			        title={l.songname}
			        subtitle={this.artistName(l.singer)}
			      />
			      </TouchableNativeFeedback>  
			    ))
			  }
			</List>
			</ScrollView>
		)
	}

	renderLoading() {
		return (<View style={{height:height-310}}><Text>loading</Text></View>)
	}

	renderFail() {
		return (<View style={{height:height-310}}><Text>failed.</Text></View>)
	}

	renderCard() {
		let params = this.props.navigation.state.params
		return (
			<View>
				<Tile
				   imageSrc={{uri: params.curl}}
				   title={params.name}
				   icon={{name: 'play-circle-outline'}}
				   featured
				   caption={"Author: " + params.creator}
				/>
			</View>
		)
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
	}
});

function select(store) {
	return {
		status: store.getQQMusicListDetail.status,
		success: store.getQQMusicListDetail.success,
		song_list: store.getQQMusicListDetail.song_list,
		song_url_lists: store.getQQMusicListDetail.song_list
	}
}

export default connect(select)(QQMusicList)
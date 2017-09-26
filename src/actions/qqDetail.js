import * as types from './ActionTypes'
import {NativeModules, Linking} from 'react-native'

export default function getQQMusicSongDetail(songmid) {
	return (dispatch) => {
		let guid = '78094169885'
		let filename = 'C200' + songmid + '.m4a'
		let url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?g_tk=1457974342&format=json&inCharset=utf8&outCharset=utf-8&cid=205361747&songmid='+songmid+'&filename='+filename+'&guid='+guid
		fetch(url, {
			headers: {
				'Referer': 'http://y.qq.com/'
			}
		}).then((res) => {
			let json = JSON.parse(res._bodyText)
			let musicURL = 'https://cc.stream.qqmusic.qq.com/'+filename+'?vkey='+json.data.items[0].vkey+'&guid='+guid
			Linking.openURL(musicURL).catch((err) => {console.log(err)})
			console.log(musicURL)
			// NativeModules.MusicService.play([{song_url:musicURL}])
		})
	}
}
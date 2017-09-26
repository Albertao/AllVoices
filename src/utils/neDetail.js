import * as types from '../actions/ActionTypes'
import {NativeModules} from 'react-native'

export default function getNeteaseSongDetail(obj, item) {
	fetch('http://music.163.com/weapi/song/enhance/player/url',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'params='+obj.params+'&encSecKey='+obj.encSecKey
	}).then((res) => {
		let json = JSON.parse(res._bodyText)
		var datas = {
			...item,
			song_url: json.data[0].url
		}
		NativeModules.MusicService.play(datas)
	}).catch((err) => {
		console.log(err)
	})
}


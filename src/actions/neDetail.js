import * as types from './ActionTypes'
import {NativeModules} from 'react-native'

export default function getNeteaseSongDetail(obj, item) {
	return (dispatch) => {
		dispatch({'type': types.SET_NE_PLAYER_DETAIL, data: item})
		dispatch({'type': types.NETEASE_SONG_DETAIL})
		fetch('http://music.163.com/weapi/song/enhance/player/url',{
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: 'params='+obj.params+'&encSecKey='+obj.encSecKey
		}).then((res) => {
			let json = JSON.parse(res._bodyText)
			var obj = {
				song_url: json.data[0].url,
				song_name: item.name,
				artist_name: item.info,
				album_pic: item.album.blurPicUrl
			}
			NativeModules.MusicService.play(obj)
			if(json.code == 200) {
				dispatch({'type': types.NETEASE_SONG_DETAIL_DONE, 'data': json.result})
			}else {
				dispatch({'type': types.NETEASE_SONG_DETAIL_FAIL})
			}
		}).catch((err) => {
			console.log(err)
			dispatch({'type': types.NETEASE_SONG_DETAIL_FAIL})
		})
	}
}


import * as types from './ActionTypes'
import {ToastAndroid, NetInfo} from 'react-native'

export default function getSongList(offset) {
	return (dispatch) => {
		NetInfo.isConnected.fetch().done((isConnected) => {
			if(isConnected) {
				if(offset != 0) {
					dispatch({'type': types.NETEASE_HOT_SONG_LIST_MORE})
				}else {
					dispatch({'type': types.NETEASE_HOT_SONG_LIST})
				}
				fetch('http://music.163.com/api/playlist/list?cat=%E5%85%A8%E9%83%A8&order=hot&limit=15&total=true&offset=' + offset)
				.then((res) => {
					dispatch({'type': types.NETEASE_HOT_SONG_LIST_DONE, 'data': JSON.parse(res._bodyText).playlists})
				})
				.catch((err) => {
					ToastAndroid.show('连接超时', ToastAndroid.SHORT)
					dispatch({'type': types.NETEASE_HOT_SONG_LIST_FAIL})
					console.log(err)
				})
			} else {
				ToastAndroid.show('网络连接失败，请稍后再试', ToastAndroid.SHORT)
				dispatch({'type': types.NETEASE_HOT_SONG_LIST_FAIL})
			}
		})
	}
}
import * as types from './ActionTypes'
import {ToastAndroid, NetInfo} from 'react-native'

export default function getSongList(page) {
	return (dispatch) => {
		if(page != 1) {
			dispatch({'type': types.XIAMI_HOT_SONG_LIST_MORE})
		}else {
			dispatch({'type': types.XIAMI_HOT_SONG_LIST})
		}
		NetInfo.isConnected.fetch().done((isConnected) => {
			if (isConnected) {
				fetch('http://api.xiami.com/web?v=2.0&app_key=1&_ksTS=1459927525542_91&page='+ page +'&limit=15&r=collect/recommend', {
					method: 'POST',
					headers: {
						'Referer': 'http://m.xiami.com/'
					}
				})
				.then((res) => {
					let json = JSON.parse(res._bodyText)
					dispatch({'type': types.XIAMI_HOT_SONG_LIST_DONE, 'data': json.data})
				})
				.catch((err) => {
					ToastAndroid.show('连接超时', ToastAndroid.SHORT)
					dispatch({'type': types.XIAMI_HOT_SONG_LIST_FAIL})
					console.log(err)
				})
			} else {
				ToastAndroid.show('网络连接失败，请稍后再试', ToastAndroid.SHORT)
				dispatch({'type': types.XIAMI_HOT_SONG_LIST_FAIL})
			}
		})
	}
}
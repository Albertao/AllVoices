import * as types from './ActionTypes'
import {NetInfo, ToastAndroid} from 'react-native'

export default function getXiamiListDetail(id) {
	return (dispatch) => {
		dispatch({'type': types.XIAMI_SONG_LIST_DETAIL})
		NetInfo.isConnected.fetch().done((isConnected) => {
			if(isConnected) {
				fetch('http://api.xiami.com/web?v=2.0&app_key=1&id='+id+'&_ksTS=1459928471147_121&r=collect/detail', {
					method: 'POST',
					headers: {
						'Referer': 'http://m.xiami.com/'
					}
				}).then((res) => {
					let json = JSON.parse(res._bodyText)
					dispatch({'type': types.XIAMI_SONG_LIST_DETAIL_DONE, 'data': json.data})
				}).catch((err) => {
					console.log(err)
					dispatch({'type': types.XIAMI_SONG_LIST_DETAIL_FAIL})
				})
			} else {
				dispatch({'type': types.XIAMI_SONG_LIST_DETAIL_FAIL})
			}
		})
	}
}
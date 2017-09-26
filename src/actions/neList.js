import * as types from './ActionTypes'

export default function getNeteaseListDetail(id) {
	return (dispatch) => {
		dispatch({'type': types.NETEASE_SONG_LIST_DETAIL})
		fetch('http://music.163.com/api/playlist/detail?id=' + id).then((res) => {
			let json = JSON.parse(res._bodyText)
			if(json.code == 200) {
				dispatch({'type': types.NETEASE_SONG_LIST_DETAIL_DONE, 'data': json.result})
			}else {
				dispatch({'type': types.NETEASE_SONG_LIST_DETAIL_FAIL})
			}
		}).catch((err) => {
			console.log(err)
			dispatch({'type': types.NETEASE_SONG_LIST_DETAIL_FAIL})
		})
	}
}
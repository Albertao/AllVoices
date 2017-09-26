import * as types from './ActionTypes'

export default function getSongList(from, to) {
	return (dispatch) => {
		let url = 'http://i.y.qq.com/s.plcloud/fcgi-bin/fcg_get_diss_by_tag.fcg?categoryId=10000000&sortId=1&format=json&inCharset=GB2312&outCharset=utf-8&sin='+from+'&ein='+to
		if(from != 0) {
			dispatch({'type': types.QMUSIC_HOT_SONG_LIST_MORE})
		}else {
			dispatch({'type': types.QMUSIC_HOT_SONG_LIST})
		}
		fetch(url, {
			headers: {
				'Referer': 'http://y.qq.com'
			}
		})
		.then((res) => {
			let json = JSON.parse(res._bodyText)
			
			dispatch({'type': types.QMUSIC_HOT_SONG_LIST_DONE, 'data': json.data})
		})
		.catch((err) => {
			dispatch({'type': types.QMUSIC_HOT_SONG_LIST_FAIL})
			console.log(err)
		})
	}
}
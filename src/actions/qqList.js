import * as types from './ActionTypes'

export default function getQQMusicListDetail(id) {
	return (dispatch) => {
		let url = 'http://i.y.qq.com/qzone-music/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=1&nosign=1&disstid='+id+'&g_tk=5381&format=json&inCharset=GB2312&outCharset=utf-8'
		dispatch({'type': types.QMUSIC_SONG_LIST_DETAIL})
		fetch(url, {
			headers: {
				'Referer': 'http://y.qq.com/'
			}
		}).then((res) => {
			let json = JSON.parse(res._bodyText)
			dispatch({'type': types.QMUSIC_SONG_LIST_DETAIL_DONE, 'data': json})
		}).catch((err) => {
			console.log(err)
			dispatch({'type': types.QMUSIC_SONG_LIST_DETAIL_FAIL})
		})
	}
}
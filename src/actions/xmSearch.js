import * as types from './ActionTypes'

export default function searchXiami(obj, isNew) {
	return (dispatch) => {
		if(obj.page == 1) {
			dispatch({'type': types.XIAMI_SEARCH})
		}else {
			dispatch({'type': 'types.XIAMI_SEARCH_MORE'})
		}
		var url = 'http://api.xiami.com/web?v=2.0&app_key=1&key='+ obj.kw +'&page='+ obj.page +'&limit=20&_ksTS=1459930568781_153&r=search/songs'
		console.log(url)
		fetch(url, {
			method: 'POST',
			headers: {
				'Referer': 'http://m.xiami.com/'
			},
		}).then((res) => {
			let json = JSON.parse(res._bodyText)
			console.log(json)
			if(isNew) {
				dispatch({'type': types.XIAMI_SEARCH_NEW_DONE, 'data': json.data.songs})
			}else {
				dispatch({'type': types.XIAMI_SEARCH_DONE, 'data': json.data.songs})
			}
		}).catch((err) => {
			console.log(err)
			dispatch({'type': types.XIAMI_SEARCH_FAIL})
		})
	}
}


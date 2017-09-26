import * as types from './ActionTypes'

export default function searchNetease(obj, isNew) {
	return (dispatch) => {
		if(obj.offset != 0) {
			dispatch({'type': types.NETEASE_SEARCH_MORE})
		}else {
			dispatch({'type': types.NETEASE_SEARCH})
		}
		fetch('http://music.163.com/api/search/pc',{
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: 's='+encodeURIComponent(obj.s)+'&offset='+obj.offset+'&type='+obj.type+'&limit='+obj.limit
		}).then((res) => {
			let json = JSON.parse(res._bodyText)
			if(json.code == 200) {
				if(isNew) {
					dispatch({'type': types.NETEASE_SEARCH_NEW_DONE, 'data': json.result.songs})
				}else {
					dispatch({'type': types.NETEASE_SEARCH_DONE, 'data': json.result.songs})
				}
				
			}else {
				dispatch({'type': types.NETEASE_SEARCH_FAIL})
			}
		}).catch((err) => {
			console.log(err)
			dispatch({'type': types.NETEASE_SEARCH_FAIL})
		})
	}
}


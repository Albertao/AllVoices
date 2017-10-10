import * as types from '../actions/ActionTypes'
import * as stypes from '../utils/storage/StorageTypes'

const initialState = {
	status: 'doing', //init, doing, done, fail
	song_list: [],
	success: false
}

function artistName(artists) {
	var arName = ''
	artists.map((ar, i) => {
		arName += ar.name + (i+1 === artists.length ? '' : '/')
	})
	return arName
}

export default function getNeteaseListDetail(state=initialState, action) {
	switch(action.type) {
		case types.NETEASE_SONG_LIST_DETAIL:
			state.song_list = [];
			state.status = 'doing';
			return state;
			break
		case types.NETEASE_SONG_LIST_DETAIL_DONE:
			var songs = []
			action.data.tracks.map((l, i) => {
				var obj = {
					song_id: l.id,
					source: stypes.NETEASE,
					song_name: l.name,
					artist_name: artistName(l.artists),
					album_pic: l.album.blurPicUrl,
				}
				songs.push(obj)
			})
			return {
				...state,
				song_list: songs,
				success: true,
				status: 'done'
			}
			break
		case types.NETEASE_SONG_LIST_DETAIL_FAIL:
			return {
				...state,
				status: 'fail',
				success: false
			}
		default:
			return state
	}
}
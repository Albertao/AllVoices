import * as types from '../actions/ActionTypes'
import * as stypes from '../utils/storage/StorageTypes'

const initialState = {
	status: 'doing', //init, doing, done, fail
	song_list: {},
	success: false
}

export default function getXiamiListDetail(state=initialState, action) {
	switch(action.type) {
		case types.XIAMI_SONG_LIST_DETAIL:
			state.song_list = {};
			state.status = 'doing';
			return state;
			break
		case types.XIAMI_SONG_LIST_DETAIL_DONE:
			var songs = []
			action.data.songs.map((item, index) => {
				var obj = {
					song_id: item.song_id,
					song_url: item.listen_file,
					song_name: item.song_name,
					album_pic: item.album_logo,
					artist_name: item.singers,
					source: stypes.XIAMI
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
		case types.XIAMI_SONG_LIST_DETAIL_FAIL:
			return {
				...state,
				status: 'fail',
				success: false
			}
		default:
			return {
				...state
			}
	}
}
import * as types from '../actions/ActionTypes'

const initialState = {
	status: 'doing', //init, doing, done, fail
	song_list: {},
	success: false
}

export default function getNeteaseSongDetail(state=initialState, action) {
	switch(action.type) {
		case types.NETEASE_SONG_DETAIL:
			return state;
			break
		case types.NETEASE_SONG_DETAIL_DONE:
			return {
				...state,
				song_list: action.data,
				success: true,
				status: 'done'
			}
			break
		case types.NETEASE_SONG_DETAIL_FAIL:
			return {
				...state,
				status: 'fail',
				success: false
			}
		default:
			return state
	}
}
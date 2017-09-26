import * as types from '../actions/ActionTypes'

const initialState = {
	status: 'doing', //init, doing, done, fail
	song_list: {},
	success: false
}

export default function getQQMusicListDetail(state=initialState, action) {
	switch(action.type) {
		case types.QMUSIC_SONG_LIST_DETAIL:
			state.song_list = {};
			state.status = 'doing';
			return state;
			break
		case types.QMUSIC_SONG_LIST_DETAIL_DONE:
			return {
				...state,
				song_list: action.data,
				success: true,
				status: 'done'
			}
			break
		case types.QMUSIC_SONG_LIST_DETAIL_FAIL:
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
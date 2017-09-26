import * as types from '../actions/ActionTypes'

const initialState = {
	status: 'xm_doing', // more, doing, done, fail
	song_lists: [],
	success: false
}

export default function getXiamiList(state=initialState, action) {
	switch(action.type) {
		case types.XIAMI_HOT_SONG_LIST:
			return {
				...state,
				status: 'xm_doing'
			}
			break
		case types.XIAMI_HOT_SONG_LIST_DONE:
			return {
				...state,
				status: 'xm_done',
				song_lists: state.song_lists.concat(action.data),
				success: true
			}
			break
		case types.XIAMI_HOT_SONG_LIST_FAIL:
			return {
				...state,
				status: 'xm_fail',
				success: false
			}
			break
		case types.XIAMI_HOT_SONG_LIST_MORE:
			return {
				...state,
				status: 'xm_more',
				success: false
			}
		default: 
			return state
	}
}


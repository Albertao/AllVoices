import * as types from '../actions/ActionTypes'

const initialState = {
	status: 'doing', // more, doing, done, fail
	song_lists: [],
	success: false
}

export default function getNeteaseList(state=initialState, action) {
	switch(action.type) {
		case types.NETEASE_HOT_SONG_LIST:
			return {
				...state,
				status: 'doing'
			}
			break
		case types.NETEASE_HOT_SONG_LIST_DONE:
			return {
				...state,
				status: 'done',
				song_lists: state.song_lists.concat(action.data),
				success: true
			}
			break
		case types.NETEASE_HOT_SONG_LIST_FAIL:
			return {
				...state,
				status: 'fail',
				success: false
			}
			break
		case types.NETEASE_HOT_SONG_LIST_MORE:
			return {
				...state,
				status: 'more',
				success: false
			}
		default: 
			return state
	}
}


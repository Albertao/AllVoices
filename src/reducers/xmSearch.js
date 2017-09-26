import * as types from '../actions/ActionTypes'

const initialState = {
	status: 'init', //init, doing, done, fail
	search_result: {},
	success: false
}

export default function xiamiSearch(state=initialState, action) {
	switch(action.type) {
		case types.XIAMI_SEARCH:
			return {
				...state,
				status: 'doing'
			}
			break
		case types.XIAMI_SEARCH_NEW_DONE:
			return {
				...state,
				search_result: action.data,
				success: true,
				status: 'new_done'
			}
			break
		case types.XIAMI_SEARCH_DONE:
			return {
				...state,
				search_result: state.search_result.concat(action.data),
				success: true,
				status: 'done'
			}
			break
		case types.XIAMI_SEARCH_FAIL:
			return {
				...state,
				status: 'fail',
				success: false
			}
			break
		case types.XIAMI_SEARCH_MORE:
			return {
				...state,
				status: 'more',
				success: false
			}
		default:
			return state
	}
}
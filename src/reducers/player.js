import * as types from '../actions/ActionTypes'

const initialState = {
	songName: ' ',
	artiseName: ' ',
	status: 'init', // init, done, false, pause, resume
	albumPic: 'http://www.easyicon.net/api/resizeApi.php?id=1188681&size=128',
	playing: false
}

export default function getPlayerDetail(state=initialState, action) {
	switch(action.type) {
		case types.SET_NE_PLAYER_DETAIL:
			if(!action.storage) {
				return {
					songName: action.data.song_name,
					artiseName: action.data.artist_name,
					albumPic: action.data.album_pic,
					playing: true,
					status: 'done'
				}
			}else {
				return {
					songName: action.data.song_name,
					artiseName: action.data.artist_name,
					albumPic: action.data.album_pic,
					playing: action.playing,
					status: 'done'
				}
			}
			break;
		case types.SET_XM_PLAYER_DETAIL:
			if(action.storage) {
				return {
					songName: action.data.song_name,
					albumPic:action.data.album_pic,
					artiseName:action.data.artist_name,
					playing: action.playing,
					status: 'done'
				}
			}else {
				return {
					songName: action.data.song_name,
					albumPic:action.data.album_logo,
					artiseName:action.data.artist_name,
					playing: true,
					status: 'done'
				}
			}
			break;
		case types.SET_PLAYER_PAUSE:
			return {
				...state,
				playing: false,
				status: 'pause'
			}
			break;
		case types.SET_PLAYER_RESUME:
			return {
				...state,
				playing: true,
				status: 'resume'
			}
			break;
		default: 
			return state
			break;
	}
}
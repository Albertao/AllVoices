import * as stypes from './storage/StorageTypes'
import neEnc from './neEnc'
import getNeteaseSongDetail from './neDetail'
import * as types from '../actions/ActionTypes'
import {NativeModules} from 'react-native'

export function playSong(ret, kind, dispatch) {
	if(kind == 'next') {
		console.log(ret.type)
		switch(ret.type) {
			case stypes.SONG_LIST_LOOP:
				SongListLoopNext(ret, dispatch)
				break
			case stypes.RANDOM_LOOP:
				SongListRandom(ret, dispatch)
				break
			case stypes.SINGLE_SONG_LOOP:
				SongListLoopNext(ret, dispatch)
				break
		}
	} else if(kind == 'prev') {
		switch(ret.type) {
			case stypes.SONG_LIST_LOOP:
				SongListPrev(ret, dispatch)
				break
			case stypes.RANDOM_LOOP:
				SongListRandom(ret, dispatch)
				break
			case stypes.SINGLE_SONG_LOOP:
				SongListPrev(ret, dispatch)
				break
		}
	} else {
		//natural next
		switch(ret.type) {
			case stypes.SONG_LIST_LOOP:
				SongListLoopNext(ret, dispatch)
				break
			case stypes.RANDOM_LOOP:
				SongListRandom(ret, dispatch)
				break
			case stypes.SINGLE_SONG_LOOP:
				SingleSongLoop(ret, dispatch)
				break
		}
	}
}

function SongListLoopNext(ret, dispatch) {
	var index = ret.index
	if(index + 1 == ret.songs.length) {
		var song = ret.songs[0]
	}else {
		var song = ret.songs[ret.index+1]
	}
	ret.index = index + 1
	storage.load({
		key: 'activeSongList',
		id: 1
	}).then((active) => {
		storage.save({
			key: 'songList',
			id: active.activeId,
			data: ret
		})
	})
	playSourceSong(song, dispatch)
}

function SongListRandom(ret, dispatch) {
	var length = ret.songs.length - 1
	var randomIndex = parseInt(Math.random()*length, 10)
	ret.index = randomIndex
	storage.save({
		key: 'songList',
		id: 1,
		data: ret
	})
	playSourceSong(ret.songs[randomIndex], dispatch)
}

function SingleSongLoop(ret, dispatch) {
	playSourceSong(ret.songs[ret.index], dispatch)
}

function SongListPrev(ret, dispatch) {
	var index = ret.index
	if(index == 0) {
		var song = ret.songs[ret.songs.length-1]
	}else {
		var song = ret.songs[ret.index-1]
	}
	ret.index = index - 1
	storage.save({
		key: 'songList',
		id: 1,
		data: ret
	})
	playSourceSong(song, dispatch)
}

export function playSourceSong(song, dispatch) {
	switch(song.source) {
		case stypes.NETEASE:
			var detail = neEnc({ids: [song.song_id], br: 12800, csrf_token: ''})
			getNeteaseSongDetail(detail, song)
			dispatch({'type': types.SET_NE_PLAYER_DETAIL, playing: true, storage: true, data: song})
			break
		case stypes.XIAMI:
			NativeModules.MusicService.play(song)
			dispatch({'type': types.SET_XM_PLAYER_DETAIL, playing: true, storage: true, data: song})
			break
		default:
			return false 
			break
	}
}
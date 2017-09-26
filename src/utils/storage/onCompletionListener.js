import * as stypes from './StorageTypes'
import * as types from '../../actions/ActionTypes'
import getNeteaseSongDetail from '../neDetail'
import neEnc from '../neEnc'
import {NativeModules} from 'react-native'
import {playSong} from '../playSong'

export default function onCompletionEventListener(e, dispatch) {
	storage.load({
		key: 'activeSongList',
		id: 1
	}).then((active) => {
		storage.load({
			key: 'songList',
			id: active.activeId
		}).then((ret) => {
			//todo switch play type
			playSong(ret, 'natural', dispatch)
		})
	})
}
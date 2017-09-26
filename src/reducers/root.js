import {combineReducers} from 'redux';
import getNeteaseList from './netease'
import getNeteaseListDetail from './neList'
import neteaseSearch from './neSearch'
import getNeteaseSongDetail from './neDetail'
import getXiamiList from './xiami'
import getXiamiListDetail from './xmList'
import xiamiSearch from './xmSearch'
import getQQMusicList from './qqmusic'
import getQQMusicListDetail from './qqList'
import getPlayerDetail from './player'
import navReducer from './nav'

const rootReducer = combineReducers({
  navReducer,
  getNeteaseList,
  getNeteaseListDetail,
  neteaseSearch,
  getNeteaseSongDetail,
  getXiamiList,
  getXiamiListDetail,
  xiamiSearch,
  getQQMusicList,
  getQQMusicListDetail,
  getPlayerDetail,
});

export default rootReducer;

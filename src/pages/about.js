import React, {Component} from 'react'
import ParallaxScrollView from 'react-native-parallax-scroll-view'
import {Alert, Platform, TouchableNativeFeedback, ToastAndroid, Linking, BackHandler, Image, Text, View, StatusBar} from 'react-native'
import {NavigationActions} from 'react-navigation'
import {Button, Header, Avatar, List, ListItem} from 'react-native-elements'
import Icon from 'react-native-vector-icons/MaterialIcons'
import {
  isFirstTime,
  isRolledBack,
  packageVersion,
  currentVersion,
  checkUpdate,
  downloadUpdate,
  switchVersion,
  switchVersionLater,
  markSuccess,
} from 'react-native-update';
import _updateConfig from '../../update.json';
import Modal from 'react-native-modalbox'

const {appKey} = _updateConfig[Platform.OS];

const mailAddress = 'me@alberthao.cc'

const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

export default class AboutAllVoices extends Component {

	constructor(props) {
		super(props)
		this.state = {
			downloading: false,
			newVersionInfo: {
				name: '加载中',
				description: '……'
			}
		}
	}

	doUpdate = () => {
		ToastAndroid.show('下载中……请稍候', ToastAndroid.SHORT)
		this.setState({downloading: true})
		downloadUpdate(this.state.newVersionInfo).then(hash => {
			this.setState({downloading: false})
			Alert.alert('提示', '下载完毕,是否重启应用?', [
		        {text: '是', onPress: ()=>{switchVersion(hash);}},
		        {text: '否',},
		        {text: '下次启动时', onPress: ()=>{switchVersionLater(hash);}},
		    ]);
		}).catch((err) => {
			this.setState({downloading: false})
			ToastAndroid.show('下载失败，请稍后再试', ToastAndroid.SHORT)
		})
	}

	AboutList = [
	  {
	    name: '检查更新',
	    icon: 'update',
	    subtitle: 'Vice President',
	    onPress: () => {
	    	ToastAndroid.show('正在检查更新中……请稍候', ToastAndroid.SHORT)
	    	checkUpdate(appKey).then((info) => {
	    		if(info.expired) {
	    			ToastAndroid.show('您当前应用已经过期了，请前往应用市场下载最新版本~', ToastAndroid.SHORT)
	    		}
	    		else if(info.upToDate) {
	    			ToastAndroid.show('当前已经是最新版本了，无需更新~', ToastAndroid.SHORT)
	    		}else {
	    			this.setState({
	    				newVersionInfo: info
	    			})
	    			this.refs.updateModal.open()
	    		}
	    	}).catch(err => {
	    		ToastAndroid.show('网络链接失败，请稍后再试', ToastAndroid.SHORT)
	    	})
	    }
	  },
	  {
	    name: '联系我',
	    icon: 'account-box',
	    subtitle: 'Vice Chairman',
	    onPress: () => {
	    	Linking.canOpenURL("mailto:" + mailAddress).then((supported) => {
	    		if(supported) {
	    			Linking.openURL("mailto:" + mailAddress)
	    		} else {
	    			ToastAndroid.show('我的邮箱地址：'+mailAddress, ToastAndroid.LONG)
	    		}
	    	}).catch((err) => {
	    		console.log(err)
	    	})
	    }
	  }
	]

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
	}

	onBackPress = () => {
		this.props.navigation.goBack()
		return true
	}

	renderUpdateModal() {
		return (
			<Modal
			  coverScreen={true}
			  style={{height: 300, justifyContent: 'center', alignItems: 'center'}}
			  position={"center"}
			  backButtonClose={true}
			  swipeArea={300}
			  ref={"updateModal"}>
			  	<View style={{width: 0.7*width}}>
				  	<Text style={{color: 'rgba(0, 0, 0, 0.87)'}}>版本号：{this.state.newVersionInfo.name}</Text>
					<Text style={{color: 'rgba(0, 0, 0, 0.54)'}}>更新内容： </Text>
		  			<Text>{this.state.newVersionInfo.description}</Text>
			  	</View>
				<View style={{flexDirection: 'row', marginTop: 20}}>
				<Button
				  raised
				  onPress={this.doUpdate}
				  icon={{name: 'done'}}
				  backgroundColor='#2096f3'
				  disabled={this.state.downloading}
				  title='确定' />
				<Button
				  raised
				  onPress={() => this.refs.updateModal.close()}
				  icon={{name: 'close'}}
				  title='取消' />
				</View>
			</Modal>
		)
	}

	render() {
		return (
			<ParallaxScrollView
			  parallaxHeaderHeight={300}
			  backgroundSpeed={10}
			  outputScaleValue={10}
			  renderStickyHeader={() => (
			  	<View style={{backgroundColor: "#66ccff", width: window.width}}>
			  		<View style={{height: StatusBar.currentHeight, backgroundColor: '#03a9f4'}}></View>
					<Icon.ToolbarAndroid
					  navIconName="navigate-before"
					  iconSize={30}
					  onIconClicked ={() => this.props.navigation.goBack()}
					  style={{elevation: 2, height: 60, backgroundColor: '#03a9f4'}}
					  title={'我的歌单'}
					  titleColor="#fff"
					/>
			  	</View>
			  )}
			  stickyHeaderHeight={56+StatusBar.currentHeight}
			  renderBackground={() => (
                <View key="background">
                  <Image source={require('../static/background.jpg')}
                  	width={window.width}
                  	height={300}>
                  	<View style={{
                  	  top: 0,
               	  	  position: 'relative',
                      width: window.width,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      height: 300 }}/>
                    </Image>
	              </View>
	            )}
			  renderForeground={() => (
			  	<View style={{ height: 300, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				  	<Avatar 
					  rounded 
					  large
					  source={require('../static/logo.png')}
					  containerStyle={{marginBottom: 20}}
					/>
					<Text style={{fontSize: 24, color: 'rgba(0, 0, 0, 0.87)'}}>关于AllVoices</Text>
					<Text style={{fontSize: 18, color: 'rgba(0, 0, 0, 0.54)'}}>You Deserve All Voices.</Text>
        		</View>
			  )}
			  backgroundSpeed={10}
			>
				<StatusBar backgroundColor='rgba(0, 0, 0, 0.3)' translucent={true} />
				<View>
					<List containerStyle={{marginTop: 20, height: 0.53*height}}>
					  {
					    this.AboutList.map((l, i) => (
					      <TouchableNativeFeedback key={i} onPress={l.onPress}>
						      <ListItem
						        leftIcon={{name:l.icon}}
						        title={l.name}
						      />
					      </TouchableNativeFeedback>
					    ))
					  }
					</List>
					<View style={{marginBottom: 30, height: 0.3*height, alignItems: 'center'}}>
						<Text style={{fontSize: 24, color: 'rgba(0, 0, 0, 0.87)'}}>Created In Guangzhou</Text>
						<Text style={{marginBottom: 10, fontSize: 24, color: 'rgba(0, 0, 0, 0.87)'}}>With Peace And Love!</Text>
						<Image source={require('../static/cat.png')} />
						<Text style={{fontSize: 18, color: 'rgba(0, 0, 0, 0.54)'}}>Looking For Job, Meow~</Text>
					</View>
				</View>
				{this.renderUpdateModal()}
			</ParallaxScrollView>
		)
	}
}
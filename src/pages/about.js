import React, {Component} from 'react'
import ParallaxScrollView from 'react-native-parallax-scroll-view'
import {Platform, TouchableNativeFeedback, ToastAndroid, Linking, BackHandler, Image, Text, View, StatusBar} from 'react-native'
import {NavigationActions} from 'react-navigation'
import {Header, Avatar, List, ListItem} from 'react-native-elements'
import Icon from 'react-native-vector-icons/MaterialIcons'
import {checkUpdate} from 'react-native-update'
import _updateConfig from '../../update.json';
const {appKey} = _updateConfig[Platform.OS];

const mailAddress = 'me@alberthao.cc'

const Dimensions = require('Dimensions')

const {width, height} = Dimensions.get('window')

const AboutList = [
	  {
	    name: '检查更新',
	    icon: 'update',
	    subtitle: 'Vice President',
	    onPress: () => {
	    	checkUpdate(appKey).then((info) => {
	    		if(info.expired) {
	    			ToastAndroid.show('您当前应用已经过期了，请前往应用市场下载最新版本~', ToastAndroid.SHORT)
	    		}
	    		if(info.upToDate) {
	    			ToastAndroid.show('当前已经是最新版本了，无需更新~', ToastAndroid.SHORT)
	    		}
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

export default class AboutAllVoices extends Component {

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
					    AboutList.map((l, i) => (
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
			</ParallaxScrollView>
		)
	}
}
import React, { Component } from 'react';
import {TouchableNativeFeedback, StyleSheet, FlatList, Image, Text, View} from 'react-native';

export default class Drawer extends Component {
	render() {
		return (
			<View>
				<Image 
				source={require('./../static/background.jpg')}
				style={styles.backPic} >
					<Image 
					source={require('./../static/logo.png')}
					style={styles.avatar} />
					<Text style={styles.subheader}>Open one, hear all.</Text>
				</Image>
				<FlatList
				style={styles.outList}
  				data={[
  					{key: '虾米', pic: require('./../static/xmlogo.png'), route: 'XmNav'}, 
  					{key: '网易', pic: require('./../static/nelogo.png'), route: 'NeNav'},
            {key: '我的歌单', pic: require('./../static/list.png'), route: 'AvNav'},
  					{key: '关于allVoices', pic: require('./../static/aboutme.png'), route: 'AboutAllVoices'},
  				]}
  				renderItem={({item}) => (
  					<View>
						<TouchableNativeFeedback 
						onPress={() => {this.props.navigation.navigate(item.route)}}
						>
							<View style={styles.list}>
								<Image source={item.pic} style={styles.logo} />
								<Text style={styles.text}>        {item.key}</Text>
							</View>
						</TouchableNativeFeedback>
  					</View>
  				)}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
  outList: {
  	padding: 15,
  },
  backPic: {
  	height: 200,
  },
  list: {
  	padding: 15,
  	flex: 1,
  	flexDirection: 'row',
  },
  text: {
	fontSize: 15,
	fontWeight: '500',
  },
  logo: {
  	width: 23,
  	height: 23,
  	paddingRight: 5,
  },
  avatar: {
  	position: 'relative',
  	top: 60,
  	left: 20,
	width: 80,
	height: 80,
	borderRadius: 80,
  },
  subheader: {
  	fontWeight: '600',
	fontSize: 25,
	position:'relative',
	top:70,
	left:20,
  },
});
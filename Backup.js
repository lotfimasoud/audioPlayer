import React, { Component } from 'react';
import {
	Image,
	StyleSheet,
	View,
	TouchableOpacity,
	Button
} from 'react-native';
import { Audio } from 'expo-av'
import Slider from '@react-native-community/slider'
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import DocumentPicker from 'react-native-document-picker'
import * as ImagePicker from 'expo-image-picker'
import Home from "./Home"


let source;
const audioBookPlaylist = [
	{
		imageSource: require('./assets/cover2.jpg'),
	}]
	


export default class Music extends Component {

	constructor(props) {

		super(props);
		this.index = 0;
		this.isSeeking = false;
		this.shouldPlayAtEndOfSeek = false;
		this.playbackInstance = null;
		this.state = {
			playbackInstancePosition: null,
			playbackInstanceDuration: null,
			shouldPlay: false,
			isPlaying: false,
			isBuffering: false,
			isLoading: true,
			fontLoaded: false,
			volume: 1.0,
			image: null
		};
	}

	componentDidMount() {
		Audio.setAudioModeAsync({
			allowsRecordingIOS: false,
			interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
			playsInSilentModeIOS: true,
			interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
			shouldDuckAndroid: true,
			staysActiveInBackground: true,
			playThroughEarpieceAndroid: true
		});
	}


	pickAudio = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
		});
		source = { uri: result.uri };
		if (!result.cancelled) {
			console.log('ok');
		}
		this.loadNewPlaybackInstance(true);
	}

	async loadNewPlaybackInstance(playing) {
		if (this.playbackInstance != null) {
			await this.playbackInstance.unloadAsync();
			this.playbackInstance.setOnPlaybackStatusUpdate(null);
			this.playbackInstance = null;
		}
		const initialStatus = {
			shouldPlay: playing,
		};

		const { sound } = await Audio.Sound.createAsync(
			source,
			initialStatus,
			this.onPlaybackStatusUpdate
		);
		this.playbackInstance = sound;

		this.updateScreenForLoading(false);
	}

	updateScreenForLoading(isLoading) {
		if (isLoading) {
			this.setState({
				isPlaying: false,

				playbackInstanceDuration: null,
				playbackInstancePosition: null,
				isLoading: true,
			});
		} else {
			this.setState({
				portrait: audioBookPlaylist[this.index].image,
				isLoading: false,
			});
		}
	}

	onPlaybackStatusUpdate = status => {
		if (status.isLoaded) {
			this.setState({
				playbackInstancePosition: status.positionMillis,
				playbackInstanceDuration: status.durationMillis,
				shouldPlay: status.shouldPlay,
				isPlaying: status.isPlaying,

			});
			if (status.didJustFinish) {
				this.advanceIndex(true);
				this.updatePlaybackInstanceForIndex(true);
			}
		} else {
			if (status.error) {
				console.log(`ERROR: ${status.error}`);
			}
		}
	};

	advanceIndex(forward) {
		this.index =
			(this.index + (forward ? 1 : audioBookPlaylist.length - 1)) %
			audioBookPlaylist.length;
	}

	async updatePlaybackInstanceForIndex(playing) {
		this.updateScreenForLoading(true);

		this.loadNewPlaybackInstance(playing);
	}

	playPause = () => {
		if (this.playbackInstance != null) {
			if (this.state.isPlaying) {
				this.playbackInstance.pauseAsync();
			} else {
				this.playbackInstance.playAsync();
			}
		}
	};


	forward = () => {
		if (this.playbackInstance != null) {
			this.advanceIndex(true);
			this.updatePlaybackInstanceForIndex(this.state.shouldPlay);
		}
	};

	backward = () => {
		if (this.playbackInstance != null) {
			this.advanceIndex(false);
			this.updatePlaybackInstanceForIndex(this.state.shouldPlay);
		}
	};



	sliderValueChange = value => {
		if (this.playbackInstance != null && !this.isSeeking) {
			this.isSeeking = true;
			this.shouldPlayAtEndOfSeek = this.state.shouldPlay;

		}
	};

	sliderComplete = async value => {
		if (this.playbackInstance != null) {
			this.isSeeking = false;
			const seekPosition = value * this.state.playbackInstanceDuration;
			if (this.shouldPlayAtEndOfSeek) {
				this.playbackInstance.playFromPositionAsync(seekPosition);
			} else {
				this.playbackInstance.setPositionAsync(seekPosition);
			}
		}
	};

	sliderValue() {
		if (
			this.playbackInstance != null &&
			this.state.playbackInstancePosition != null &&
			this.state.playbackInstanceDuration != null
		) {
			return (
				this.state.playbackInstancePosition /
				this.state.playbackInstanceDuration
			);
		}
		return 0;
	}


	render() {
		return (
			<View style={styles.container}>
				<View style={{ flex: 1, position: 'absolute', left: 10, top: 10 }}>
					<TouchableOpacity activeOpacity={0.5} onPress={this.pickAudio}>
						<MaterialIcons name="menu" size={32} color="#FFF" style={{ marginTop: 16 }} />
					</TouchableOpacity>
				</View>
				<View style={{ flex: 1, position: 'absolute', right: 10, top: 30 }}>
					<Home />	
				</View>
				<Image
					style={styles.Cover}
					source={audioBookPlaylist[this.index].imageSource}
				/>

				<View style={{ margin: 32, }}>
					<Slider
						style={{ width: 300, height: 40 }}
						value={this.sliderValue()}
						onValueChange={this.sliderValueChange}
						onSlidingComplete={this.sliderComplete}
						thumbStyle={styles.thumb}
						minimumTrackTintColor="#FFF"
						maximumTrackTintColor="darkgray"
						disabled={this.state.isLoading}
					/>
				</View>
				<View style={styles.controls}>
					<TouchableOpacity style={styles.control} onPress={this.backward}
						disabled={this.state.isLoading}>
						<FontAwesome5 name="backward" size={32} color="#FFF" style={{ marginTop: 16 }} />
					</TouchableOpacity>
					<TouchableOpacity style={styles.playTouch} onPress={this.playPause}
						disabled={this.state.isLoading}
					>
						{this.state.isPlaying ? (
							<FontAwesome5 name="pause" size={32} color="#FFF" />
						) : (
							<FontAwesome5 name="play" size={32} color="#FFF" style={{ marginLeft: 8 }} />
						)}
					</TouchableOpacity>
					<TouchableOpacity style={styles.control} onPress={this.forward}
						disabled={this.state.isLoading}>
						<FontAwesome5 name="forward" size={32} color="#FFF" style={{ marginTop: 16 }} />
					</TouchableOpacity>

				</View>

			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
		alignItems: 'center',
		justifyContent: 'center'
	},
	Cover: {
		width: 250,
		height: 250,
		borderRadius: 125
	},
	portraitContainer: {
		marginTop: 80,
	},
	portrait: {
		height: 200,
		width: 200,
	},
	detailsContainer: {
		height: 40,
		marginTop: 40,
		alignItems: 'center',
	},
	playbackContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center',
		alignSelf: 'stretch',
	},
	playbackSlider: {
		alignSelf: 'stretch',
		marginLeft: 10,
		marginRight: 10,
	},

	buttonsContainerBase: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},

	control: {
		margin: 22
	},
	playTouch: {
		backgroundColor: "#eb3b5a",
		width: 100,
		height: 100,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 32,
		shadowColor: "#5D3F6A",
		shadowRadius: 30,
		shadowOpacity: 0.5,
		marginTop: 5
	},
	controls: {
		flexDirection: 'row',
		marginTop: 32
	},
	buttonStyle: {
		backgroundColor: '#307ecc',
		borderWidth: 0,
		color: '#FFFFFF',
		borderColor: '#307ecc',
		height: 40,
		alignItems: 'center',
		borderRadius: 30,
		marginLeft: 35,
		marginRight: 35,
		marginTop: 15,
	},
	buttonTextStyle: {
		color: '#FFFFFF',
		paddingVertical: 10,
		fontSize: 16,
	},
});
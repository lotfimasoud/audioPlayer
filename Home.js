import React from "react"
import {Button} from "react-native"
import { useNavigation } from '@react-navigation/native';

const Home = () => {
    const navigation = useNavigation();
	return (
	  
		<Button
		  title="App Music"
		  color="#000"
		  onPress={() => navigation.navigate('AppMusic') }
		/>
	 
	);
  }
  export default Home
import React from "react"
import {TouchableOpacity} from "react-native"
import { useNavigation } from '@react-navigation/native';
import { Ionicons  } from '@expo/vector-icons'
const Home = () => {
    const navigation = useNavigation();
	return (
	  
		<TouchableOpacity onPress={() => navigation.goBack('Music') }>
            <Ionicons  name="arrow-back" size={32} color="#FFF" style={{ marginTop: 16 }} />
        </TouchableOpacity>

	)
  }
  export default Home
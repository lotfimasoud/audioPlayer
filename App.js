//import liraries
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Music from "./Music"
import AppMusic from "./AppMusic"


const Stack = createStackNavigator()

const App = () => {
	return (
		<NavigationContainer>
		<Stack.Navigator
		screenOptions={{
			headerShown: false
		  }}
		>
		  <Stack.Screen name="Music" component={Music} />
		  <Stack.Screen name="AppMusic" component={AppMusic} />
		</Stack.Navigator>
	  </NavigationContainer>
	);
};


const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		
	},
});


export default App;

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import { TouchableOpacity, Text } from 'react-native'

import TestScreen from '../screens/TestScreen'
import HomeScreen from '../screens/HomeScreen'
import StotraListScreen from '../screens/StotraListScreen'
import StotraDetailScreen from '../screens/StotraDetailScreen'
import SettingsScreen from '../screens/SettingsScreen'
import FavoritesScreen from '../screens/FavoritesScreen'

const Stack = createNativeStackNavigator()

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: { backgroundColor: '#FFF' },
                    headerTintColor: '#333',
                    headerTitleStyle: { fontWeight: 'bold' },
                    contentStyle: { backgroundColor: '#FFF' },
                }}
            >
                <Stack.Screen name="Test" component={TestScreen} options={{ title: 'Test' }} />
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={({ navigation }) => ({
                        title: 'భక్తి వాణి',
                        headerTitleAlign: 'center',
                        headerRight: () => (
                            <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginRight: 16 }}>
                                <Text style={{ fontSize: 26 }}>⚙️</Text>
                            </TouchableOpacity>
                        ),
                    })}
                />
                <Stack.Screen name="StotraList" component={StotraListScreen} />
                <Stack.Screen name="StotraDetail" component={StotraDetailScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'సెట్టింగ్‌లు' }} />
                <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'నాకు ఇష్టమైనవి' }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigator

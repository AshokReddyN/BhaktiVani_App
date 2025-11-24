import React, { useState, useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native'
import { TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Language, LanguageService } from '../services/languageService'
import { getTranslations } from '../utils/translations'

import TestScreen from '../screens/TestScreen'
import HomeScreen from '../screens/HomeScreen'
import StotraListScreen from '../screens/StotraListScreen'
import StotraDetailScreen from '../screens/StotraDetailScreen'
import SettingsScreen from '../screens/SettingsScreen'
import FavoritesScreen from '../screens/FavoritesScreen'

const Stack = createNativeStackNavigator()

const AppNavigator = () => {
    const [currentLanguage, setCurrentLanguage] = useState<Language>('telugu')
    const navigationRef = useNavigationContainerRef()

    useEffect(() => {
        const loadLanguage = async () => {
            const lang = await LanguageService.getCurrentLanguage()
            setCurrentLanguage(lang || 'telugu')
        }
        loadLanguage()

        // Listen for navigation state changes to reload language
        const unsubscribe = navigationRef.addListener('state', () => {
            loadLanguage()
        })

        return unsubscribe
    }, [navigationRef])

    const t = getTranslations(currentLanguage)

    return (
        <NavigationContainer ref={navigationRef}>
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
                        title: t.appName,
                        headerTitleAlign: 'center',
                        headerRight: () => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginRight: 16 }}>
                                <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
                                    <Ionicons name="heart" size={24} color="#F97316" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                                    <Ionicons name="settings" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>
                        ),
                    })}
                />
                <Stack.Screen name="StotraList" component={StotraListScreen} />
                <Stack.Screen name="StotraDetail" component={StotraDetailScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t.settings }} />
                <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: t.favorites }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigator

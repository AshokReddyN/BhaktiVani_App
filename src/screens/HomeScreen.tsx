import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { database } from '../database'
import Deity from '../database/models/Deity'
import { LanguageService } from '../services/languageService'
import { SearchBar } from '../components/SearchBar'
import { searchDeities, getDeityDisplayName } from '../utils/searchUtils'

const HomeScreen = () => {
    const navigation = useNavigation()
    const [deities, setDeities] = useState<Deity[]>([])
    const [currentLanguage, setCurrentLanguage] = useState<'telugu' | 'kannada'>('telugu')
    const [searchQuery, setSearchQuery] = useState('')

    // Filter deities based on search query using fuzzy matching
    const filteredDeities = useMemo(() => {
        return searchDeities(deities, searchQuery, currentLanguage);
    }, [deities, searchQuery, currentLanguage]);

    // Load language preference when screen focuses
    useFocusEffect(
        React.useCallback(() => {
            const loadDeitiesAndLanguage = async () => {
                try {
                    const deitiesCollection = database.get<Deity>('deities');
                    const allDeities = await deitiesCollection.query().fetch();
                    console.log(`HomeScreen: Loaded ${allDeities.length} deities`);
                    setDeities(allDeities);

                    // If no deities found, try to seed database
                    if (allDeities.length === 0) {
                        console.log('HomeScreen: No deities found, attempting to seed database...');
                        const { seedDatabase } = require('../database/seed');
                        await seedDatabase();
                        // Re-fetch after seeding
                        const refreshedDeities = await deitiesCollection.query().fetch();
                        console.log(`HomeScreen: After seeding, found ${refreshedDeities.length} deities`);
                        setDeities(refreshedDeities);
                    }

                    // Also refresh current language in case it changed
                    const lang = await LanguageService.getCurrentLanguage();
                    setCurrentLanguage(lang || 'telugu');
                } catch (error) {
                    console.error('HomeScreen: Error loading deities:', error);
                }
            };
            loadDeitiesAndLanguage();
        }, [])
    )

    useEffect(() => {
        const fetchDeities = async () => {
            try {
                const data = await database.get<Deity>('deities').query().fetch();
                console.log(`HomeScreen: Initial load - ${data.length} deities`);
                setDeities(data);

                // If no data, try seeding
                if (data.length === 0) {
                    console.log('HomeScreen: No deities on initial load, seeding...');
                    const { seedDatabase } = require('../database/seed');
                    await seedDatabase();
                    const refreshed = await database.get<Deity>('deities').query().fetch();
                    console.log(`HomeScreen: After seeding - ${refreshed.length} deities`);
                    setDeities(refreshed);
                }
            } catch (error) {
                console.error('HomeScreen: Error in useEffect:', error);
            }
        };
        fetchDeities();
    }, [])

    const renderItem = ({ item }: { item: Deity }) => {
        // Map deity image field to actual image files
        const getDeityImage = (imageName: string) => {
            const imageMap: { [key: string]: any } = {
                'ganesha': require('../assets/ganesha.png'),
                'venkateswara': require('../assets/venkateswara.png'),
                'shiva': require('../assets/shiva.png'),
                'vishnu': require('../assets/vishnu.png'),
                'lakshmi': require('../assets/lakshmi.png'),
                'hanuman': require('../assets/hanuman.png'),
                'rama': require('../assets/rama.png'),
                'krishna': require('../assets/krishna.png'),
                'saraswati': require('../assets/saraswati.png'),
            };
            return imageMap[imageName] || null;
        };

        const deityName = currentLanguage === 'telugu'
            ? (item.nameTelugu || item.name)
            : (item.nameKannada || item.name);

        const imageSource = getDeityImage(item.image);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('StotraList', { deityId: item.id, deityName: item.name })}
            >
                <View style={styles.imageContainer}>
                    {imageSource ? (
                        <Image
                            source={imageSource}
                            style={styles.deityImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={styles.initial}>{deityName.charAt(0)}</Text>
                    )}
                </View>
                <Text style={styles.name}>{deityName}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search deities..."
                onClear={() => setSearchQuery('')}
            />
            {filteredDeities.length === 0 && searchQuery.length > 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No deities found</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Try searching with a different name
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredDeities}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    card: {
        flex: 1,
        margin: 8,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#000',
    },
    deityImage: {
        width: '100%',
        height: '100%',
    },
    initial: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: 'white',
    },
})

export default HomeScreen

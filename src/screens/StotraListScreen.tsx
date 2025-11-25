import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { database } from '../database'
import Stotra from '../database/models/Stotra'
import Deity from '../database/models/Deity'
import { Q } from '@nozbe/watermelondb'
import { Language, LanguageService } from '../services/languageService'
import { getTranslations } from '../utils/translations'
import { SearchBar } from '../components/SearchBar'

const StotraListScreen = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { deityId, deityName } = route.params as { deityId: string, deityName: string }
    const [stotras, setStotras] = useState<Stotra[]>([])
    const [currentLanguage, setCurrentLanguage] = useState<Language>('telugu')
    const [deity, setDeity] = useState<Deity | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchStotras = useCallback(async () => {
        const collection = database.get<Stotra>('stotras')
        const query = collection.query(Q.where('deity_id', deityId))
        const data = await query.fetch()
        setStotras(data)
    }, [deityId])

    // Filter stotras based on search query
    const filteredStotras = useMemo(() => {
        if (!searchQuery || searchQuery.trim().length === 0) {
            return stotras;
        }

        const normalizedQuery = searchQuery.toLowerCase().trim();

        return stotras.filter(stotra => {
            const title = (stotra.title || '').toLowerCase();
            const titleEnglish = (stotra.titleEnglish || '').toLowerCase();
            const titleTelugu = (stotra.titleTelugu || '').toLowerCase();
            const titleKannada = (stotra.titleKannada || '').toLowerCase();

            return title.includes(normalizedQuery) ||
                titleEnglish.includes(normalizedQuery) ||
                titleTelugu.includes(normalizedQuery) ||
                titleKannada.includes(normalizedQuery);
        });
    }, [stotras, searchQuery]);

    // Refetch when screen comes into focus (when navigating back from detail screen)
    useFocusEffect(
        useCallback(() => {
            const loadLanguage = async () => {
                const lang = await LanguageService.getCurrentLanguage()
                setCurrentLanguage(lang || 'telugu')

                // Fetch deity to get language-specific name
                const deityRecord = await database.get<Deity>('deities').find(deityId)
                setDeity(deityRecord)

                // Update screen title with deity name in selected language
                const deityNameInLanguage = lang === 'telugu' ? deityRecord.nameTelugu : deityRecord.nameKannada
                navigation.setOptions({ title: deityNameInLanguage })

                // Re-fetch stotras to trigger re-render
                await fetchStotras()
            }
            loadLanguage()
        }, [fetchStotras, deityId, navigation])
    )

    useEffect(() => {
        navigation.setOptions({ headerShown: false })
    }, [navigation])

    const t = getTranslations(currentLanguage)
    const deityNameInLanguage = deity ? (currentLanguage === 'telugu' ? deity.nameTelugu : deity.nameKannada) : deityName

    const renderItem = ({ item }: { item: Stotra }) => {
        // Get language-specific title with proper fallback
        // Handle empty strings as well as null/undefined
        let displayTitle: string;
        if (currentLanguage === 'telugu') {
            displayTitle = (item.titleTelugu && item.titleTelugu.trim()) || item.title || 'Untitled';
        } else {
            // For Kannada, prefer Kannada title, fallback to Telugu if Kannada is empty, then to generic title
            displayTitle = (item.titleKannada && item.titleKannada.trim())
                || (item.titleTelugu && item.titleTelugu.trim())
                || item.title
                || 'Untitled';
        }

        return (
            <TouchableOpacity
                style={styles.stotraCard}
                onPress={() => navigation.navigate('StotraDetail', {
                    stotraId: item.id,
                    // Don't pass title - let detail screen get it from stotra object based on current language
                })}
            >
                <View style={styles.stotraContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="book" size={24} color="#EA580C" />
                    </View>
                    <Text style={styles.stotraTitle}>
                        {displayTitle}
                    </Text>
                </View>
                <Ionicons
                    name={item.isFavorite ? "heart" : "heart-outline"}
                    size={24}
                    color={item.isFavorite ? "#F97316" : "#D1D5DB"}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.appName}</Text>
            </View>
            <Text style={styles.deityName}>{deityNameInLanguage}</Text>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t.searchStotra}
            />
            <View style={styles.content}>
                <FlatList
                    data={filteredStotras}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7ED',
    },
    header: {
        backgroundColor: '#F97316',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 50,
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    deityName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF7ED',
    },
    content: {
        flex: 1,
    },
    stotraCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    stotraContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: 12,
    },
    stotraTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
})

export default StotraListScreen

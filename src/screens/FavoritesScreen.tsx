import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { database } from '../database'
import Stotra from '../database/models/Stotra'
import { Q } from '@nozbe/watermelondb'
import { Language, LanguageService } from '../services/languageService'
import { getTranslations } from '../utils/translations'

const FavoritesScreen = () => {
    const navigation = useNavigation()
    const [favorites, setFavorites] = useState<Stotra[]>([])
    const [currentLanguage, setCurrentLanguage] = useState<Language>('telugu')

    // Load language and update title
    useFocusEffect(
        useCallback(() => {
            const loadLanguage = async () => {
                const lang = await LanguageService.getCurrentLanguage()
                setCurrentLanguage(lang || 'telugu')

                // Update screen title
                const t = getTranslations(lang || 'telugu')
                navigation.setOptions({ title: t.favorites })

                // Fetch favorites
                const data = await database.get<Stotra>('stotras').query(Q.where('is_favorite', true)).fetch()
                setFavorites(data)
            }
            loadLanguage()
        }, [])
    )

    const renderItem = ({ item }: { item: Stotra }) => {
        const title = currentLanguage === 'telugu' ? item.titleTelugu : item.titleKannada
        return (
            <TouchableOpacity
                style={styles.favoriteCard}
                onPress={() => navigation.navigate('StotraDetail', { stotraId: item.id, title })}
            >
                <Text style={styles.favoriteTitle}>{title}</Text>
                <TouchableOpacity onPress={async () => {
                    await database.write(async () => {
                        await item.update(s => { s.isFavorite = false })
                    })
                    setFavorites(prev => prev.filter(f => f.id !== item.id))
                }}>
                    <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={favorites}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No favorites yet</Text>}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7ED',
        padding: 16,
    },
    favoriteCard: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    favoriteTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    deleteIcon: {
        color: '#EF4444',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 40,
    },
})

export default FavoritesScreen

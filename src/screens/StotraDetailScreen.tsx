import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { database } from '../database'
import Stotra from '../database/models/Stotra'

const StotraDetailScreen = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { stotraId, title } = route.params as { stotraId: string, title: string }
    const [stotra, setStotra] = useState<Stotra | null>(null)
    const [fontSize, setFontSize] = useState(18)

    useEffect(() => {
        const fetchStotra = async () => {
            const data = await database.get<Stotra>('stotras').find(stotraId)
            setStotra(data)
        }
        fetchStotra()
    }, [stotraId])

    const toggleFavorite = useCallback(async () => {
        if (stotra) {
            await database.write(async () => {
                await stotra.update(s => {
                    s.isFavorite = !s.isFavorite
                })
            })

            // Refetch to update state and trigger re-render
            const updated = await database.get<Stotra>('stotras').find(stotraId)
            setStotra(updated)
        }
    }, [stotra, stotraId])

    useLayoutEffect(() => {
        navigation.setOptions({
            title: title,
            headerRight: () => (
                <TouchableOpacity onPress={toggleFavorite} key={`fav-${stotra?.isFavorite}`}>
                    <Text style={styles.favoriteIcon}>{stotra?.isFavorite ? '★' : '☆'}</Text>
                </TouchableOpacity>
            )
        })
    }, [navigation, title, stotra?.isFavorite, toggleFavorite])

    if (!stotra) return <View style={styles.loading}><Text>Loading...</Text></View>

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Text style={[styles.content, { fontSize, lineHeight: fontSize * 1.6 }]}>
                    {stotra.content}
                </Text>
            </ScrollView>

            <View style={styles.fontControls}>
                <TouchableOpacity
                    style={styles.fontButton}
                    onPress={() => setFontSize(prev => Math.min(prev + 2, 30))}
                >
                    <Text style={styles.fontButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.fontButton, styles.fontButtonSpacing]}
                    onPress={() => setFontSize(prev => Math.max(prev - 2, 12))}
                >
                    <Text style={styles.fontButtonText}>-</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF7ED',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    content: {
        color: '#1F2937',
        fontWeight: '500',
        textAlign: 'center',
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    favoriteIcon: {
        fontSize: 24,
        color: '#F97316',
        marginRight: 16,
    },
    fontControls: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        flexDirection: 'column',
    },
    fontButton: {
        width: 48,
        height: 48,
        backgroundColor: '#374151',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8,
    },
    fontButtonSpacing: {
        marginTop: 8,
    },
    fontButtonText: {
        color: 'white',
        fontSize: 24,
    },
})

export default StotraDetailScreen

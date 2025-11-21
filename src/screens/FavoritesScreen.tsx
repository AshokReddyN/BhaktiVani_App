import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { database } from '../database'
import Stotra from '../database/models/Stotra'
import { Q } from '@nozbe/watermelondb'

const FavoritesScreen = () => {
    const navigation = useNavigation()
    const [favorites, setFavorites] = useState<Stotra[]>([])

    useEffect(() => {
        const fetchFavorites = async () => {
            const data = await database.get<Stotra>('stotras').query(Q.where('is_favorite', true)).fetch()
            setFavorites(data)
        }
        const unsubscribe = navigation.addListener('focus', fetchFavorites)
        return unsubscribe
    }, [navigation])

    const renderItem = ({ item }: { item: Stotra }) => (
        <TouchableOpacity
            style={styles.favoriteCard}
            onPress={() => navigation.navigate('StotraDetail', { stotraId: item.id, title: item.title })}
        >
            <Text style={styles.favoriteTitle}>{item.title}</Text>
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

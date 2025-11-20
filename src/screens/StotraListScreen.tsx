import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { database } from '../database'
import Stotra from '../database/models/Stotra'
import { Q } from '@nozbe/watermelondb'

const StotraListScreen = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { deityId, deityName } = route.params as { deityId: string, deityName: string }
    const [stotras, setStotras] = useState<Stotra[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchStotras = async () => {
            const collection = database.get<Stotra>('stotras')
            let query = collection.query(Q.where('deity_id', deityId))

            if (searchQuery) {
                query = collection.query(
                    Q.where('deity_id', deityId),
                    Q.where('title', Q.like(`%${searchQuery}%`))
                )
            }

            const data = await query.fetch()
            setStotras(data)
        }
        fetchStotras()
    }, [deityId, searchQuery])

    useEffect(() => {
        navigation.setOptions({ title: deityName })
    }, [deityName])

    const renderItem = ({ item }: { item: Stotra }) => (
        <TouchableOpacity
            style={styles.stotraCard}
            onPress={() => navigation.navigate('StotraDetail', { stotraId: item.id, title: item.title })}
        >
            <View style={styles.stotraContent}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>📄</Text>
                </View>
                <Text style={styles.stotraTitle}>{item.title}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    placeholder="మంత్రం కోసం వెతకండి"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={stotras}
                renderItem={renderItem}
                keyExtractor={item => item.id}
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
    searchContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
    },
    stotraCard: {
        backgroundColor: '#FFEDD5',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stotraContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#FED7AA',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    icon: {
        color: '#9A3412',
        fontWeight: 'bold',
    },
    stotraTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    arrow: {
        color: '#9CA3AF',
        fontSize: 24,
    },
})

export default StotraListScreen

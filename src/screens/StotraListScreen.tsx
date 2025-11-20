import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { database } from '../database'
import Stotra from '../database/models/Stotra'
import { Q } from '@nozbe/watermelondb'

const StotraListScreen = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { deityId, deityName } = route.params as { deityId: string, deityName: string }
    const [stotras, setStotras] = useState<Stotra[]>([])
    // const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchStotras = async () => {
            const collection = database.get<Stotra>('stotras')
            const query = collection.query(Q.where('deity_id', deityId))

            // Search functionality hidden for now
            // if (searchQuery) {
            //     query = collection.query(
            //         Q.where('deity_id', deityId),
            //         Q.where('title', Q.like(`%${searchQuery}%`))
            //     )
            // }

            const data = await query.fetch()
            setStotras(data)
        }
        fetchStotras()
    }, [deityId])

    useEffect(() => {
        navigation.setOptions({ headerShown: false })
    }, [navigation])

    const renderItem = ({ item }: { item: Stotra }) => (
        <TouchableOpacity
            style={styles.stotraCard}
            onPress={() => navigation.navigate('StotraDetail', { stotraId: item.id, title: item.title })}
        >
            <View style={styles.stotraContent}>
                <View style={styles.iconContainer}>
                    <Ionicons name="book" size={24} color="#EA580C" />
                </View>
                <Text style={styles.stotraTitle}>{item.title}</Text>
            </View>
            <Ionicons
                name={item.isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={item.isFavorite ? "#F97316" : "#D1D5DB"}
            />
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>భక్తి వాణి</Text>
            </View>
            <View style={styles.content}>
                {/* Search feature hidden for now */}
                {/* <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        placeholder="మంత్రం కోసం వెతకండి"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#9CA3AF"
                    />
                </View> */}
                <FlatList
                    data={stotras}
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    searchContainer: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    stotraCard: {
        backgroundColor: '#FEF3C7',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stotraContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stotraTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
})

export default StotraListScreen

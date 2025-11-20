import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { database } from '../database'
import Deity from '../database/models/Deity'

const HomeScreen = () => {
    const navigation = useNavigation()
    const [deities, setDeities] = useState<Deity[]>([])

    useEffect(() => {
        const fetchDeities = async () => {
            const data = await database.get<Deity>('deities').query().fetch()
            setDeities(data)
        }
        fetchDeities()
    }, [])

    const renderItem = ({ item }: { item: Deity }) => {
        let imageSource;

        switch (item.name) {
            case 'వెంకటేశ్వర స్వామి':
                imageSource = require('../assets/venkateswara.png');
                break;
            case 'గణేశుడు':
                imageSource = require('../assets/ganesha.png');
                break;
            case 'హనుమంతుడు':
                imageSource = require('../assets/hanuman.png');
                break;
            case 'శివుడు':
                imageSource = require('../assets/shiva.png');
                break;
            case 'లక్ష్మీదేవి':
                imageSource = require('../assets/lakshmi.png');
                break;
            case 'సరస్వతీ దేవి':
                imageSource = require('../assets/saraswati.png');
                break;
            default:
                imageSource = null;
        }

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
                        <Text style={styles.initial}>{item.name.charAt(0)}</Text>
                    )}
                </View>
                <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={deities}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 16,
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

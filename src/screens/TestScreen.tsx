import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Test Screen</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 24,
        color: '#000000',
    },
});

export default TestScreen;

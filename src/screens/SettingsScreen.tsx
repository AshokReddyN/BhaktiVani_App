import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const SettingsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>అక్షర పరిమాణం (Font Size)</Text>
            <View style={styles.fontSizeContainer}>
                <TouchableOpacity style={styles.fontSizeButton}><Text>చిన్న</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.fontSizeButton, styles.fontSizeButtonActive]}><Text>మధ్యస్థం</Text></TouchableOpacity>
                <TouchableOpacity style={styles.fontSizeButton}><Text>పెద్ద</Text></TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>నేపథ్యం (Theme)</Text>
            <View style={styles.themeRow}>
                <TouchableOpacity style={[styles.themeButton, styles.themeButtonLight]}>
                    <Text style={styles.themeButtonText}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.themeButton, styles.themeButtonSepia]}>
                    <Text style={styles.themeButtonTextDark}>Sepia</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.themeButtonDark}>
                <Text style={styles.themeButtonTextWhite}>Dark</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1F2937',
    },
    fontSizeContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
        marginBottom: 32,
    },
    fontSizeButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
    },
    fontSizeButtonActive: {
        backgroundColor: 'white',
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    themeRow: {
        flexDirection: 'row',
    },
    themeButton: {
        flex: 1,
        minHeight: 120,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeButtonLight: {
        borderWidth: 2,
        borderColor: '#F97316',
        backgroundColor: 'white',
    },
    themeButtonSepia: {
        backgroundColor: '#F5F0E6',
        marginLeft: 16,
    },
    themeButtonDark: {
        marginTop: 16,
        width: '100%',
        height: 128,
        borderRadius: 8,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeButtonText: {
        fontWeight: 'bold',
    },
    themeButtonTextDark: {
        fontWeight: 'bold',
        color: '#1F2937',
    },
    themeButtonTextWhite: {
        fontWeight: 'bold',
        color: 'white',
    },
})

export default SettingsScreen

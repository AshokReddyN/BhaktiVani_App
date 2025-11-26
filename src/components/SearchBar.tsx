import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Language, LanguageService } from '../services/languageService';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    placeholder,
    onClear,
}) => {
    const [currentLanguage, setCurrentLanguage] = useState<Language>('telugu');

    useEffect(() => {
        // Load current language
        const loadLanguage = async () => {
            const lang = await LanguageService.getCurrentLanguage();
            setCurrentLanguage(lang || 'telugu');
        };
        loadLanguage();
    }, []);

    const handleClear = () => {
        onChangeText('');
        if (onClear) {
            onClear();
        }
    };

    // Get localized placeholder text
    const getSearchPlaceholder = (language: Language): string => {
        const placeholders: Record<Language, string> = {
            'telugu': 'దేవతలను వెతకండి...',
            'kannada': 'ದೇವತೆಗಳನ್ನು ಹುಡುಕಿ...',
        };
        return placeholders[language] || 'Search deities...';
    };

    // Use localized placeholder if not provided
    const displayPlaceholder = placeholder || getSearchPlaceholder(currentLanguage);

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons
                    name="search"
                    size={20}
                    color="#666"
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={displayPlaceholder}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />
                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClear}
                        style={styles.clearButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    clearButton: {
        padding: 4,
        marginLeft: 4,
    },
});

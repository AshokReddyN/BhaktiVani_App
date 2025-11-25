import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    placeholder = 'Search deities...',
    onClear,
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isVoiceAvailable, setIsVoiceAvailable] = useState(false);

    useEffect(() => {
        // Check if voice recognition is available
        Voice.isAvailable().then((available) => {
            setIsVoiceAvailable(available === 1 || available === true);
        });

        // Set up voice recognition event listeners
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;

        return () => {
            // Cleanup
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, []);

    const onSpeechStart = () => {
        setIsListening(true);
    };

    const onSpeechEnd = () => {
        setIsListening(false);
    };

    const onSpeechResults = (event: any) => {
        if (event.value && event.value.length > 0) {
            const spokenText = event.value[0];
            onChangeText(spokenText);
        }
        setIsListening(false);
    };

    const onSpeechError = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);

        // Show user-friendly error message
        if (event.error?.code === 'permissions') {
            Alert.alert(
                'Microphone Permission',
                'Please enable microphone permission in your device settings to use voice search.',
                [{ text: 'OK' }]
            );
        } else if (event.error?.code !== 'no-speech') {
            // Don't show alert for "no speech" errors
            Alert.alert(
                'Voice Search Error',
                'Could not recognize speech. Please try again or use text search.',
                [{ text: 'OK' }]
            );
        }
    };

    const startVoiceRecognition = async () => {
        try {
            setIsListening(true);
            await Voice.start('en-US'); // You can change locale as needed
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            setIsListening(false);
            Alert.alert(
                'Voice Search',
                'Could not start voice recognition. Please check your microphone permissions.',
                [{ text: 'OK' }]
            );
        }
    };

    const stopVoiceRecognition = async () => {
        try {
            await Voice.stop();
            setIsListening(false);
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
            setIsListening(false);
        }
    };

    const handleMicPress = () => {
        if (isListening) {
            stopVoiceRecognition();
        } else {
            startVoiceRecognition();
        }
    };

    const handleClear = () => {
        onChangeText('');
        if (onClear) {
            onClear();
        }
    };

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
                    placeholder={placeholder}
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
                {isVoiceAvailable && (
                    <TouchableOpacity
                        onPress={handleMicPress}
                        style={[
                            styles.micButton,
                            isListening && styles.micButtonActive,
                        ]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        {isListening ? (
                            <ActivityIndicator size="small" color="#FF6B6B" />
                        ) : (
                            <Ionicons
                                name="mic"
                                size={22}
                                color={isListening ? '#FF6B6B' : '#666'}
                            />
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F5F5F5',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
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
        fontSize: 16,
        color: '#333',
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
        marginLeft: 4,
    },
    micButton: {
        padding: 4,
        marginLeft: 8,
        borderRadius: 20,
    },
    micButtonActive: {
        backgroundColor: '#FFE5E5',
    },
});

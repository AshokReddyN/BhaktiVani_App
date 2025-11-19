import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { styled } from 'nativewind';
import { router } from 'expo-router';
import deities from '../data/deities.json';
import DeityTile from '../components/DeityTile';

const StyledView = styled(View);

const HomeScreen = () => {
  const handlePress = (deityName: string) => {
    router.push({
      pathname: '/stotras',
      params: { deityName },
    });
  };

  return (
    <StyledView className="flex-1 bg-background-light dark:bg-background-dark p-4">
      <FlatList
        data={deities}
        renderItem={({ item }) => (
          <DeityTile
            name={item.name}
            image={item.image}
            onPress={() => handlePress(item.name)}
          />
        )}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ gap: 16 }}
      />
    </StyledView>
  );
};

export default HomeScreen;

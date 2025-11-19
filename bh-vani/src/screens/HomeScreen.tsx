import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import deities from '../data/deities.json';
import DeityTile from '../components/DeityTile';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledFlatList = styled(FlatList);

const HomeScreen = () => {
  return (
    <StyledView className="flex-1 bg-background-light dark:bg-background-dark p-4">
      <StyledFlatList
        data={deities}
        renderItem={({ item }) => <DeityTile name={item.name} image={item.image} />}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </StyledView>
  );
};

export default HomeScreen;

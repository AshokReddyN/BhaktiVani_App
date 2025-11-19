import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const StotraListScreen = ({ route }) => {
  const { deityName } = route.params;

  return (
    <StyledView className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
      <StyledText className="text-2xl font-bold text-slate-800 dark:text-slate-200">
        {deityName}
      </StyledText>
    </StyledView>
  );
};

export default StotraListScreen;

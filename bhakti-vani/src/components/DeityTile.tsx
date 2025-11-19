import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);

const imageMap = {
  'venkateswara_swamy.png': require('../assets/images/venkateswara_swamy.png'),
  'ganesha.png': require('../assets/images/ganesha.png'),
  'shiva.png': require('../assets/images/shiva.png'),
  'lakshmi_devi.png': require('../assets/images/lakshmi_devi.png'),
  'hanuman.png': require('../assets/images/hanuman.png'),
  'saraswati_devi.png': require('../assets/images/saraswati_devi.png'),
};

const DeityTile = ({ name, image, onPress }) => {
  return (
    <StyledTouchableOpacity
      className="flex-col gap-3 rounded-xl bg-white p-2 pb-4 shadow-sm transition-transform duration-200 ease-in-out hover:scale-105 dark:bg-slate-800 w-[48%]"
      onPress={onPress}
    >
      <StyledImage
        className="aspect-square w-full rounded-lg bg-cover bg-center bg-no-repeat"
        source={imageMap[image]}
      />
      <StyledText className="text-center text-lg font-medium text-slate-800 dark:text-slate-200">
        {name}
      </StyledText>
    </StyledTouchableOpacity>
  );
};

export default DeityTile;

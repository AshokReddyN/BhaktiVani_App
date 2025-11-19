import React from 'react';
import StotraListScreen from '../src/screens/StotraListScreen';
import { useLocalSearchParams } from 'expo-router';

const StotrasPage = () => {
  const { deityName } = useLocalSearchParams();
  return <StotraListScreen route={{ params: { deityName } }} />;
};

export default StotrasPage;

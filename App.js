// App.js
import React, { useEffect, useState } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Loader         from './Components/Loader';
import CustomTabBar   from './Components/CustomTabBar';
import Onboarding     from './Components/Onboarding';
import HomeScreen     from './Components/HomeScreen';
import ShareMood      from './Components/ShareMood';   
import Notes from './Components/Notes';
import FeedScreen     from './Components/FeedScreen';
import MapScreen      from './Components/MapScreen';
import GameScreen     from './Components/GameScreen';
import SettingsScreen from './Components/SettingsScreen';
import Journal from './Components/Journal';
import MapSetup       from './Components/MapSetup';
const Stack = createStackNavigator();
const Tabs  = createBottomTabNavigator();

/* ─── таб-бар ─── */
function TabNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="Home"     component={HomeScreen}     />
      <Tabs.Screen name="Feed"     component={FeedScreen}     />
      <Tabs.Screen name="Map"      component={MapScreen}      />
      <Tabs.Screen name="Game"     component={GameScreen}     />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

/* ─── ROOT ─── */
export default function App() {
  const [showLoader, setShowLoader] = useState(true);

  /* Loader живёт ровно 10 000 мс */
  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 10_000);
    return () => clearTimeout(t);
  }, []);

  if (showLoader) {
    return <Loader />;        // ваш экран-пульс
  }

  const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#B71C1C' },
  };

  return (
    <>
      <StatusBar
        translucent
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
      />

      <NavigationContainer theme={theme}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Onboarding"
        >
          {/* Onboarding → затем переходим на Main (таб-навигацию) */}
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Main"       component={TabNavigator} />

          {/*
            Здесь мы добавляем экран ShareMood на уровне стека (вне табов),
            чтобы из HomeScreen при navigation.navigate('ShareMood') было куда перейти.
          */}
          <Stack.Screen name="ShareMood" component={ShareMood} />
          <Stack.Screen name="Notes" component={Notes} />
             <Stack.Screen name="MapSetup" component={MapSetup} /> 
             <Stack.Screen name="Journal" component={Journal} /> 
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

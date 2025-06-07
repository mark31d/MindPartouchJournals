// Components/ShareMood.js

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const BG         = require('../assets/onb_bg.png');
const ARROW_LEFT = require('../assets/arrow_l.png');

const EMOTIONS = [
  'CALM',
  'ANXIOUS',
  'TIRED',
  'INSPIRED',
  'IRRITATED',
  'UNFOCUSED',
  'CURIOUS',
];

export default function ShareMood() {
  const navigation = useNavigation();

  // Изначально все эмоции по 0.5:
  const initialState = EMOTIONS.reduce((acc, label) => {
    acc[label] = 0.5;
    return acc;
  }, {});
  const [values, setValues] = useState(initialState);

  const onValueChange = (label, val) => {
    setValues(prev => ({ ...prev, [label]: val }));
  };

  const goBack = () => {
    navigation.goBack();
  };

  const onSubmit = async () => {
    // Сохраняем в AsyncStorage под ключом mood_YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm   = String(today.getMonth() + 1).padStart(2, '0');
    const dd   = String(today.getDate()).padStart(2, '0');
    const key  = `mood_${yyyy}-${mm}-${dd}`;

    try {
      await AsyncStorage.setItem(key, JSON.stringify(values));
      console.log('Saved mood under key:', key);
    } catch (e) {
      console.warn('Failed to save mood to AsyncStorage:', e);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.safe}>
      <ImageBackground source={BG} style={styles.background} resizeMode="cover">
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Image source={ARROW_LEFT} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>HOW ARE YOU TODAY?</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {EMOTIONS.map((label) => (
            <View key={label} style={styles.sliderContainer}>
              <View style={styles.sliderBackground} />
              <Text style={styles.sliderLabel}>{label}</Text>
              <View style={styles.sliderRow}>
                <View style={styles.track} />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={values[label]}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="transparent"
                  thumbTintColor="#FFFFFF"
                  onValueChange={(val) => onValueChange(label, val)}
                />
              </View>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} activeOpacity={0.8}>
            <Text style={styles.submitText}>MARK AND RELEASE</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const BORDER_RADIUS = 32;
const PILL_HEIGHT   = 66;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#B71C1C',
  },
  background: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.02,
    marginHorizontal: 19,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    marginTop: 15,
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  headerTitle: {
    marginTop: 15,
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Staatliches-Regular',
    fontSize: 24,
    lineHeight: 28,
    color: '#FFFFFF',
    letterSpacing: 2,
    marginRight: 36,
  },
  scroll: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: PILL_HEIGHT,
    backgroundColor: '#E15A4A',
    borderRadius: PILL_HEIGHT / 2,
  },
  sliderLabel: {
    position: 'absolute',
    top: 14,
    left: 24,
    fontFamily: 'Staatliches-Regular',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  sliderRow: {
    top: 30,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: PILL_HEIGHT,
    justifyContent: 'center',
  },
  track: {
    borderRadius: 25,
    top: 31,
    position: 'absolute',
    left: 16,
    right: 16,
    height: 4,
    backgroundColor: '#FFFFFF',
  },
  slider: {
    flex: 1,
    height: PILL_HEIGHT,
    marginHorizontal: 10,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  submitBtn: {
    height: 56,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 18,
    letterSpacing: 2,
    color: '#D54B47',
  },
});

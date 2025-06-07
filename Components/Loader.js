// Components/Loader.js
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Text,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// фон с абстрактными пятнами
const BG = require('../assets/loader_bg.png');
// смайлик-Partouch
const PARTOUCH = require('../assets/partouch_logo.png');

/**
 * Экран-прелоадер (без навигации).
 * Показывается ~10 с, пока App.js что-то грузит.
 */
export default function Loader() {
  /* ───── анимация «пульса» (10 с) ───── */
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      { iterations: 5 }               // 5×2 с = 10 с
    );

    pulse.start();
    return () => pulse.stop();
  }, [scale]);

  return (
    <ImageBackground source={BG} style={styles.container} resizeMode="cover">
      {/* смайлик-Partouch */}
      <Animated.Image
        source={PARTOUCH}
        style={[
          styles.logo,
          { transform: [{ scale }] },
        ]}
      />

      {/* крупный заголовок */}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>MIND&nbsp;PARTOUCH</Text>
        <Text style={styles.title}>JOURNAL</Text>
      </View>

      {/* системный спиннер */}
      <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
    </ImageBackground>
  );
}

/* ──────────── styles ──────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Partouch: ниже и правее */
  logo: {
    position: 'absolute',
    bottom: height * 0.29,   // ~чуть выше нижнего пятна
    right : width  * 0.05,   // смещаем вправо
    width : width  * 0.5,
    height: width  * 0.5,
    resizeMode: 'contain',
  },

  /* Заголовок по центру */
  titleWrap: {
    position: 'absolute',
    bottom: height * 0.10,
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Staatliches-Regular',
    fontSize  : width * 0.10,
    lineHeight: width * 0.13,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },

  /* Спиннер ещё ниже */
  spinner: {
    position: 'absolute',
    bottom: height * 0.04,
    alignSelf: 'center',
  },
});

// Components/MapSetup.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');
const BG = require('../assets/onb_bg.png');
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

const EMOTION_IMAGES = {
  CALM:      require('../assets/Calm.png'),
  ANXIOUS:   require('../assets/Anxious.png'),
  TIRED:     require('../assets/Tired.png'),
  INSPIRED:  require('../assets/Inspired.png'),
  IRRITATED: require('../assets/Irritated.png'),
  UNFOCUSED: require('../assets/Unfocused.png'),
  CURIOUS:   require('../assets/Curious.png'),
};

const BLOB_POSITIONS = [
  { leftPct:  0.001, topPct: 0.01 },
  { leftPct:  0.60,  topPct: 0.00 },
  { leftPct:  0.10,  topPct: 0.50 },
  { leftPct:  0.65,  topPct: 0.35 },
  { leftPct:  0.30,  topPct: 0.20 },
  { leftPct:  0.50,  topPct: 0.65 },
  { leftPct:  0.00,  topPct: 0.75 },
];

export default function MapSetup() {
  const navigation = useNavigation();

  // State для переключения между режимами: слайдеры или кляксы (blobs)
  const [showBlobs, setShowBlobs] = useState(false);

  // aggregated хранит сумму всех сохранённых значений ползунков по каждой эмоции
  const [aggregated, setAggregated] = useState(
    EMOTIONS.reduce((acc, emo) => {
      acc[emo] = 0;
      return acc;
    }, {})
  );

  // При монтировании компонента загружаем записи из AsyncStorage
  useEffect(() => {
    loadAllMoodEntries();
  }, []);

  const loadAllMoodEntries = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const moodKeys = allKeys.filter((k) => k.startsWith('mood_'));

      // Инициализируем сумму по каждой эмоции
      const sumByEmotion = EMOTIONS.reduce((acc, emo) => {
        acc[emo] = 0;
        return acc;
      }, {});

      // Получаем все записи из AsyncStorage
      const entries = await AsyncStorage.multiGet(moodKeys);
      entries.forEach(([_, value]) => {
        if (!value) return;
        try {
          const obj = JSON.parse(value);
          EMOTIONS.forEach((emo) => {
            const num = parseFloat(obj[emo]);
            if (!isNaN(num)) {
              sumByEmotion[emo] += num;
            }
          });
        } catch {
          // Игнорируем ошибки парсинга
        }
      });

      setAggregated(sumByEmotion);
    } catch (e) {
      console.warn('Failed to load mood entries:', e);
    }
  };

  // Чтобы отрисовать слайдеры и blobs пропорционально, найдём максимальную сумму (хотя бы 1)
  const maxSum = Math.max(...Object.values(aggregated), 1);

  // Рассчитывает размер blob (от 50 до 150) на основе нормализованной суммы
  const getBlobSize = (intensitySum) => {
    const normalized = intensitySum / maxSum; // от 0 до 1
    const minSize = 50;
    const maxSize = 150;
    return minSize + (maxSize - minSize) * normalized;
  };

  const containerWidth  = width * 0.9;
  const containerHeight = height * 0.6;

  // Обработчик кнопки «назад»
  const onPressBack = () => {
    if (showBlobs) {
      setShowBlobs(false);
    } else {
      navigation.goBack();
    }
  };

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Шапка (заголовок + кнопка назад) */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onPressBack} style={styles.backBtn}>
            <Image source={ARROW_LEFT} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.backBtn} />
        </View>

        {/* Если showBlobs === false — показываем слайдеры */}
        {!showBlobs && (
          <>
            <Text style={styles.title}>YOUR MENTAL MAP</Text>

            {EMOTIONS.map((emo) => (
              <View key={emo} style={styles.sliderContainer}>
                <View style={styles.sliderBackground} />
                <Text style={styles.sliderLabel}>{emo}</Text>
                <View style={styles.sliderRow}>
                  {/* Обертка с pointerEvents="none" делает слайдер нечувствительным к касаниям, но сохраняет активное отображение */}
                  <View pointerEvents="none" style={styles.sliderWrapper}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={maxSum}
                      value={aggregated[emo]}
                      minimumTrackTintColor="#FFFFFF"
                      maximumTrackTintColor="#FFFFFF"
                      thumbTintColor="#FFFFFF"
                    />
                  </View>
                </View>
              </View>
            ))}

            {/* Кнопка «SEE AS GLOBES» */}
            <TouchableOpacity
              style={styles.seeButton}
              onPress={() => setShowBlobs(true)}
            >
              <Text style={styles.seeButtonText}>SEE AS GLOBES</Text>
            </TouchableOpacity>

            {/* Подпись внизу */}
            <Text style={styles.summaryText}>
              YOU OFTEN FEEL{' '}
              {EMOTIONS.filter((e) => aggregated[e] > maxSum * 0.5).join(' AND ')}
            </Text>
          </>
        )}

        {/* Если showBlobs === true — показываем «BLOBS MENTAL MAP» */}
        {showBlobs && (
          <>
            <Text style={styles.title}>BLOBS MENTAL MAP</Text>

            <View style={styles.blobsContainer}>
              {EMOTIONS.map((emo, idx) => {
                const intensitySum = aggregated[emo] || 0;
                if (intensitySum <= 0) {
                  return null;
                }
                const size = getBlobSize(intensitySum);
                const imgSource = EMOTION_IMAGES[emo];
                if (!imgSource) return null;

                const pos = BLOB_POSITIONS[idx] || { leftPct: 0, topPct: 0 };
                const leftPx = pos.leftPct * containerWidth;
                const topPx  = pos.topPct  * containerHeight;

                return (
                  <View
                    key={emo}
                    style={[
                      styles.blobWrapper,
                      {
                        width: size,
                        height: size,
                        left: leftPx,
                        top: topPx,
                      },
                    ]}
                  >
                    <Image
                      source={imgSource}
                      style={styles.blobImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.blobLabel}>{emo}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.caption}>
              THE STRONGER THE FEELING, THE BIGGER THE BLOB{'\n'}
              YOU OFTEN FEEL{' '}
              {EMOTIONS.filter((e) => aggregated[e] > maxSum * 0.5).join(' AND ')}
            </Text>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const BORDER_RADIUS = 32;
const PILL_HEIGHT = 56;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: height * 0.05,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  title: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: -43,
    letterSpacing: 2,
  },

  /* Стили для слайдеров */
  sliderContainer: {
    marginBottom: 16,
    width: width * 0.9,
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
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  sliderRow: {
    top: 28,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: PILL_HEIGHT,
    justifyContent: 'center',
  },
  sliderWrapper: {
    flex: 1,
  },
  slider: {
    flex: 1,
    height: PILL_HEIGHT,
    marginHorizontal: 10,
  },

  /* Кнопка «SEE AS GLOBES» */
  seeButton: {
    marginTop: 24,
    width: width * 0.9,
    height: 56,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeButtonText: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 18,
    letterSpacing: 2,
    color: '#D54B47',
  },
  summaryText: {
    marginTop: 16,
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },

  /* Стили для BLOBS */
  blobsContainer: {
    width: width * 0.9,
    height: height * 0.6,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  blobWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  blobImage: {
    width: '100%',
    height: '100%',
  },
  blobLabel: {
    position: 'absolute',
    color: '#FFFFFF',
    fontFamily: 'Staatliches-Regular',
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 1,
  },
  caption: {
    marginTop: 16,
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 18,
  },
}); 
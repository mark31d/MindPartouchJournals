// Components/Onboarding.js
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

/* ────────── ассеты ────────── */
const BG        = require('../assets/onb_bg.png');   // общий фон
const BUBBLE_BG = require('../assets/says.png');     // PNG-баббл (без текста)

/* ────────── контент ────────── */
const SLIDES = [
  {
    key     : 's1',
    title   : 'WELCOME TO MIND\nPARTOUCH JOURNAL',
    subtitle: 'Track your inner world with ease\nand clarity',
    body    : [
      'This app helps you gently observe your daily mood, anxiety, focus, and energy — all through a soft and intuitive visual map of your mind.',
      'No pressure. No over-analysis. Just mindful check-ins.',
    ],
  },
  {
    key  : 's2',
    title: 'MEET PARTOUCH\n—  YOUR MENTAL\nNAVIGATOR',
    img  : require('../assets/partouch_wave.png'),
    body : [
      'Partouch is your digital companion — a quiet observer and subtle guide.',
      'Each day, Partouch sends a thoughtful card with a short reflection, gentle prompt, or quiet question to help you reconnect with yourself.',
      '“Did you notice how often your thoughts loop today?”\n“Try slowing down — just for a minute.”',
    ],
  },
  {
    key  : 's3',
    title: 'TRACK IN 3 CLICKS',
    img  : require('../assets/partouch_logo.png'),
    body : [
      'Easily log your mood, anxiety, focus, and energy in seconds.',
      'Add quick notes like: “didn’t sleep well,” “sunny day,” or “talked to mom.”',
      'Your states are visualized as colorful impressions on your personal mental map.',
    ],
  },
  {
    key  : 's4',
    title: 'A TIMELINE OF YOUR\nEMOTIONS',
    img  : require('../assets/partouch_logo.png'),
    body : [
      'See your emotional journey over days, weeks, or months.',
      'Colors and patterns show your overall mood flow.',
      'Spot peak moments and mark special days to revisit later.',
    ],
  },
  {
    key  : 's5',
    title: 'A QUIZ THAT FEELS LIKE\nA MIRROR',
    img  : require('../assets/partouch_logo.png'),
    body : [
      'Not sure how you feel?\nTake a short introspective quiz — just 5–6 soft questions.',
      'Get a symbolic image of your current state — a blurry dot, a sharp triangle, or a trembling light.',
      'Partouch will gently comment on your result and invite you to save it to your journal.',
    ],
  },
];

/* ────────── компонент ────────── */
export default function Onboarding() {
  const navigation = useNavigation();
  const listRef    = useRef(null);
  const [page, setPage] = useState(0);

  /* прогресс-бар */
  const scrollX       = useRef(new Animated.Value(0)).current;
  const progressWidth = scrollX.interpolate({
    inputRange : [0, (SLIDES.length - 1) * width],
    outputRange: [0, width - 32 * 2],
    extrapolate: 'clamp',
  });

  const next = () => {
    if (page < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: page + 1 });
    } else {
      navigation.replace('Main');
    }
  };

  /* ────────── рендер ────────── */
  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(i) => i.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => {
          /* Проверяем наличие изображения */
          const withImage = !!item.img;

          /* Флаги для каждого экрана */
          const isSecond = item.key === 's2';
          const isThird  = item.key === 's3';
          const isFourth = item.key === 's4';

          /* 
            Для второго экрана: 
            CHAR_SIZE   = 96px  
            CHAR_TOP2   = height * 0.30  
            CHAR_LEFT2  = 32px
          */
          const CHAR_SIZE   = 96;
          const CHAR_TOP2   = height * 0.30;
          const CHAR_LEFT2  = 32;

          /* 
            Для второго экрана позиция баббла:
            BUBBLE_TOP2  = CHAR_TOP2 - 20
            BUBBLE_LEFT2 = CHAR_LEFT2 + CHAR_SIZE + 16
          */
          const BUBBLE_TOP2  = CHAR_TOP2 - 20;
          const BUBBLE_LEFT2 = CHAR_LEFT2 + CHAR_SIZE + 16;

          return (
            <View style={styles.slide}>
              {/* ─── Заголовок ─── */}
              <Text style={styles.title}>{item.title}</Text>

              {/* ─── Подзаголовок (только для первого экрана) ─── */}
              {item.subtitle && (
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              )}

              {/* ─── Смайлик (на втором экране) или Логотип (на остальных с img) ─── */}
              {withImage && (
                <Image
                  source={item.img}
                  resizeMode="contain"
                  style={[
                    styles.charCommon,
                    isSecond
                      ? { left: CHAR_LEFT2, top: CHAR_TOP2 }
                      : { right: CHAR_LEFT2, bottom: height * 0.23 },
                  ]}
                />
              )}

              {/* ─── Баббл (PNG без текста) — только на втором экране ─── */}
              {isSecond && (
                <Image
                  source={BUBBLE_BG}
                  resizeMode="stretch"
                  style={[
                    styles.bubbleOnlyImage,
                    { left: BUBBLE_LEFT2, top: BUBBLE_TOP2 },
                  ]}
                />
              )}

              {/* ─── Основной текст ─── */}
              <View
                style={[
                  styles.bodyBox,
                  /* Для каждого экрана свой отступ сверху */
                  isSecond  && styles.bodyBoxOffsetSecond,
                  isThird   && styles.bodyBoxOffsetThird,
                  isFourth  && styles.bodyBoxOffsetFourth,
                  !isSecond && !isThird && !isFourth && styles.bodyBoxOffsetDefault,
                ]}
              >
                {item.body.map((t, i) => (
                  <Text key={i} style={styles.body}>
                    {t}
                  </Text>
                ))}
              </View>
            </View>
          );
        }}
      />

      {/* ─── Прогресс-бар ─── */}
      <View style={styles.progressWrap}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* ─── Кнопка Next / Start ─── */}
      <TouchableOpacity style={styles.btn} onPress={next} activeOpacity={0.8}>
        <Text style={styles.btnTxt}>
          {page === SLIDES.length - 1 ? 'START NOW' : 'NEXT'}
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

/* ────────── СТИЛИ ────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  /* контейнер слайда */
  slide: {
    width,
    paddingHorizontal: 32,
    paddingTop: height * 0.08,
    alignItems: 'center',  // всё по центру по горизонтали
  },

  /* Заголовок */
  title: {
    fontFamily : 'Staatliches-Regular',
    fontSize   : 32,
    lineHeight : 38,
    color      : '#FFFFFF',
    textAlign  : 'center',
    maxWidth   : width * 0.86,
  },
  /* Подзаголовок (только для первого экрана) */
  subtitle: {
    fontFamily : 'Staatliches-Regular',
    fontSize   : 30,
    lineHeight : 30,
    color      : '#FFFFFF',
    marginTop  : 30,
    textAlign  : 'center',
    maxWidth   : width * 0.86,
  },

  /* Основной текст */
  bodyBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  body: {
    fontFamily : 'Montserrat-Regular',
    fontSize   : 15,
    lineHeight : 22,
    color      : '#FFFFFF',
    marginBottom: 12,
    textAlign  : 'center',
    maxWidth   : width * 0.86,
  },

  /* Отступы для блока с текстом на разных экранах */
  // Первый экран (s1) — текст сразу под заголовком:
  bodyBoxOffsetDefault: {
    marginTop: 29,
  },
  // Второй экран (s2) — текст должен идти значительно ниже, под смайликом и бабблом:
  bodyBoxOffsetSecond: {
    marginTop: -130 + height * 0.40,  // увеличили сдвиг до 0.40 от высоты окна
  },
  // Третий экран (s3) — текст под логотипом «Track in 3 clicks» и под самим логотипом:
  bodyBoxOffsetThird: {
    marginTop: -170 + height * 0.45,  // сдвигаем вниз, чтобы не «наезжал» на логотип справа
  },
  // Четвёртый экран (s4) — аналогично третьему, текст чуть ниже:
  bodyBoxOffsetFourth: {
    marginTop: -190 + height * 0.45,
  },

  /* Смайлик или Логотип */
  charCommon: {
    position: 'absolute',
    width   : 96,
    height  : 96,
  },

  /* Баббл-картинка (без текста) */
  bubbleOnlyImage: {
    position: 'absolute',
    width   : 210,
    height  : 78,
  },

  /* Прогресс-бар */
  progressWrap: {
    position: 'absolute',
    bottom: 108,
    left : 32,
    right: 32,
    height: 2,
    backgroundColor: '#FFFFFF33',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },

  /* Кнопка */
  btn: {
    position: 'absolute',
    left : 32,
    right: 32,
    bottom: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnTxt: {
    fontFamily   : 'Staatliches-Regular',
    fontSize     : 18,
    letterSpacing: 2,
    color        : '#D54B47',
  },
});

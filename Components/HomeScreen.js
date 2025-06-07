// HomeScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView, // ← добавили
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

/* ───────────── ассеты ───────────── */
const BG       = require('../assets/home_bg.png');        // красный «блоб» на заднем фоне
const PARTOUCH = require('../assets/partouch_logo.png');  // белый смайлик
const ARROW_R  = require('../assets/arrow_r.png');        // стрелка «>»

/* ───────────── меню пунктов ───────────── */
const MENU = [
  { label: 'SHARE HOW ARE YOU TODAY', route: 'ShareMood' },
  { label: 'NOTES',                   route: 'Notes'      },
  { label: 'YOUR MENTAL MAP',         route: 'MapSetup'   },
  { label: 'JOURNAL',                 route: 'Journal'    },
  // При необходимости можно добавить ещё элементов, и всё автоматически станет прокручиваться
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const open = (route) => navigation.navigate(route);

  return (
    <ImageBackground source={BG} style={styles.background} resizeMode="cover">
      {/* 
        Заворачиваем весь контент в ScrollView, чтобы при нехватке высоты на экране
        можно было прокручивать всю страницу.
      */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Заголовок */}
        <Text style={styles.header}>MENTAL  STATE  LOGS</Text>

        {/* Декоративная «ляпка» + Partouch */}
        <View style={styles.figureWrap}>
          <Image source={require('../assets/home_blob.png')} style={styles.blob} />
          <Image source={PARTOUCH} style={styles.partouch} />
        </View>

        {/* Список пунктов меню */}
        <View style={styles.menu}>
          {MENU.map((m) => (
            <TouchableOpacity
              key={m.route}
              style={styles.item}
              activeOpacity={0.75}
              onPress={() => open(m.route)}
            >
              <Text style={styles.itemTxt}>{m.label}</Text>
              <Image source={ARROW_R} style={styles.arrow} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

/* ───────────── стили ───────────── */
const CARD_BORDER = 'rgba(255,255,255,0.35)';

const styles = StyleSheet.create({
  /* Обёртка с фоном: растягиваем на весь экран */
  background: {
    flex: 1,
  },

  /* ScrollView-контейнер: задаём padding по краям */
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 80,           // дополнительный отступ снизу, чтобы последний элемент не "заходил" под нижнюю панель
  },

  /* ЗАГОЛОВОК */
  header: {
    marginTop: height * 0.07,
    fontFamily: 'Staatliches-Regular',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },

  /* ОБЛАСТЬ С БЛОБОМ И СМАЙЛИКОМ */
  figureWrap: {
    width: width - 48,
    height: height * 0.28,
    marginTop: 6,
    marginBottom: 12,
  },
  blob: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  partouch: {
    position: 'absolute',
    right: 16,
    bottom: 6,
    width: 86,
    height: 86,
    resizeMode: 'contain',
  },

  /* Список элементов меню */
  menu: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  item: {
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTxt: {
    flex: 1,
    fontFamily: 'Staatliches-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  arrow: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
});

// CustomTabBar.js
import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// ──────────────────── цвета ────────────────────
const ACTIVE_CLR   = '#FFFFFF';
const INACTIVE_CLR = 'rgba(255,255,255,0.45)';

// ──────────────────── иконки навигации ──────────────────────
// Положите соответствующие PNG-файлы в ./assets
const ICONS = {
  Home     : require('../assets/home.png'),
  Feed     : require('../assets/feed.png'),
  Map      : require('../assets/map.png'),
  Game     : require('../assets/game.png'),
  Settings : require('../assets/settings.png'),
};

export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets   = useSafeAreaInsets();
  // Ширина «таблетки» — чуть меньше ширины экрана, чтобы были боковые отступы
  const barWidth = width - 16;

  return (
    // Этот контейнер рисует «таблетку» поверх экрана, позиционируя её
    <View
      style={[
        styles.wrapper,
        {
          bottom: insets.bottom > 0 ? insets.bottom : 12,
          width: barWidth,
          left: (width - barWidth) / 2, // центрирование по горизонтали
        },
      ]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, idx) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === idx;
          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.btn}
              activeOpacity={0.7}
            >
              <Image
                source={ICONS[label]}
                style={[
                  styles.icon,
                  { tintColor: isFocused ? ACTIVE_CLR : INACTIVE_CLR },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Абсолютное позиционирование «таблетки» поверх контента
  wrapper: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  // Собственно «таблетка» с одной верхней белой кромкой
  bar: {
    marginBottom:-10,
    flexDirection: 'row',
    justifyContent: 'space-between',

    // Прозрачный фон, чтобы просвечивался экран интерфейса под баром
    backgroundColor: 'transparent',

    // Округлые углы вверху — чтобы вытянуть «пилюльку»
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,

    // Задаём только верхнюю границу (1px белая). Боковые и нижние остаются прозрачными.
    borderTopWidth: 2,
    borderTopColor: '#FFFFFF',
    borderLeftColor:'#FFFFFF',
    borderRightColor:'#FFFFFF',
    borderLeftWidth: 0.3,
    borderRightWidth:  0.3,
    borderBottomWidth: 0,

    // Внутренние отступы, чтобы иконки располагались на своём месте
    paddingHorizontal: 30,
    paddingTop       : Platform.OS === 'ios' ? 14 : 10,
    paddingBottom    : 1,
  },
  btn: {
    height: 44,
    width: 44,
    alignItems   : 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  icon: {
    width     : 24,
    height    : 24,
    resizeMode: 'contain',
  },
});

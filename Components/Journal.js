// Components/EmotionalJournalScreen.js

import React from 'react';
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
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const BG = require('../assets/onb_bg.png');
const ARROW_LEFT = require('../assets/arrow_l.png');
// Иконка-аватар для комментариев (возьмите свой файл)
const SMILE_ICON = require('../assets/smile_icon.png');

export default function EmotionalJournalScreen() {
  const navigation = useNavigation();

  const onPressBack = () => {
    navigation.goBack();
  };

  // В примере мы просто жёстко вписали текст. 
  // При необходимости можно заменить на props или state.
  const summaryText = 'YOU OFTEN FEEL TIRED AND CURIOUS';

  const firstComment = {
    label: 'Partouch Comment:',
    text:
      '“You’re Tired, But Something Inside Is Still Reaching Forward — Quietly Curious, Like A Light Flickering In A Calm Room. Maybe Today Isn’t For Doing, But For Gently Noticing. Let Your Questions Stretch Out And Rest Beside You. Answers Can Wait.”',
  };

  const quizResult = {
    title: 'FLICKERING LIGHT',
    description:
      'A Trembling Glow That Dims And Brightens Unpredictably. It Reflects Sensitivity, Emotional Movement, And Subtle Shifts—Like A Signal Trying To Stabilize.',
    commentLabel: 'Partouch’s Comment:',
    commentText:
      '“You’re Glowing In Waves—Sensitive, Changeable, Alive. Try Not To Hold The Light Steady. Let It Dance. There’s Beauty In The Flicker Too.”',
  };

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Шапка (стрелка-назад + заголовок) */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onPressBack} style={styles.backBtn}>
            <Image source={ARROW_LEFT} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>JOURNAL</Text>
          {/* Пустой View, чтобы заголовок был по центру */}
          <View style={styles.backBtn} />
        </View>

        {/* Суммарный текст */}
        <Text style={styles.summaryText}>{summaryText}</Text>

        {/* Первый комментарий */}
        <View style={styles.commentBlock}>
          <Image source={SMILE_ICON} style={styles.commentIcon} />
          <View style={styles.commentTextContainer}>
            <Text style={styles.commentLabel}>{firstComment.label}</Text>
            <Text style={styles.commentText}>{firstComment.text}</Text>
          </View>
        </View>

        {/* Заголовок блока результатов квиза */}
        <Text style={styles.quizHeader}>THE RESULTS OF THE QUIZ:</Text>

        {/* Название результата */}
        <Text style={styles.quizTitle}>{quizResult.title}</Text>
        <Text style={styles.quizDescription}>{quizResult.description}</Text>

        {/* Второй комментарий */}
        <View style={[styles.commentBlock, { marginTop: 24 }]}>
          <Image source={SMILE_ICON} style={styles.commentIcon2} />
          <View style={styles.commentTextContainer}>
            <Text style={styles.commentLabel}>{quizResult.commentLabel}</Text>
            <Text style={styles.commentText}>{quizResult.commentText}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const PADDING_HORIZONTAL = 16;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: height * 0.05,
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Staatliches-Regular',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  summaryText: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },

  commentBlock: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  commentIcon: {
    width: 70,
    height: 70,
    marginRight: 12,

    resizeMode: 'contain',
    marginTop: 40,
  },
  commentIcon2: {
    width: 70,
    height: 70,
    marginRight: 12,

    resizeMode: 'contain',
    marginTop: 10,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentLabel: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 1.5,
  },
  commentText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },

  quizHeader: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  quizTitle: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 20,
    color: '#FFD15C', // золотистый цвет для заголовка результата
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  quizDescription: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
});

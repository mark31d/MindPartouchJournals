// Components/FeedScreen.js
// -----------------------------------------------------------------
// Partouch “Cards” feed.
// • Нет кнопки «назад»
// • После прохождения всех карточек появляется оверлей-таймер
//   до ближайшей полуночи (следующей возможности пройти заново).
// -----------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageBackground from 'react-native/Libraries/Image/ImageBackground';

const { width, height } = Dimensions.get('window');
const ACCENT = '#F17460';

// ─── assets ───────────────────────────────────────────────────────
const BG         = require('../assets/home_bg.png');
const ICON_SAD   = require('../assets/smile_frown.png');
const ICON_HAPPY = require('../assets/smile_icon.png');

const CARDS = [
    {
      id: 'c1',
      blob: require('../assets/blob_1.png'),
      question:
        'You often get anxious and unfocused. Have you noticed any tension?',
      options: [
        { label: 'YES',            value: 'positive' },
        { label: "I DON'T AGREE",  value: 'negative' },
      ],
      followUp: {
        positive:
          'Try to stay positive in every situation. Recall the things that make you happy.',
        negative:
          'Great. Happy to hear that you are okay. Have a wonderful day!',
      },
    },
    {
      id: 'c2',
      blob: require('../assets/blob_2.png'),
      question: 'Are you often bothered by the same things?',
      options: [
        { label: 'YES', value: 'positive' },
        { label: 'NO',  value: 'negative' },
      ],
      followUp: {
        positive:
          'Try to change your attitude toward the situation. It will not matter in a year, so there is no need to worry about it.',
        negative:
          'Perfect, because these things will not matter in a year! Stay positive in every situation.',
      },
    },
    {
      id: 'c3',
      blob: require('../assets/blob_3.png'),
      question: 'Today is Thanksgiving Day. Say thank you to your loved ones.',
      options: [
        { label: 'GREAT',         value: 'positive' },
        { label: 'I HAVE DONE IT', value: 'negative' },
      ],
      followUp: {
        positive:
          'Perfect! Now think about the five to ten things you are grateful for in your life.',
        negative:
          'Perfect! I hope you had an amazing day filled with happiness, joy, and unforgettable moments.',
      },
    },
    {
      id: 'c4',
      blob: require('../assets/blob_4.png'),
      question: 'How are you feeling right now?',
      options: [
        { label: "I'M FINE", value: 'positive' },
        { label: 'UPSET',    value: 'negative' },
      ],
      followUp: {
        positive:
          'Good to hear! Today is a wonderful day to enjoy the things you love the most.',
        negative:
          'Oh, I can relate. Try to meditate and focus on the things that make you happy. Listen to your favourite music, cook some dinner.',
      },
    },
    {
      id: 'c5',
      blob: require('../assets/blob_4.png'),
      question: 'How is your mental state right now?',
      options: [
        { label: 'CALM',    value: 'positive' },
        { label: 'ANXIOUS', value: 'negative' },
      ],
      followUp: {
        positive:
          'That is great! When you do not overthink, you are calm, have more energy and joy.',
        negative:
          'I noticed your anxiety. Do not rush to let it go; try to focus on the things that surround you. What do you see?',
      },
    },
  ];
  
// ─── helpers ─────────────────────────────────────────────────────
const getTodayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `card_answers_${yyyy}-${mm}-${dd}`;
};
const msUntilMidnight = () => {
  const now   = new Date();
  const next  = new Date(now);
  next.setHours(24, 0, 0, 0);   // ближайшая полночь
  return next - now;
};

// ─── component ───────────────────────────────────────────────────
export default function FeedScreen() {
  const [index,     setIndex]     = useState(0);
  const [answers,   setAnswers]   = useState({});
  const [locked,    setLocked]    = useState(false); // true → показываем таймер
  const [remainMs,  setRemainMs]  = useState(msUntilMidnight());

  // загрузка ответов за сегодня
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(getTodayKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        setAnswers(parsed);
        if (CARDS.every(c => parsed[c.id])) {
          setLocked(true);
        }
      }
    })();
  }, []);

  // таймер: обновляем каждые секунду, пока экран «заблокирован»
  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => {
      const left = msUntilMidnight();
      setRemainMs(left);
      if (left <= 0) {
        // новый день – сбрасываем всё
        setLocked(false);
        setAnswers({});
        setIndex(0);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [locked]);

  // если карточки закончились → переключаемся в locked-режим
  const finishToday = () => {
    setLocked(true);
    setRemainMs(msUntilMidnight());
  };

  const card       = CARDS[index];
  const userChoice = answers[card?.id];
  const faceIcon   = userChoice === 'positive' ? ICON_HAPPY : ICON_SAD;

  const saveAnswer = async value => {
    const upd = { ...answers, [card.id]: value };
    setAnswers(upd);
    await AsyncStorage.setItem(getTodayKey(), JSON.stringify(upd));
  };

  const handleNext = () => {
    if (!userChoice) {
      alert('Please choose an answer first.');
      return;
    }
    if (index + 1 < CARDS.length) {
      setIndex(index + 1);
    } else {
      finishToday();
    }
  };

  if (!card) return null;

  // ─── UI ───────────────────────────────────────────────────────
  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      {/* Заголовок без стрелки */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PARTOUCH CARDS</Text>
      </View>

      {/* Blob + face */}
      <View style={styles.blobContainer}>
        <Image source={card.blob} style={styles.blobImage} resizeMode="contain" />
        <Image source={faceIcon} style={styles.face} resizeMode="contain" />
      </View>

      {/* Текст */}
      <Text style={styles.mainText}>
        {userChoice ? card.followUp[userChoice] : card.question}
      </Text>

      {/* Кнопки ответа */}
      {!userChoice && !locked && (
        <View style={styles.optionsRow}>
          {card.options.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={styles.optionBtn}
              onPress={() => saveAnswer(opt.value)}
            >
              <Text style={styles.optionText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* NEXT */}
      {!locked && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>NEXT</Text>
        </TouchableOpacity>
      )}

      {/* ── ТАЙМЕР-ОВЕРЛЕЙ ─────────────────────────────────── */}
      {locked && (
        <View style={styles.overlay}>
          <View style={styles.timerBox}>
            <Text style={styles.timerHeader}>Come back in</Text>
            <Text style={styles.timerValue}>
              {new Date(remainMs).toISOString().substr(11, 8)}
            </Text>
          </View>
        </View>
      )}

      <View style={{ height: 80 }} />
    </ImageBackground>
  );
}

// ─── styles ────────────────────────────────────────────────────
const BORDER = 28;
const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 26,
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  blobContainer: {
    alignSelf: 'center',
    width: width * 0.75,
    height: height * 0.28,
    marginVertical: 16,
  },
  blobImage: { ...StyleSheet.absoluteFillObject },
  face: { position: 'absolute', width: 70, height: 70, right: -12, bottom: -12 },

  mainText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    paddingHorizontal: 24,
    lineHeight: 22,
    marginBottom: 24,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  optionBtn: {
    flex: 1,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: BORDER,
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionText: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 16,
    color: ACCENT,
    letterSpacing: 1,
  },

  nextBtn: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 18,
    letterSpacing: 2,
    color: '#D54B47',
  },

  /* overlay */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerBox: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER,
    alignItems: 'center',
  },
  timerHeader: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 18,
    color: '#D54B47',
    marginBottom: 8,
  },
  timerValue: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 28,
    color: '#000000',
    letterSpacing: 2,
  },
  blobImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});

// ─── карточки ────────────────────────────────────────────────

// ─── styles ───────────────────────────────────────────────────

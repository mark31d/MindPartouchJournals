// Components/GameScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ImageBackground,
  Modal,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// фон и иконки
const HOME_BG = require('../assets/home_bg.png');
const FEELING = require('../assets/feeling.png');
const FACE    = require('../assets/smile_icon.png');
const CLOSE   = require('../assets/close_small.png');

const QUESTIONS = [
  { q: 'HOW DOES YOUR BODY FEEL AT THIS MOMENT?', choices: ['HEAVY AND TENSE','JUMPY AND RESTLESS','CALM AND GROUNDED','NUMB OR UNCLEAR'], correct: 2 },
  { q: 'WHAT ARE YOUR THOUGHTS DOING RIGHT NOW?',  choices: ['RUNNING IN CIRCLES','FLOWING GENTLY','SCATTERED EVERYWHERE','COMPLETELY BLANK'], correct: 1 },
  { q: 'WHERE IS YOUR ATTENTION?',                 choices: ['STUCK IN THE PAST','WORRYING ABOUT THE FUTURE','MOSTLY IN THE PRESENT','BOUNCING AROUND RANDOMLY'], correct: 2 },
  { q: 'HOW WOULD YOU DESCRIBE YOUR BREATHING?',    choices: ['SHALLOW AND QUICK','STEADY AND NATURAL','TIGHT OR HELD','I DON’T NOTICE IT'], correct: 1 },
  { q: 'WHAT DOES YOUR INNER VOICE SOUND LIKE TODAY?', choices: ['CRITICAL AND LOUD','SILENT AND ABSENT','KIND AND OBSERVANT','CONFUSED OR PANICKY'], correct: 3 },
  { q: 'WHAT IS YOUR CURRENT PACE?',                choices: ['RUSHING WITHOUT A PAUSE','MOVING SLOWLY AND STEADILY','FROZEN AND STUCK','ALL OVER THE PLACE'], correct: 1 },
  { q: 'HOW CONNECTED DO YOU FEEL TO YOUR SURROUNDINGS?', choices: ['LIKE I’M IN A BUBBLE','NOT AT ALL','AWARE AND GENTLY CONNECTED','DISTRACTED AND ZONED OUT'], correct: 2 },
  { q: 'WHAT SHAPE FEELS CLOSEST TO YOUR CURRENT STATE?', choices: ['A SOFT, FLOATING CLOUD','A SHARP SPINNING TRIANGLE','A BLINKING SQUARE','A HARD, SOLID ROCK'], correct: 0 },
  { q: 'HOW WOULD YOU DESCRIBE THE TENSION IN YOUR BODY?', choices: ['EVERYWHERE, TIGHTLY HELD','RANDOM AND SHIFTING','MINIMAL OR SOFT','I CAN’T TELL'], correct: 2 },
  { q: 'WHAT KIND OF LIGHT WOULD DESCRIBE YOU RIGHT NOW?', choices: ['FLASHING NEON','DIM AND FLICKERING','WARM, STEADY GLOW','COLD SPOTLIGHT'], correct: 2 },
];

const RESULT_PRESETS = [
  {
    name: 'BLURRY DOT', range: [0,3],
    comment: 'A soft, unfocused dot slowly expands and contracts, floating gently in space. It carries a feeling of vagueness, inner fog, or emotional diffusion.',
    partouch: 'Seems like things are a little hazy today. That’s okay. You don’t have to force clarity—just notice the blur and breathe into it. Maybe it’s asking for rest.',
    action: 'Save this state in your journal as a gentle reminder of your emotional weather.',
  },
  {
    name: 'SHARP TRIANGLE', range: [4,7],
    comment: 'A vivid, pointed triangle pulses with energy and intensity. It represents focus, tension, or inner urgency—sometimes productive, sometimes overwhelming.',
    partouch: 'You’re feeling sharp—alert, maybe even on edge. Notice where that energy is pointed. Can it soften at the edges? You don’t have to aim all the time.',
    action: 'Save this moment to reflect on what drives your intensity today.',
  },
  {
    name: 'FLICKERING LIGHT', range: [8,10],
    comment: 'A trembling glow that dims and brightens unpredictably. It reflects sensitivity, emotional movement, and subtle shifts—like a signal trying to stabilize.',
    partouch: 'You’re glowing in waves—sensitive, changeable, alive. Try not to hold the light steady. Let it dance. There’s beauty in the flicker too.',
    action: 'Keep this state in your journal—it might mean more than it seems right now.',
  },
];

const getPreset = score =>
  RESULT_PRESETS.find(p => score >= p.range[0] && score <= p.range[1]);

const STORAGE_BEST = 'quiz_best_score';

export default function GameScreen() {
  const navigation = useNavigation();

  // Скрываем статус-бар, чтобы модалка была fullscreen
  StatusBar.setHidden(true);

  const [stage,    setStage]    = useState('intro');      // 'intro' | 'quiz' | 'result'
  const [idx,      setIdx]      = useState(0);
  const [score,    setScore]    = useState(0);
  const [best,     setBest]     = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_BEST).then(v => {
      if (v !== null) setBest(Number(v));
    });
  }, []);

  const restart = () => {
    setStage('quiz');
    setIdx(0);
    setScore(0);
    setSelected(null);
  };

  const onNext = () => {
    if (selected === null) return;
    if (selected === QUESTIONS[idx].correct) {
      setScore(s => s + 1);
    }
    const nxt = idx + 1;
    if (nxt >= QUESTIONS.length) {
      const final = score + (selected === QUESTIONS[idx].correct ? 1 : 0);
      setBest(prev => {
        const b = prev === null ? final : Math.max(prev, final);
        AsyncStorage.setItem(STORAGE_BEST, String(b));
        return b;
      });
      setStage('result');
    } else {
      setIdx(nxt);
      setSelected(null);
    }
  };

  // ───── INTRO ─────
  if (stage === 'intro') {
    return (
      <ImageBackground source={HOME_BG} style={styles.root} resizeMode="cover">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Image source={CLOSE} style={styles.closeIcon}/>
        </TouchableOpacity>
        <Text style={styles.title}>QUIZ</Text>
        {best !== null && <Text style={styles.bestTxt}>YOUR BEST SCORE IS {best}</Text>}
        <View style={styles.feelingWrap}>
          <Image source={FEELING} style={styles.feelingImg}/>
          <Text style={styles.feelingTxt}>HOW HAVE YOU BEEN FEELING?</Text>
        </View>
        <Image source={FACE} style={styles.bigFace}/>
        <TouchableOpacity style={styles.bigBtn} onPress={restart}>
          <Text style={styles.bigBtnTxt}>START</Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }

  // ───── QUIZ MODAL ─────
  if (stage === 'quiz') {
    const q = QUESTIONS[idx];
    return (
      <Modal visible animationType="slide" transparent>
        <ImageBackground source={HOME_BG} style={styles.modalOverlay} resizeMode="cover">
          <ScrollView
            contentContainerStyle={styles.modalBox}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.modalClose} onPress={() => setStage('intro')}>
              <Image source={CLOSE} style={styles.closeIcon}/>
            </TouchableOpacity>
            <Text style={styles.counter}>{idx + 1}/{QUESTIONS.length}</Text>
            <Text style={styles.question}>{q.q}</Text>
            {q.choices.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.choiceBtn,
                  selected === i && styles.choiceBtnSelected
                ]}
                onPress={() => setSelected(i)}
              >
                <Text style={[
                  styles.choiceTxt,
                  selected === i && styles.choiceTxtSelected
                ]}>
                  {i + 1}. {c}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.nextBtn, selected === null && styles.nextBtnDisabled]}
              onPress={onNext}
              disabled={selected === null}
            >
              <Text style={styles.nextTxt}>NEXT</Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
      </Modal>
    );
  }

  // ───── RESULT MODAL ─────
  const preset = getPreset(score);
  return (
    <Modal visible animationType="slide" transparent>
      <ImageBackground source={HOME_BG} style={styles.modalOverlay} resizeMode="cover">
        <ScrollView
          contentContainerStyle={styles.modalBox}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.modalClose} onPress={restart}>
            <Image source={CLOSE} style={styles.closeIcon}/>
          </TouchableOpacity>
          <Text style={styles.resultTitle}>YOUR RESULT</Text>
          <Text style={styles.score}>{score}/{QUESTIONS.length}</Text>
          <Text style={styles.shapeName}>{preset.name}</Text>
          <Text style={styles.comment}>{preset.comment}</Text>
          <View style={styles.partouchRow}>
            <Image source={FACE} style={styles.faceSmall}/>
            <View style={{ flex: 1 }}>
              <Text style={styles.partLabel}>Partouch’s Comment:</Text>
              <Text style={styles.partText}>{preset.partouch}</Text>
            </View>
          </View>
          <Text style={styles.partLabel}>Action:</Text>
          <Text style={styles.comment}>→ {preset.action}</Text>
          <TouchableOpacity style={styles.tryBtn} onPress={restart}>
            <Text style={styles.tryTxt}>TRY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert('Saved','Entry added')}>
            <Text style={styles.saveTxt}>SAVE TO JOURNAL</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </Modal>
  );
}

const BORDER = 26;
const PILL   = 56;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },

  // BACK BUTTON
  backBtn:   { position: 'absolute', top: 40, left: 16, width: 28, height: 28, zIndex: 10 },
  closeIcon: { width: 20, height: 20, tintColor: '#FFF', resizeMode: 'contain' },

  // INTRO
  title:       { marginTop: 80, fontSize: 40, color: '#FFF', letterSpacing: 2, fontFamily: 'Staatliches-Regular' },
  bestTxt:     { marginTop: 8, fontSize: 14, color: '#F6A893', letterSpacing: 1.5, fontFamily: 'Staatliches-Regular' },
  feelingWrap: { marginTop: 30, width: width * 0.8, height: 140, justifyContent: 'center', alignItems: 'center' },
  feelingImg:  { width: '100%', height: '100%', resizeMode: 'contain' },
  feelingTxt:  { position: 'absolute', fontSize: 16, color: '#FFF', textAlign: 'center', paddingHorizontal: 10, fontFamily: 'Staatliches-Regular' },
  bigFace:     { marginTop: 30, width: 120, height: 120, resizeMode: 'contain' },
  bigBtn:      { marginTop: 30, width: width * 0.85, height: PILL, borderRadius: BORDER, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  bigBtnTxt:   { fontSize: 20, letterSpacing: 3, color: '#D54B47', fontFamily: 'Staatliches-Regular' },

  // MODAL OVERLAY
  modalOverlay: { left :-10, flex: 1, width: '102%', height: '100%', justifyContent: 'center', alignItems: 'center' },

  // COMMON MODAL BOX
  modalBox: {
    width: width * 0.9,
    maxHeight: height * 0.9,
    backgroundColor: 'transparent',
    padding: 20,
  },

  // QUIZ MODAL
  counter:    { fontSize: 34, color: '#FFF', letterSpacing: 2, textAlign: 'center', fontFamily: 'Staatliches-Regular', marginBottom: 12 },
  question:   { fontSize: 18, color: '#FFF', letterSpacing: 1, textAlign: 'center', fontFamily: 'Staatliches-Regular' },
  choiceBtn:         { height: PILL, backgroundColor: '#F97E71', borderRadius: PILL / 2, justifyContent: 'center', paddingHorizontal: 18, marginTop: 16 },
  choiceBtnSelected: { backgroundColor: '#D54B47' },
  choiceTxt:         { fontSize: 15, color: '#FFF', letterSpacing: 1, fontFamily: 'Staatliches-Regular' },
  choiceTxtSelected: { fontWeight: 'bold' },
  nextBtn:           { backgroundColor: '#FFF', height: PILL, borderRadius: BORDER, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  nextBtnDisabled:   { opacity: 0.5 },
  nextTxt:           { fontSize: 20, letterSpacing: 3, color: '#D54B47', fontFamily: 'Staatliches-Regular' },

  // RESULT MODAL
  resultTitle: { fontSize: 24, color: '#FFF', letterSpacing: 2, textAlign: 'center', fontFamily: 'Staatliches-Regular', marginBottom: 8 },
  score:       { fontSize: 64, color: '#FFF', letterSpacing: 2, textAlign: 'center', fontFamily: 'Staatliches-Regular' },
  shapeName:   { fontSize: 22, color: '#C98700', letterSpacing: 3, textAlign: 'center', fontFamily: 'Staatliches-Regular', marginBottom: 16 },
  comment:     { fontSize: 13, color: '#FFF', lineHeight: 18, fontFamily: 'Montserrat-Regular', marginBottom: 12 },
  partouchRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  faceSmall:   { width: 34, height: 34, resizeMode: 'contain', marginRight: 8 },
  partLabel:   { fontSize: 14, color: '#FFF', letterSpacing: 1.2, fontFamily: 'Staatliches-Regular', marginBottom: 4 },
  partText:    { fontSize: 13, color: '#FFF', lineHeight: 18, fontFamily: 'Montserrat-Regular' },
  tryBtn:      { left:-10, width: width * 0.85, height: PILL, borderRadius: BORDER, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  tryTxt:      { fontSize: 20, letterSpacing: 3, color: '#D54B47', fontFamily: 'Staatliches-Regular' },
  saveBtn:     {left:-10, width: width * 0.85, height: PILL, borderWidth: 1.5, borderColor: '#FFF', borderRadius: BORDER, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  saveTxt:     { fontSize: 18, color: '#FFF', letterSpacing: 2, fontFamily: 'Staatliches-Regular' },
});

// Components/MapScreen.js
//--------------------------------------------------------------
// Mental States Feed
//   ① интро-экран с «пятнами» эмоций + кнопка SEE HOW YOU FEEL
//   ② после нажатия — экран-график (DAY / WEEK / YEAR) + back
//--------------------------------------------------------------
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageBackground from 'react-native/Libraries/Image/ImageBackground';
import Svg, {
  G,
  Image as SvgImage,
  Text as SvgText,
  Line,
} from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

import dayjsBase from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjsBase.extend(weekOfYear);
const dayjs = dayjsBase;

/* ─── ресурсы ─── */
const { width, height } = Dimensions.get('window');
const BG_INTRO   = require('../assets/onb_bg.png');
const BG_CHART   = BG_INTRO;          // такой же фон
const ARROW_LEFT = require('../assets/arrow_l.png');

/* ─── эмоции ─── */
const EMOTIONS = [
  'IRRITATED', 'CALM', 'CURIOUS', 'ANXIOUS',
  'UNFOCUSED', 'TIRED', 'INSPIRED',
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

/* ─── «лица» ─── */
const FACES = [
  require('../assets/face_angry.png'),
  require('../assets/smile_frown.png'),
  require('../assets/smile_icon.png'),
];

/* ─── график: оси ─── */
const AXIS_CLR   = '#F6A893';
const LEFT_PAD   = 40;
const TOP_PAD    = 40;
const BOTTOM_PAD = 40;
const RIGHT_PAD  = 18;

/* ─── ключи хранилища ─── */
const keyForDay    = d => `mood_${dayjs(d).format('YYYY-MM-DD')}`;
const importantKey = d => `important_${dayjs(d).format('YYYY-MM-DD')}`;

/* ───────────────────────────────────────────────────────────── */
export default function MapScreen() {
  const navigation = useNavigation();          // ← корректно инициализируем здесь

  /* state */
  const [showGraph, setShowGraph] = useState(false); // false → интро, true → график
  const [mode,   setMode]   = useState('DAY');       // DAY / WEEK / YEAR
  const [cursor, setCursor] = useState(dayjs());
  const [data,   setData]   = useState([]);
  const [marked, setMarked] = useState(false);

  /* ── загрузка одного дня ── */
  const loadDay = async d => {
    const raw = await AsyncStorage.getItem(keyForDay(d));
    if (!raw) return [];
    const obj = JSON.parse(raw);
    return EMOTIONS.map(e => ({
      emotion: e,
      time: Math.floor(Math.random() * 24),
      strength: Number(obj[e] || 0),
    })).filter(p => p.strength > 0);
  };

  /* ── пересчёт при изменениях ── */
  const recompute = useCallback(async () => {
    if (!showGraph) return;

    if (mode === 'DAY') {
      setData(await loadDay(cursor));
      setMarked(Boolean(await AsyncStorage.getItem(importantKey(cursor))));
    } else if (mode === 'WEEK') {
      const monday = cursor.startOf('week');
      const weekArr = [];
      for (let i = 0; i < 7; i++) {
        (await loadDay(monday.add(i, 'day'))).forEach(p =>
          weekArr.push({ ...p, time: i })
        );
      }
      setData(weekArr);
      setMarked(false);
    } else {
      const jan = cursor.startOf('year');
      const yr = [];
      for (let m = 0; m < 12; m++) {
        (await loadDay(jan.add(m, 'month').date(15))).forEach(p => {
          const dup = yr.find(x => x.emotion === p.emotion && x.time === m);
          if (!dup || p.strength > dup.strength) yr.push({ ...p, time: m });
        });
      }
      setData(yr);
      setMarked(false);
    }
  }, [cursor, mode, showGraph]);

  useEffect(() => { recompute(); }, [recompute]);

  /* ── навигация по датам ── */
  const shift = dir => {
    if (mode === 'DAY')  setCursor(c => c.add(dir, 'day'));
    if (mode === 'WEEK') setCursor(c => c.add(dir, 'week'));
    if (mode === 'YEAR') setCursor(c => c.add(dir, 'year'));
  };

  /* ── пометить важный день ── */
  const markImportant = () =>
    AsyncStorage.setItem(importantKey(cursor), '1').then(() => setMarked(true));

  /* ── размеры графика ── */
  const chartW = width * 0.75;
  const chartH = height * 0.35;
  const svgW   = LEFT_PAD + chartW + RIGHT_PAD;
  const svgH   = TOP_PAD + chartH + BOTTOM_PAD;
  const scaleStrength = v => v * (chartH - 10) + 5;

  /* ==============================================================
     ИНТРО-ЭКРАН
  ============================================================== */
  if (!showGraph) {
    return (
      <ImageBackground source={BG_INTRO} style={styles.root} resizeMode="cover">
        <ScrollView contentContainerStyle={styles.introContent}>
          {/* кнопка back к предыдущему экрану стека */}
         

          <Text style={styles.title}>MENTAL  STATES  FEED</Text>

          {/* пятна эмоций */}
          <View style={styles.blobsWrap}>
            {EMOTIONS.map(e => (
              <View key={e} style={styles.blobItem}>
                <Image source={EMOTION_IMAGES[e]} style={styles.blobImg} />
                <Text style={styles.blobTxt}>{e}</Text>
              </View>
            ))}
          </View>

          {/* лица */}
          <View style={styles.facesRow}>
            {FACES.map((src, i) => (
              <Image key={i} source={src} style={styles.face} />
            ))}
          </View>

          {/* кнопка перехода к графику */}
          <TouchableOpacity
            style={styles.bigBtn}
            onPress={() => setShowGraph(true)}
          >
            <Text style={styles.bigBtnTxt}>SEE HOW YOU FEEL</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    );
  }

  /* ==============================================================
     ГРАФИК-ЭКРАН
  ============================================================== */
  return (
    <ImageBackground source={BG_CHART} style={styles.root} resizeMode="cover">
      {/* back ← вернуться на интро */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => setShowGraph(false)}
      >
        <Image source={ARROW_LEFT} style={styles.backIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>MENTAL  STATES  FEED</Text>

      {/* переключатель режима */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toggleRow}
      >
        {['DAY', 'WEEK', 'YEAR'].map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.tBtn, mode === m && styles.tBtnActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.tText, mode === m && styles.tTextActive]}>
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* дата + стрелки */}
      <View style={styles.navRow}>
        <Text style={styles.dateTxt}>
          {mode === 'DAY'
            ? cursor.format('D MMMM')
            : mode === 'WEEK'
            ? `WEEK ${cursor.week()}`
            : cursor.format('YYYY')}
        </Text>
        <View style={styles.arrowsRow}>
          <TouchableOpacity onPress={() => shift(-1)}>
            <Text style={styles.arr}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => shift(1)}>
            <Text style={styles.arr}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SVG-график */}
      <View style={{ alignSelf: 'center', marginTop: 16, height: svgH }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ width: svgW, height: svgH }}
        >
          <Svg width={svgW} height={svgH}>
            <G y={TOP_PAD}>
              {/* оси */}
              <Line
                x1={LEFT_PAD}
                y1={chartH}
                x2={LEFT_PAD}
                y2={0}
                stroke={AXIS_CLR}
                strokeWidth={2}
              />
              <Line
                x1={LEFT_PAD}
                y1={chartH}
                x2={LEFT_PAD + chartW}
                y2={chartH}
                stroke={AXIS_CLR}
                strokeWidth={2}
              />

              {/* стрелки-указатели */}
              <Line
                x1={LEFT_PAD}
                y1={0}
                x2={LEFT_PAD - 12}
                y2={16}
                stroke={AXIS_CLR}
                strokeWidth={2}
              />
              <Line
                x1={LEFT_PAD}
                y1={0}
                x2={LEFT_PAD + 12}
                y2={16}
                stroke={AXIS_CLR}
                strokeWidth={2}
              />
              <Line
                x1={LEFT_PAD + chartW}
                y1={chartH}
                x2={LEFT_PAD + chartW - 16}
                y2={chartH - 12}
                stroke={AXIS_CLR}
                strokeWidth={2}
              />
              <Line
                x1={LEFT_PAD + chartW}
                y1={chartH}
                x2={LEFT_PAD + chartW - 16}
                y2={chartH + 12}
                stroke={AXIS_CLR}
                strokeWidth={2}
              />

              {/* подписи осей */}
              <SvgText
                x={LEFT_PAD}
                y={-TOP_PAD + 16}
                fill={AXIS_CLR}
                fontSize="12"
                textAnchor="middle"
                fontWeight="bold"
              >
                STRENGTH
              </SvgText>
              <SvgText
                x={LEFT_PAD + chartW - 20}
                y={chartH - 20}
                fill={AXIS_CLR}
                fontSize="12"
                textAnchor="start"
                fontWeight="bold"
              >
                TIME
              </SvgText>

              {/* деления Y */}
              {[5, 10, 15, 20, 25, 30, 35].map((v, i, arr) => {
                const yPos = chartH - (chartH * i) / (arr.length - 1);
                return (
                  <React.Fragment key={v}>
                    <Line
                      x1={LEFT_PAD - 6}
                      x2={LEFT_PAD}
                      y1={yPos}
                      y2={yPos}
                      stroke={AXIS_CLR}
                      strokeWidth={1.5}
                    />
                    <SvgText
                      x={LEFT_PAD - 10}
                      y={yPos + 4}
                      fill={AXIS_CLR}
                      fontSize="10"
                      textAnchor="end"
                    >
                      {v}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* деления X */}
              {(mode === 'DAY'
                ? Array.from({ length: 9 }, (_, i) => {
                    const h = i * 3;
                    const lbl =
                      h === 0
                        ? '12AM'
                        : h < 12
                        ? `${h}AM`
                        : h === 12
                        ? '12PM'
                        : `${h - 12}PM`;
                    return { lbl };
                  })
                : mode === 'WEEK'
                ? ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(lbl => ({ lbl }))
                : [
                    'JAN',
                    'FEB',
                    'MAR',
                    'APR',
                    'MAY',
                    'JUN',
                    'JUL',
                    'AUG',
                    'SEP',
                    'OCT',
                    'NOV',
                    'DEC',
                  ].map(lbl => ({ lbl }))).map((t, idx, arr) => {
                const x = LEFT_PAD + (chartW * idx) / (arr.length - 1);
                return (
                  <React.Fragment key={idx}>
                    <Line
                      x1={x}
                      x2={x}
                      y1={chartH}
                      y2={chartH + 8}
                      stroke={AXIS_CLR}
                      strokeWidth={1.5}
                    />
                    <SvgText
                      x={x}
                      y={chartH + 25}
                      fill={AXIS_CLR}
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {t.lbl}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* точки-эмоции */}
              {data.map((p, i) => {
                const xPure =
                  mode === 'DAY'
                    ? (p.time * chartW) / 24
                    : mode === 'WEEK'
                    ? (p.time * chartW) / 6.5
                    : (p.time * chartW) / 11.5;
                const x = LEFT_PAD + xPure;
                const y = chartH - scaleStrength(p.strength);

                return (
                  <React.Fragment key={`${p.emotion}-${i}`}>
                    <SvgImage
                      href={EMOTION_IMAGES[p.emotion]}
                      width={42}
                      height={42}
                      x={x - 21}
                      y={y - 42}
                    />
                    <SvgText
                      x={x}
                      y={y - 8}
                      fill="#FFFFFF"
                      fontSize="11"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {p.emotion}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </G>
          </Svg>
        </ScrollView>
      </View>

      {/* кнопка «Mark the day» (только в DAY) */}
      {mode === 'DAY' && !marked && (
        <TouchableOpacity style={styles.markBtn} onPress={markImportant}>
          <Text style={styles.markText}>
            MARK THE DAY AS ESPECIALLY IMPORTANT
          </Text>
        </TouchableOpacity>
      )}

      {/* нижний отступ, чтобы не пряталось за home-indicator */}
      <View style={{ height: 80 }} />
    </ImageBackground>
  );
}

/* ─────────────────────  S T Y L E S  ───────────────────── */
const BORDER = 26;
const styles = StyleSheet.create({
  root: { flex: 1 },

  /* кнопка back (общая) */
  backBtn: {
    position: 'absolute',
    top: 37,
    left: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },

  /* заголовок */
  title: {
    marginTop: 40,
    alignSelf: 'center',
    fontFamily: 'Staatliches-Regular',
    fontSize: 24,
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  /* интро */
  introContent: {
    alignItems: 'center',
    paddingBottom: 120,
  },
  blobsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingHorizontal: 10,
  },
  blobItem: { width: width / 3.3, alignItems: 'center', marginVertical: 8 },
  blobImg: { width: 55, height: 55, resizeMode: 'contain' ,  },
  blobTxt: {
    marginTop: 4,
    fontFamily: 'Staatliches-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  facesRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 40,
    paddingHorizontal: 50,
  },
  face: { width: 110, height: 110, resizeMode: 'contain' , marginTop:-40, },

  bigBtn: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 36,
  },
  bigBtnTxt: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 22,
    color: '#FF8A7A',
    letterSpacing: 3,
  },

  /* график: переключатель */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  tBtn: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 36,
    marginRight: 10,
  },
  tBtnActive: { backgroundColor: '#FF8A7A' },
  tText: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 18,
    color: '#FFFFFF',
  },
  tTextActive: { color: '#FFFFFF' },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  dateTxt: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 20,
    color: '#F6A893',
    letterSpacing: 4,
  },
  arrowsRow: { flexDirection: 'row', alignItems: 'center' },
  arr: { color: '#F6A893', fontSize: 24, marginLeft: 18 },

  markBtn: {
    marginTop: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: BORDER,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  markText: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

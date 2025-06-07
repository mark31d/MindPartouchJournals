// Components/Notes.js
// -----------------------------------------------------------------------------
// Calendar-заметки. Теперь тег «TODAY» и тег для выбранной даты хранятся
// раздельно, поэтому выбор сегодня не влияет на другие дни и наоборот.
// -----------------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

/* assets */
const ARROW_LEFT  = require('../assets/arrow_l.png');
const ARROW_RIGHT = require('../assets/arrow_r.png');
const ICON_SLEEP  = require('../assets/icon_sleep.png');
const ICON_SUN    = require('../assets/icon_sun.png');
const ICON_PHONE  = require('../assets/icon_phone.png');
const BG          = require('../assets/onb_bg.png');

const TAGS = [
  { key: 'sleep', label: 'NO SLEEP',          icon: ICON_SLEEP },
  { key: 'sunny', label: 'WAS SUNNY',         icon: ICON_SUN   },
  { key: 'talk',  label: 'TALK WITH PARENTS', icon: ICON_PHONE },
];

/* helpers */
const keyFor = (y, m, d) => `note_${y}_${m}_${d}`;
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/* component ------------------------------------------------------------------*/
export default function Notes() {
  const navigation    = useNavigation();

  /* сегодняшняя дата, понадобится много раз */
  const today         = new Date();
  const TODAY_DAY     = today.getDate();
  const TODAY_MONTH   = today.getMonth();
  const TODAY_YEAR    = today.getFullYear();

  /* state */
  const [todayTag,   setTodayTag]   = useState('sunny');      // тег, поставленный на «сегодня»
  const [dayTag,     setDayTag]     = useState('sunny');      // тег, связанный с выбранной датой
  const [monthIndex, setMonthIndex] = useState(TODAY_MONTH);
  const [year,       setYear]       = useState(TODAY_YEAR);
  const [daysArray,  setDaysArray]  = useState([]);
  const [selectedDay, setSelectedDay] = useState(TODAY_DAY);

  /* ----------------------------------------------------------------------- */
  /* инициализация: календарь + загрузка тегов                               */
  /* ----------------------------------------------------------------------- */
  useEffect(() => {
    // календарь на текущий месяц
    recalcCalendar(monthIndex, year);

    // подгружаем тег для выбранного дня
    loadSavedTag(monthIndex, year, selectedDay, false);

    // подгрузим также тег для TODAY (могут совпадать, но это нормально)
    loadSavedTag(TODAY_MONTH, TODAY_YEAR, TODAY_DAY, true);
  }, []);

  /* когда меняется месяц / год / выбранный день — подтягиваем другой тег */
  useEffect(() => {
    // если пользователь ткнул «сегодня» → dayTag = todayTag (уже загружен)
    if (
      selectedDay === TODAY_DAY &&
      monthIndex   === TODAY_MONTH &&
      year         === TODAY_YEAR
    ) {
      setDayTag(todayTag);
    } else {
      loadSavedTag(monthIndex, year, selectedDay, false);
    }
  }, [monthIndex, year, selectedDay]);

  /* ----------------------------------------------------------------------- */
  /* функции-помощники                                                        */
  /* ----------------------------------------------------------------------- */
  /** пересчитать количество дней в месяце → массив [1..n] для рендера  */
  const recalcCalendar = (m, y) => {
    const count = new Date(y, m + 1, 0).getDate();
    setDaysArray(Array.from({ length: count }, (_, i) => i + 1));

    // если предыдущий selectedDay > дней в новом месяце
    setSelectedDay(prev => Math.min(prev, count));
  };

  /** загрузить тег из AsyncStorage
   *  isToday = true  → пишем в todayTag
   *  isToday = false → пишем в dayTag
   */
  const loadSavedTag = async (m, y, d, isToday) => {
    try {
      const stored = await AsyncStorage.getItem(keyFor(y, m, d));
      if (isToday) {
        setTodayTag(stored ?? 'sunny');
      } else {
        setDayTag(stored ?? 'sunny');
      }
    } catch (e) {
      console.warn('loadSavedTag', e);
    }
  };

  /** переход по месяцам */
  const changeMonth = delta => {
    let m = monthIndex + delta;
    let y = year;

    if (m < 0)  { m = 11; y -= 1; }
    if (m > 11) { m =  0; y += 1; }

    setMonthIndex(m);
    setYear(y);
    recalcCalendar(m, y);
  };

  /** сохранить dayTag для выбранного дня */
  const saveAndClose = async () => {
    try {
      await AsyncStorage.setItem(keyFor(year, monthIndex, selectedDay), dayTag);

      // если сохраняем именно today → синхронизируем todayTag
      if (
        selectedDay === TODAY_DAY &&
        monthIndex   === TODAY_MONTH &&
        year         === TODAY_YEAR
      ) {
        setTodayTag(dayTag);
      }
    } catch (e) {
      console.warn('save error', e);
    }
    navigation.goBack();
  };

  /** нажатие на число календаря */
  const onSelectDay = d => {
    setSelectedDay(d);
    // setDayTag отработает в useEffect, но для отзывчивости можно сразу
    if (
      d === TODAY_DAY &&
      monthIndex === TODAY_MONTH &&
      year === TODAY_YEAR
    ) {
      setDayTag(todayTag);
    }
  };

  /* ----------------------------------------------------------------------- */
  /* рендер                                                                   */
  /* ----------------------------------------------------------------------- */
  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      {/* ───── header ───── */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backBtn}>
          <Image source={ARROW_LEFT} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NOTES</Text>
        <View style={styles.backBtn} />{/* для выравнивания */}
      </View>

      {/* ───── контент ───── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TODAY */}
        <Text style={styles.sectionTitle}>TODAY</Text>
        <View style={styles.tagsRow}>
          {TAGS.map(t => {
            const active = todayTag === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.tagContainer,
                  active && styles.tagContainerActive,
                ]}
                onPress={() => {
                  setTodayTag(t.key);
                  /* если выбран именно сегодняш­ний день в календаре –
                     синхронизируем нижний блок */
                  if (
                    selectedDay === TODAY_DAY &&
                    monthIndex   === TODAY_MONTH &&
                    year         === TODAY_YEAR
                  ) {
                    setDayTag(t.key);
                  }
                }}
              >
                <Image
                  source={t.icon}
                  style={[
                    styles.tagIcon,
                    active ? styles.tagIconActive : styles.tagIconInactive,
                  ]}
                />
                <Text
                  style={[
                    styles.tagLabel,
                    active ? styles.tagLabelActive : styles.tagLabelInactive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CALENDAR */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>CALENDAR</Text>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => changeMonth(-1)}
            style={styles.monthNavBtn}
          >
            <Image source={ARROW_LEFT} style={styles.monthNavIcon} />
          </TouchableOpacity>

          <Text style={styles.monthYearText}>
            {MONTH_NAMES[monthIndex].toUpperCase()} {year}
          </Text>

          <TouchableOpacity
            onPress={() => changeMonth(1)}
            style={styles.monthNavBtn}
          >
            <Image source={ARROW_RIGHT} style={styles.monthNavIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {['M','T','W','T','F','S','S'].map((d,i) => (
            <Text key={i} style={styles.weekDayLabel}>{d}</Text>
          ))}
        </View>

        <View style={styles.datesGrid}>
          {daysArray.map(d => {
            const selected = selectedDay === d;
            return (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dayCircle,
                  selected && styles.dayCircleSelected,
                ]}
                onPress={() => onSelectDay(d)}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    selected && styles.dayLabelSelected,
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* TAGS для выбранного дня */}
        <View style={styles.tagsRow}>
          {TAGS.map(t => {
            const active = dayTag === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.tagContainer,
                  active && styles.tagContainerActive,
                ]}
                onPress={() => setDayTag(t.key)}
              >
                <Image
                  source={t.icon}
                  style={[
                    styles.tagIcon,
                    active ? styles.tagIconActive : styles.tagIconInactive,
                  ]}
                />
                <Text
                  style={[
                    styles.tagLabel,
                    active ? styles.tagLabelActive : styles.tagLabelInactive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={saveAndClose}>
          <Text style={styles.saveBtnLabel}>SAVE AND CLOSE</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

/* ─── styles (unchanged, только удалены дублирующиеся блоки) ─── */
const PILL_HEIGHT = 100;
const styles = StyleSheet.create({
  root:{ flex:1 },

  headerContainer:{
    marginTop: height*0.02,
    marginHorizontal:16,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
  },
  backBtn:{ width:36,height:36,justifyContent:'center',alignItems:'center' },
  backIcon:{ width:24,height:24,tintColor:'#FFF',resizeMode:'contain',marginTop:15 },
  headerTitle:{
    marginTop:15,flex:1,textAlign:'center',
    fontFamily:'Staatliches-Regular',fontSize:28,color:'#FFF',letterSpacing:2,
  },

  scrollContent:{ paddingHorizontal:16,paddingTop:24,paddingBottom:16 },
  sectionTitle:{ fontFamily:'Staatliches-Regular',fontSize:20,color:'#FFF',letterSpacing:2 },
  tagsRow:{ flexDirection:'row',justifyContent:'space-between',marginTop:12 },

  tagContainer:{
    width:(width-32-16)/3,height:PILL_HEIGHT,borderRadius:18,
    borderWidth:1,borderColor:'rgba(255,255,255,0.35)',
    justifyContent:'center',alignItems:'center',paddingHorizontal:8,
  },
  tagContainerActive:{ backgroundColor:'#E15A4A',borderColor:'transparent' },
  tagIcon:{ width:36,height:36,marginBottom:8,resizeMode:'contain' },
  tagIconInactive:{ tintColor:'rgba(255,255,255,0.35)' },
  tagIconActive:{   tintColor:'#FFFFFF' },
  tagLabel:{ fontFamily:'Staatliches-Regular',fontSize:14,letterSpacing:1,textAlign:'center' },
  tagLabelInactive:{ color:'rgba(255,255,255,0.35)' },
  tagLabelActive:{   color:'#FFFFFF' },

  /* calendar */
  calendarHeader:{
    flexDirection:'row',alignItems:'center',justifyContent:'center',marginTop:24,
  },
  monthNavBtn:{ width:36,height:36,justifyContent:'center',alignItems:'center' },
  monthNavIcon:{ width:24,height:24,tintColor:'#FFFFFF',resizeMode:'contain' },
  monthYearText:{
    flex:1,textAlign:'center',fontFamily:'Staatliches-Regular',
    fontSize:16,color:'#E15A4A',letterSpacing:1.5,
  },
  weekDaysRow:{
    flexDirection:'row',justifyContent:'space-between',marginTop:8,paddingHorizontal:8,
  },
  weekDayLabel:{
    fontFamily:'Montserrat-Regular',fontSize:12,color:'rgba(255,255,255,0.6)',
    width:(width-32)/7,textAlign:'center',
  },
  datesGrid:{
    flexDirection:'row',flexWrap:'wrap',justifyContent:'flex-start',marginTop:4,
  },
  dayCircle:{
    width:(width-32)/7-4,height:(width-32)/7-4,
    borderRadius:((width-32)/7-4)/2,
    borderWidth:1,borderColor:'rgba(255,255,255,0.6)',
    marginHorizontal:2,marginVertical:4,justifyContent:'center',alignItems:'center',
  },
  dayCircleSelected:{ backgroundColor:'#FFFFFF',borderColor:'transparent' },
  dayLabel:{ fontFamily:'Montserrat-Regular',fontSize:12,color:'#FFFFFF' },
  dayLabelSelected:{ color:'#E15A4A',fontWeight:'600' },

  footer:{ position:'absolute',left:0,right:0,bottom:0,paddingHorizontal:16,paddingBottom:16 },
  saveBtn:{ height:56,borderRadius:28,backgroundColor:'#FFF',justifyContent:'center',alignItems:'center' },
  saveBtnLabel:{ fontFamily:'Staatliches-Regular',fontSize:18,letterSpacing:2,color:'#D54B47' },
});

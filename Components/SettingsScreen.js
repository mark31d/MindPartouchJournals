// Components/SettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Switch,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

// ─── ресурсы ─────────────────────────────────────────────────────────
const HOME_BG = require('../assets/onb_bg.png');      // общий фон
const CLOSE   = require('../assets/arrow_l.png'); // «крестик»
const CHECK   = require('../assets/check_icon.png');   // зелёная галка
const PLUS    = require('../assets/plus_icon.png');    // серый плюс
const Right    = require('../assets/arrow_r.png'); 
// ────────────────────────────────────────────────────────────────────

/*–––––––––––––––––––– НАВИГАЦИЯ ВНУТРИ МОДУЛЯ ––––––––––––––––––––*/
const Stack = createNativeStackNavigator();
export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome"       component={SettingsHome}       />
      <Stack.Screen name="MentalMapStyle"     component={MentalMapStyle}    />
      <Stack.Screen name="DeveloperInfo"      component={DeveloperInfo}     />
    </Stack.Navigator>
  );
}

/*───────────────────────────────────────────*/
/*                 ЭКРАН 1                   */
/*───────────────────────────────────────────*/
function SettingsHome({ navigation }) {
  const [darkTheme,     setDarkTheme]     = useState(false);
  const [notifications, setNotifications] = useState(true);

  StatusBar.setHidden(true);

  return (
    <ImageBackground source={HOME_BG} style={s.root} resizeMode="cover">
      {/* заголовок */}
      <Text style={s.title}>SETTINGS</Text>

      {/* карточка-переключатель */}
      <Card>
        <Text style={s.label}>NOTIFICATIONS</Text>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: '#9A9A9A', true: '#6ACB96' }}
          thumbColor="#FFFFFF"
        />
      </Card>

      {/* переходы на два других экрана */}
      <Card onPress={() => navigation.navigate('MentalMapStyle')}>
        <Text style={s.label}>MENTAL MAP STYLE</Text>
        <Image source={Right} style={s.arrow} />
      </Card>

      <Card onPress={() => navigation.navigate('DeveloperInfo')}>
        <Text style={s.label}>DEVELOPER INFO</Text>
        <Image source={Right} style={s.arrow} />
      </Card>
    </ImageBackground>
  );
}

/*───────────────────────────────────────────*/
/*                 ЭКРАН 2                   */
/*───────────────────────────────────────────*/
function MentalMapStyle({ navigation }) {
    const [styleChoice, setStyleChoice] = useState('abstract');

  StatusBar.setHidden(true);

  return (
    <ImageBackground source={HOME_BG} style={s.root} resizeMode="cover">
      <BackBtn onPress={() => navigation.goBack()} />

      <Text style={s.title}>MENTAL MAP STYLE</Text>

      <Card onPress={() => setStyleChoice('abstract')}>
        <Text style={s.label}>ABSTRACT PATTERNS</Text>
        <Image source={styleChoice === 'abstract' ? CHECK : PLUS} style={s.arrow1}/>
      </Card>

      <Card onPress={() => setStyleChoice('flat')}>
        <Text style={s.label}>FLAT COLOR BLOCKS</Text>
        <Image source={styleChoice === 'flat' ? CHECK : PLUS} style={s.arrow1}/>
      </Card>
    </ImageBackground>
  );
}

/*───────────────────────────────────────────*/
/*                 ЭКРАН 3                   */
/*───────────────────────────────────────────*/
function DeveloperInfo({ navigation }) {
  StatusBar.setHidden(true);

  return (
    <ImageBackground source={HOME_BG} style={s.root} resizeMode="cover">
      <BackBtn onPress={() => navigation.goBack()} />

      <Text style={s.title}>DEVELOPER INFO</Text>

      <ScrollView contentContainerStyle={s.scroll}>
        <P>
          MIND PARTOUCH JOURNAL WAS CREATED BY THOSE WHO BELIEVE IN GENTLE
          DIGITAL TOOLS FOR SELF-AWARENESS.
        </P>
        <P>
          OUR GOAL IS TO OFFER A QUIET SPACE FOR REFLECTION—WITHOUT PRESSURE,
          JUDGMENT, OR ANALYTICS. WE WANTED TO BUILD AN APP THAT FEELS MORE LIKE
          A COMPANION THAN A TRACKER, HELPING YOU NOTICE YOUR EMOTIONAL AND
          MENTAL STATE WITH SOFTNESS AND CARE.
        </P>
        <P>
          THE PARTOUCH CHARACTER IS YOUR MENTAL GUIDE: CALM, CURIOUS, AND ALWAYS
          PRESENT. EVERY FEATURE IN THE APP IS DESIGNED TO SUPPORT A MINDFUL
          PAUSE AND A DEEPER CONNECTION WITH YOUR INNER LANDSCAPE.
        </P>
        <P>
          WE HOPE MIND PARTOUCH JOURNAL BRINGS YOU MOMENTS OF CLARITY, COMFORT,
          AND INSIGHT.
        </P>
      </ScrollView>
    </ImageBackground>
  );
}

/*───────────────────────────────────────────*/
/*          Переиспользуемые мелочи          */
/*───────────────────────────────────────────*/
function Card({ children, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={s.card}
    >
      {children}
    </TouchableOpacity>
  );
}

function BackBtn({ onPress }) {
  return (
    <TouchableOpacity style={s.backBtn} onPress={onPress}>
      <Image source={CLOSE} style={s.closeIcon} />
    </TouchableOpacity>
  );
}

function P({ children }) {
  return <Text style={s.paragraph}>{children}</Text>;
}

/*───────────────────────────────────────────*/
/*                 СТИЛИ                     */
/*───────────────────────────────────────────*/
const BORDER = 12;
const CARD_H = 56;

const s = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
  },

  /* back */
  backBtn:   { position: 'absolute', top: 40, left: 16, width: 28, height: 28 },
  closeIcon: { width: 20, height: 20, tintColor: '#FFFFFF', resizeMode: 'contain' },

  /* title */
  title: {
    fontFamily: 'Staatliches-Regular',
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 24,
    textAlign: 'center',
  },

  /* card */
  card: {
    width: width * 0.9,
    height: CARD_H,
    borderRadius: BORDER,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  arrow: {
    width: 22,
    height: 22,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  arrow1: {
    width: 22,
    height: 22,
   
    resizeMode: 'contain',
  },
  /* developer info text */
  scroll:   { paddingHorizontal: 24, paddingBottom: 40 },
  paragraph:{
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 24,
  },
});

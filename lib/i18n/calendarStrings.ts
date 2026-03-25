export type CalStrings = {
  planets: Record<string, string>;
  signs: string[];
  aspects: Record<string, string>;
  phaseNames: string[];
  phaseKeys: string[];
  moonIngressPhases: string[];
  enters: string;
  stationsRetrograde: string;
  resumesDirect: string;
  lunarEclipse: string;
  solarEclipse: string;
  categoryLabels: Record<string, string>;
  calendarNameTemplate: string;
  calendarDescTemplate: string;
};

const en: CalStrings = {
  planets: {
    Sun: 'Sun',
    Moon: 'Moon',
    Mercury: 'Mercury',
    Venus: 'Venus',
    Mars: 'Mars',
    Jupiter: 'Jupiter',
    Saturn: 'Saturn',
    Uranus: 'Uranus',
    Neptune: 'Neptune',
    Pluto: 'Pluto',
  },
  signs: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  aspects: {
    conjunct: 'conjunct',
    sextile: 'sextile',
    square: 'square',
    trine: 'trine',
    opposition: 'opposition',
  },
  phaseNames: ['New Moon 🌑', 'First Quarter 🌓', 'Full Moon 🌕', 'Last Quarter 🌗'],
  phaseKeys: ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'],
  moonIngressPhases: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'],
  enters: 'enters',
  stationsRetrograde: 'stations retrograde',
  resumesDirect: 'resumes direct',
  lunarEclipse: 'Lunar Eclipse ☽',
  solarEclipse: 'Solar Eclipse ☀',
  categoryLabels: {
    'outer-transit': 'Outer Planet Transit',
    'inner-transit': 'Inner Planet Transit',
    lunar: 'Lunar Phase',
    ingress: 'Ingress',
    retrograde: 'Retrograde',
    eclipse: 'Eclipse',
  },
  calendarNameTemplate: "{name}'s Astrology",
  calendarDescTemplate: 'Personalized transits for {name}, born {date} in {city}',
};

const ptBR: CalStrings = {
  planets: {
    Sun: 'Sol',
    Moon: 'Lua',
    Mercury: 'Mercúrio',
    Venus: 'Vênus',
    Mars: 'Marte',
    Jupiter: 'Júpiter',
    Saturn: 'Saturno',
    Uranus: 'Urano',
    Neptune: 'Netuno',
    Pluto: 'Plutão',
  },
  signs: ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'],
  aspects: {
    conjunct: 'conjunção',
    sextile: 'sextil',
    square: 'quadratura',
    trine: 'trígono',
    opposition: 'oposição',
  },
  phaseNames: ['Lua Nova 🌑', 'Quarto Crescente 🌓', 'Lua Cheia 🌕', 'Quarto Minguante 🌗'],
  phaseKeys: ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'],
  moonIngressPhases: ['Lua Nova', 'Crescente', 'Quarto Crescente', 'Crescente Gibosa', 'Lua Cheia', 'Minguante Gibosa', 'Quarto Minguante', 'Minguante'],
  enters: 'entra em',
  stationsRetrograde: 'estaciona retrógrado',
  resumesDirect: 'retoma direção direta',
  lunarEclipse: 'Eclipse Lunar ☽',
  solarEclipse: 'Eclipse Solar ☀',
  categoryLabels: {
    'outer-transit': 'Trânsito de Planeta Externo',
    'inner-transit': 'Trânsito de Planeta Pessoal',
    lunar: 'Fase Lunar',
    ingress: 'Ingresso',
    retrograde: 'Retrógrado',
    eclipse: 'Eclipse',
  },
  calendarNameTemplate: 'Astrologia de {name}',
  calendarDescTemplate: 'Trânsitos personalizados para {name}, nascido em {date} em {city}',
};

const locales: Record<string, CalStrings> = {
  en,
  'pt-BR': ptBR,
};

export function getCalStrings(locale?: string): CalStrings {
  if (locale && locales[locale]) return locales[locale];
  return en;
}

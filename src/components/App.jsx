import React, { useState, useEffect } from 'react';

import Hero from './Hero/Hero';
import About from './About/About';
import Projects from './Projects/Projects';
import Contact from './Contact/Contact';
import Footer from './Footer/Footer';

import { PortfolioProvider } from '../context/context';
import useIntl from '../hooks/useIntl'

import { footerData } from '../mock/data';
import LanguageSelector from './LanguageSelector/LanguageSelector';

const LANGUAGES = ['en', 'es', 'pt']


function App() {
  const [language, setLanguage] = useState(0)
  const [footer, setFooter] = useState({});

  const data = useIntl(LANGUAGES[language])

  const changeLanguage = () => {
    console.log(language)

    if (language === 2) {
      setLanguage(0)
    } else {
      setLanguage(language + 1)
    }
  }

  useEffect(() => {
    setFooter({ ...footerData });
  }, []);

  return (
    <PortfolioProvider value={{ ...data, footer }}>
      <Hero />
      <LanguageSelector language={LANGUAGES[language]} changeLanguage={changeLanguage} />
    </PortfolioProvider>
  );
}

export default App;

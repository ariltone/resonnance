import { useState } from 'react';
import Traversee from './Traversee';
import Reglages from './Reglages';
import Auth from './Auth';
import './App.css';

// Coquille : navigation Jeu / Réglages / Compte.
// Le jeu est la Traversée en 3 temps ; les réglages regroupent rythme, phrases et photothèque.
// L'ancien flux (questions préalables, expression à chaud, onglet Parcours) est retiré.

export default function App() {
  const [view, setView] = useState<'jeu' | 'reglages' | 'compte'>('jeu');

  return (
    <div className="res">
      <header>
        <div className="brand">RÉSONANCE</div>
        <div className="motto">Tu choisis une image. Puis tu découvres pourquoi tu l'as choisie.</div>
        <nav className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
          <button className={view === 'jeu' ? 'primary' : 'ghost'} onClick={() => setView('jeu')}>Jeu</button>
          <button className={view === 'reglages' ? 'primary' : 'ghost'} onClick={() => setView('reglages')}>Réglages</button>
          <button className={view === 'compte' ? 'primary' : 'ghost'} onClick={() => setView('compte')}>Compte</button>
        </nav>
      </header>

      {view === 'reglages' ? <Reglages /> : view === 'compte' ? <Auth onChange={() => {}} /> : <Traversee />}

      <footer>Si je t'ai perdu, ce n'est pas grave. Moi, j'arrive à me suivre. — Bloc 5, sans IA.</footer>
    </div>
  );
}

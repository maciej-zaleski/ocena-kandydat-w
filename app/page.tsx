'use client';

import { useEffect, useRef, useState } from 'react';

type Candidate = {
  id: string;
  name: string;
  date: string;
  notes: Record<string, string>;
  scores: Record<string, number>;
  bonusPoints: number;
  bonusNote: string;
};

type Question = {
  block: number;
  blockTitle?: string;
  mins?: string;
  id: string;
  text: string;
};

const QUESTIONS: Question[] = [
  { block: 1, blockTitle: 'Otwarcie', mins: '2 min', id: 'q_open',
    text: 'Krótkie nawiązanie do przesłanego zadania filtrującego — co zwróciło Twoją uwagę w ich zgłoszeniu?' },

  { block: 2, blockTitle: 'Doświadczenie, narzędzia i warunki', mins: '8 min', id: 'q_tools',
    text: 'Jakich narzędzi używałeś/aś do wyszukiwania leadów i zarządzania kontaktem z klientem?' },
  { block: 2, id: 'q_day',
    text: 'Jak wyglądał Twój dotychczasowy dzień pracy w sprzedaży — ile czasu szło na szukanie leadów, ile na rozmowy?' },
  { block: 2, id: 'q_b2b',
    text: 'Ta rola to współpraca B2B — czy masz już działalność gospodarczą, i czy rozumiesz różnicę między tym a etatem pod kątem swojej sytuacji (składki, odpowiedzialność, rozliczenia)?' },
  { block: 2, id: 'q_pay',
    text: 'Model wynagrodzenia to niska podstawa (5–8 tys. zł) + 5–10% prowizji od zysku projektu. Jak to rozumiesz i jakich realnych zarobków oczekujesz np. po 6 miesiącach?' },
  { block: 2, id: 'q_hours',
    text: 'Czy to ma być Twoje główne, pełnoetatowe zajęcie, czy szukasz czegoś na część etatu / łączysz z czymś innym? Jeśli część etatu — ile godzin tygodniowo realnie możesz poświęcić?' },

  { block: 3, blockTitle: 'Jak widzi tę rolę', mins: '6 min', id: 'q_understand_go2ops',
    text: 'Jak rozumiesz, czym właściwie zajmuje się Go2Ops? Co byś powiedział/a, że sprzedajemy?' },
  { block: 3, id: 'q_week',
    text: 'Jak wyobrażasz sobie swój typowy tydzień pracy na tym stanowisku?' },
  { block: 3, id: 'q_process',
    text: 'Gdybyś miał/a zbudować proces pozyskiwania leadów dla Go2Ops od zera, od czego byś zaczął/ęła w pierwszym miesiącu?' },
  { block: 3, id: 'q_diff',
    text: 'Jak rozumiesz różnicę między „generowaniem leadów” a „domykaniem sprzedaży” — i którą część czujesz się mocniej?' },

  { block: 4, blockTitle: 'Scenariusz sytuacyjny', mins: '4 min', id: 'q_scenario1',
    text: 'Wysyłasz 20 wiadomości outbound w tygodniu i dostajesz 1 odpowiedź. Co robisz?' },
  { block: 4, id: 'q_scenario2',
    text: 'Klient mówi „fajnie, ale nie teraz, wróćcie za pół roku” — co robisz dalej?' },

  { block: 5, blockTitle: 'Angielski', mins: '3 min', id: 'q_eng1',
    text: '„Let\'s switch to English — can you tell me about a time you had to convince someone who was hesitant?”' },
  { block: 5, id: 'q_eng2',
    text: '„How would you introduce Go2Ops in one sentence to someone who\'s never heard of us?”' },

  { block: 6, blockTitle: 'Pytania kandydata i zamknięcie', mins: '2 min', id: 'q_close',
    text: 'Jakie masz pytania do mnie? Kiedy mógłbyś/mogłabyś zacząć?' },
];

const CRITERIA = [
  { id: 'c_english', label: 'Angielski — komunikacja', hint: 'Płynność, zrozumiałość' },
  { id: 'c_experience', label: 'Doświadczenie / narzędzia', hint: 'Konkretne przykłady, nie ogólniki' },
  { id: 'c_terms', label: 'Zrozumienie warunków B2B / wynagrodzenia', hint: 'Realistyczna ocena modelu prowizyjnego' },
  { id: 'c_availability', label: 'Dostępność czasowa', hint: 'Deklarowane godziny pasują do potrzeb roli' },
  { id: 'c_role', label: 'Zrozumienie roli i firmy', hint: 'Przemyślany plan, rozumie czym zajmuje się Go2Ops' },
  { id: 'c_commitment', label: 'Nastawienie / commitment', hint: 'Energia w odpowiedziach na scenariusze' },
  { id: 'c_independence', label: 'Samodzielność', hint: 'Inicjatywa vs. czekanie na instrukcje' },
  { id: 'c_overall', label: 'Ogólne wrażenie', hint: 'Czy chciałbyś z nim/nią pracować codziennie' },
];

function newCandidate(): Candidate {
  return {
    id: 'c_' + Date.now(),
    name: '',
    date: new Date().toISOString().slice(0, 10),
    notes: {},
    scores: {},
    bonusPoints: 0,
    bonusNote: '',
  };
}

function coreScore(c: Candidate) {
  return CRITERIA.reduce((sum, cr) => sum + (c.scores[cr.id] || 0), 0);
}
function totalScore(c: Candidate) {
  return coreScore(c) + (c.bonusPoints || 0);
}

function verdictFor(score: number) {
  if (score >= 30) return { cls: 'strong', text: 'Silny kandydat — rekomendowany do dalszego etapu.' };
  if (score >= 20) return { cls: 'mid', text: 'Umiarkowany — warto porównać z innymi przed decyzją.' };
  return { cls: 'weak', text: 'Słaby profil względem kryteriów roli.' };
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function Page() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial load
  useEffect(() => {
    fetch('/api/candidates')
      .then((r) => r.json())
      .then((data) => {
        let list: Candidate[] = data.candidates || [];
        if (list.length === 0) list = [newCandidate()];
        setCandidates(list);
        setActiveId(list[0].id);
        setLoaded(true);
      })
      .catch(() => {
        const list = [newCandidate()];
        setCandidates(list);
        setActiveId(list[0].id);
        setLoaded(true);
      });
  }, []);

  // Debounced save whenever candidates change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setSaving(true);
      fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidates }),
      }).finally(() => setSaving(false));
    }, 500);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [candidates, loaded]);

  useEffect(() => {
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  function updateCandidate(id: string, patch: Partial<Candidate>) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function updateNote(id: string, qId: string, value: string) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes: { ...c.notes, [qId]: value } } : c))
    );
  }

  function updateScore(id: string, critId: string, val: number) {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const current = c.scores[critId] || 0;
        const next = current === val ? 0 : val;
        return { ...c, scores: { ...c.scores, [critId]: next } };
      })
    );
  }

  function addCandidate() {
    const c = newCandidate();
    setCandidates((prev) => [...prev, c]);
    setActiveId(c.id);
  }

  function deleteCandidate(id: string) {
    if (!confirm('Usunąć tego kandydata?')) return;
    setCandidates((prev) => {
      let next = prev.filter((c) => c.id !== id);
      if (next.length === 0) next = [newCandidate()];
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
  }

  function toggleTimer() {
    setTimerRunning((running) => {
      const next = !running;
      if (next) {
        timerInterval.current = setInterval(() => {
          setTimerSeconds((s) => {
            if (s <= 1) {
              if (timerInterval.current) clearInterval(timerInterval.current);
              setTimerRunning(false);
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      } else if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      return next;
    });
  }

  function resetTimer() {
    if (timerInterval.current) clearInterval(timerInterval.current);
    setTimerRunning(false);
    setTimerSeconds(25 * 60);
  }

  if (!loaded) {
    return <div className="wrap"><p>Ładowanie…</p></div>;
  }

  const active = candidates.find((c) => c.id === activeId) || null;
  const sortedForList = [...candidates].sort((a, b) => totalScore(b) - totalScore(a));

  return (
    <div className="wrap">
      <header className="page">
        <div>
          <h1>Ocena kandydatów — Handlowiec Go2Ops</h1>
          <p>25-minutowy zestaw pytań + arkusz oceny, automatycznie liczony wynik</p>
        </div>
        <span className="status">{saving ? 'Zapisywanie…' : 'Zapisano'}</span>
      </header>

      <div className="layout">
        <div className="panel candidates">
          <h2>Kandydaci</h2>
          {sortedForList.length === 0 && <div className="empty-list">Brak kandydatów</div>}
          {sortedForList.map((c) => {
            const s = totalScore(c);
            const label = c.name.trim() || '(bez nazwy)';
            return (
              <div
                key={c.id}
                className={`cand-item ${c.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(c.id)}
              >
                <span className="cand-name">{label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`cand-score ${s > 0 ? 'done' : ''}`}>{s}/50</span>
                  <button
                    className="del-btn"
                    title="Usuń kandydata"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCandidate(c.id);
                    }}
                  >
                    ✕
                  </button>
                </span>
              </div>
            );
          })}
          <button className="add-btn" onClick={addCandidate}>+ Nowy kandydat</button>
        </div>

        <div className="panel main">
          {!active ? (
            <div className="no-cand"><p>Brak wybranego kandydata.</p></div>
          ) : (
            <>
              <div className="cand-header">
                <div className="field name-field">
                  <label>Imię i nazwisko</label>
                  <input
                    type="text"
                    value={active.name}
                    placeholder="Imię i nazwisko kandydata"
                    onChange={(e) => updateCandidate(active.id, { name: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Data rozmowy</label>
                  <input
                    type="date"
                    value={active.date}
                    onChange={(e) => updateCandidate(active.id, { date: e.target.value })}
                  />
                </div>
              </div>

              <div className="timer-bar">
                <span className="t">{formatTime(timerSeconds)}</span>
                <button onClick={toggleTimer}>{timerRunning ? 'Pauza' : 'Start'}</button>
                <button onClick={resetTimer}>Reset 25:00</button>
                <span className="hint">Timer rozmowy — 25 minut na komplet pytań</span>
              </div>

              {groupByBlock(QUESTIONS).map((block) => (
                <div className="block" key={block.block}>
                  <div className="block-head">
                    <span className="num">{String(block.block).padStart(2, '0')}</span>
                    <h3>{block.title}</h3>
                    <span className="mins">{block.mins}</span>
                  </div>
                  {block.questions.map((q) => (
                    <div className="q" key={q.id}>
                      <p>{q.text}</p>
                      <textarea
                        placeholder="Notatka..."
                        value={active.notes[q.id] || ''}
                        onChange={(e) => updateNote(active.id, q.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              ))}

              <div className="score-section">
                <h3>Arkusz oceny</h3>
                <div className="sub">Skala 1–5 na każde kryterium, wypełnij po rozmowie</div>

                {CRITERIA.map((c) => {
                  const current = active.scores[c.id] || 0;
                  return (
                    <div className="score-row" key={c.id}>
                      <div className="label">
                        {c.label}
                        <span className="hint">{c.hint}</span>
                      </div>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            className={n <= current ? 'on' : ''}
                            onClick={() => updateScore(active.id, c.id, n)}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="bonus-block">
                  <h4>Inne — dodatkowe punkty</h4>
                  <div className="sub">Jeśli kandydat wyróżnił się czymś, co nie mieści się w powyższych kryteriach — dopisz punkty (0-10) i krótką notatkę dlaczego.</div>
                  <div className="bonus-row">
                    <span className="plabel">Punkty bonusowe:</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={active.bonusPoints || 0}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(10, parseInt(e.target.value || '0', 10)));
                        updateCandidate(active.id, { bonusPoints: v });
                      }}
                    />
                  </div>
                  <textarea
                    placeholder="Co konkretnie wyróżniło kandydata?"
                    value={active.bonusNote || ''}
                    onChange={(e) => updateCandidate(active.id, { bonusNote: e.target.value })}
                  />
                </div>

                <div className="total-row">
                  <span className="tlabel">Suma punktów</span>
                  <span className="tval">
                    {totalScore(active)}
                    <span className="max"> / 40 + bonus (do 10)</span>
                  </span>
                </div>
                <div className={`verdict ${verdictFor(totalScore(active)).cls}`}>
                  {verdictFor(totalScore(active)).text}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <footer>Dane zapisywane w bazie (Vercel KV) — dostępne z każdego urządzenia.</footer>
    </div>
  );
}

function groupByBlock(questions: Question[]) {
  const blocks: { block: number; title: string; mins: string; questions: Question[] }[] = [];
  questions.forEach((q) => {
    let b = blocks.find((b) => b.block === q.block);
    if (!b) {
      b = { block: q.block, title: q.blockTitle || '', mins: q.mins || '', questions: [] };
      blocks.push(b);
    }
    b.questions.push(q);
  });
  return blocks;
}

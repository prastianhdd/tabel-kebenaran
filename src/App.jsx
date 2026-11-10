import { useEffect, useRef, useState } from 'react';
import Keyboard from './Keyboard.jsx';
import { buildTruthTable, normalizeExpression, validateExpression, VARIABLES } from './truthTable.js';
import './App.css';

const OPERATORS = [
  ['¬', 'Negasi', 'Bukan p'], ['&', 'Konjungsi', 'p dan q'],
  ['∨', 'Disjungsi', 'p atau q'], ['⊕', 'Disjungsi eksklusif', 'Hanya salah satu benar'],
  ['→', 'Implikasi', 'Jika p, maka q'], ['↔', 'Biimplikasi', 'p jika dan hanya jika q'],
];

function Icon({ name, size = 20 }) {
  const paths = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16h.01" /></>,
    download: <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />,
    reset: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" /></>,
    grid: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 9v12M15 9v12M3 15h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function App() {
  const [variableCount, setVariableCount] = useState(2);
  const [expressions, setExpressions] = useState([]);
  const [draft, setDraft] = useState('');
  const [table, setTable] = useState(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const resultHeadingRef = useRef(null);
  const variables = VARIABLES.slice(0, variableCount);

  useEffect(() => {
    if (showHelp) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [showHelp]);

  useEffect(() => {
    if (activeTab === 'results') resultHeadingRef.current?.focus();
  }, [activeTab]);

  function invalidate() {
    setTable(null);
    setError('');
    setNotice('');
  }

  function updateDraft(value) {
    setDraft(value);
    invalidate();
  }

  function insertKey(key) {
    const input = inputRef.current;
    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? start;
    const from = key === 'Backspace' && start === end ? Math.max(0, start - 1) : start;
    const text = key === 'Backspace' ? '' : key;
    const value = draft.slice(0, from) + text + draft.slice(end);
    if (value.length > 200) return;
    updateDraft(value);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(from + text.length, from + text.length);
    });
  }

  function addExpression(event) {
    event.preventDefault();
    try {
      validateExpression(draft, variableCount);
      if (expressions.some(expression => normalizeExpression(expression) === normalizeExpression(draft))) {
        throw new Error('Ekspresi ini sudah ada dalam daftar.');
      }
      setExpressions([...expressions, draft.trim()]);
      setDraft('');
      invalidate();
      setNotice('Ekspresi ditambahkan. Tambah lagi atau buat tabel.');
      inputRef.current.focus();
    } catch (exception) {
      setError(exception.message);
      setNotice('');
      inputRef.current.focus();
    }
  }

  function generate() {
    try {
      const list = [...expressions];
      if (draft.trim() && !list.some(expression => normalizeExpression(expression) === normalizeExpression(draft))) list.push(draft.trim());
      const result = buildTruthTable(list, variableCount);
      setExpressions(list);
      setDraft('');
      setTable(result);
      setError('');
      setNotice('');
      setActiveTab('results');
    } catch (exception) {
      setError(exception.message);
      setNotice('');
      inputRef.current.focus();
    }
  }

  function reset() {
    if ((draft || expressions.length) && !window.confirm('Hapus semua ekspresi dan hasil tabel?')) return;
    setDraft('');
    setExpressions([]);
    setVariableCount(2);
    setActiveTab('editor');
    invalidate();
    setNotice('Workspace dikosongkan.');
  }

  function downloadCsv() {
    const quote = value => `"${String(value).replace(/"/g, '""')}"`;
    const content = [
      [...table.variables, ...table.expressions].map(quote).join(','),
      ...table.rows.map(row => row.map(value => value ? 'T' : 'F').join(',')),
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿', content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tabel-kebenaran.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Lewati ke konten</a>
      <header className="site-header">
        <a className="brand" href="./" aria-label="Beranda Tabel Kebenaran">
          <img className="brand-mark" src="/calculator.svg" alt="" width="42" height="42" />
          <span>Tabel Kebenaran<span className="brand-caption">LOGIKA PROPOSISIONAL / DIGITAL</span></span>
        </a>
        <button className="button button-quiet help-button" onClick={() => setShowHelp(true)}><Icon name="help" /> Panduan</button>
      </header>

      <main id="main-content" className="main-content">
        <section className="page-intro" aria-labelledby="page-title">
          <div className="eyebrow"><span className="eyebrow-line" /> LOGIKA DIGITAL</div>
          <h1 id="page-title">Kalkulator <span>tabel kebenaran</span></h1>
          <p>Evaluasi ekspresi Boolean. Periksa setiap kombinasi input dan output.</p>
        </section>

        <div className="workspace">
          <div className="workspace-toolbar">
            <nav className="workspace-nav" aria-label="Tampilan workspace">
              <button className={`workspace-tab ${activeTab === 'editor' ? 'is-active' : ''}`} aria-current={activeTab === 'editor' ? 'page' : undefined} onClick={() => setActiveTab('editor')}><span className="tab-number">01</span> Kalkulator</button>
              <button className={`workspace-tab ${activeTab === 'results' ? 'is-active' : ''}`} aria-current={activeTab === 'results' ? 'page' : undefined} disabled={!table} onClick={() => setActiveTab('results')}><span className="tab-number">02</span> Tabel hasil {table && <span className="ready-dot" />}</button>
            </nav>
            <span className="workspace-label">WORKSPACE</span>
          </div>

          {activeTab === 'editor' ? (
            <div className="editor-layout">
              <section className="editor-panel" aria-labelledby="editor-title">
                <div className="section-heading"><span className="section-index">01 /</span><h2 id="editor-title">Susun ekspresi</h2></div>
                <div className="variable-field">
                  <label htmlFor="variable-count">Jumlah variabel</label>
                  <select id="variable-count" value={variableCount} onChange={event => { setVariableCount(Number(event.target.value)); invalidate(); }}>
                    {VARIABLES.map((_, index) => <option key={index} value={index + 1}>{index + 1} variabel ({VARIABLES.slice(0, index + 1).join(', ')})</option>)}
                  </select>
                </div>
                <form onSubmit={addExpression}>
                  <div className="input-label-row"><label htmlFor="expression">Ekspresi logika</label><span>Enter untuk menambah</span></div>
                  <div className={`expression-editor ${error ? 'has-error' : ''}`}>
                    <span className="expression-prompt" aria-hidden="true">ƒ</span>
                    <input ref={inputRef} id="expression" value={draft} onChange={event => updateDraft(event.target.value)} placeholder="p & (q ∨ ¬p)" maxLength={200} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-invalid={Boolean(error)} aria-describedby={`expression-hint${error ? ' expression-error' : ''}`} />
                    {draft && <button type="button" className="icon-button" aria-label="Kosongkan ekspresi" onClick={() => { updateDraft(''); inputRef.current.focus(); }}><Icon name="close" size={18} /></button>}
                  </div>
                  <p className="field-hint" id="expression-hint">Ketik langsung atau gunakan keyboard di bawah.</p>
                  <Keyboard variables={variables} onKeyClick={insertKey} />
                  <button type="submit" className="button button-secondary add-button" disabled={!draft.trim()}><Icon name="plus" size={18} /> Tambah ekspresi <span className="key-hint" aria-hidden="true">↵</span></button>
                </form>
                <div className="feedback" aria-live="polite" aria-atomic="true">
                  {error && <p className="error-message" id="expression-error" role="alert">{error}</p>}
                  {notice && <p className="notice-message"><Icon name="check" size={16} />{notice}</p>}
                </div>
                <div className="examples"><span>Coba contoh</span>{['p & q', 'p → q', 'p ∨ ¬p'].map(expression => <button key={expression} onClick={() => { updateDraft(expression); inputRef.current.focus(); }}>{expression}</button>)}</div>
              </section>

              <section className="queue-panel" aria-labelledby="queue-title">
                <div className="section-heading"><span className="section-index">02 /</span><h2 id="queue-title">Daftar ekspresi</h2><span className="count-badge" aria-label={`${expressions.length} ekspresi`}>{expressions.length}</span></div>
                <p className="section-description">Setiap ekspresi menjadi satu kolom hasil.</p>
                {expressions.length ? <ol className="expression-list">{expressions.map((expression, index) => (
                  <li key={`${index}-${expression}`}><span className="expression-number">{String(index + 1).padStart(2, '0')}</span><code>{expression}</code><button className="icon-button remove-button" aria-label={`Hapus ekspresi ${index + 1}: ${expression}`} onClick={() => { setExpressions(expressions.filter((_, i) => i !== index)); invalidate(); }}><Icon name="close" size={17} /></button></li>
                ))}</ol> : <div className="empty-state"><span className="empty-icon"><Icon name="grid" size={28} /></span><h3>Mulai dari satu ekspresi.</h3><p>Tambahkan ekspresimu di sebelah,<br />atau pilih contoh untuk mencoba.</p><span className="empty-formula" aria-hidden="true">p <span>→</span> q</span></div>}
                <div className="queue-note"><Icon name="help" size={17} /><p>Belum menekan Tambah? Ekspresi di editor tetap disertakan saat membuat tabel.</p></div>
              </section>
            </div>
          ) : (
            <section className="results-panel" aria-labelledby="results-title">
              <div className="results-heading"><div><div className="eyebrow">OUTPUT / TABEL KEBENARAN</div><h2 id="results-title" ref={resultHeadingRef} tabIndex={-1}>Hasil evaluasi</h2><p>{table.variables.length} variabel · {table.rows.length} kombinasi · {table.expressions.length} ekspresi</p></div><button className="button button-secondary" onClick={downloadCsv}><Icon name="download" size={18} /> Unduh CSV</button></div>
              <div className="table-legend"><span><b className="truth-value is-true">T</b> Benar</span><span><b className="truth-value is-false">F</b> Salah</span><span className="scroll-hint">Geser tabel untuk melihat semua kolom</span></div>
              <div className="table-scroll" role="region" aria-label="Tabel kebenaran, dapat digulir" tabIndex={0}>
                <table className="results-table"><caption className="sr-only">Tabel kebenaran untuk {table.expressions.join(', ')}. T berarti benar, F berarti salah.</caption><thead><tr><th scope="col" className="row-number">No.</th>{table.variables.map(variable => <th key={variable} scope="col">{variable}</th>)}{table.expressions.map((expression, index) => <th key={index} scope="col" className="result-column">{expression}</th>)}</tr></thead><tbody>{table.rows.map((row, index) => <tr key={index}><th scope="row" className="row-number">{String(index + 1).padStart(2, '0')}</th>{row.map((value, column) => <td key={column} className={column >= table.variables.length ? 'result-column' : ''}><span className={`truth-value ${value ? 'is-true' : 'is-false'}`}>{value ? 'T' : 'F'}</span></td>)}</tr>)}</tbody></table>
              </div>
              <div className="classification-list"><h3>Kesimpulan ekspresi</h3>{table.expressions.map((expression, index) => <div key={index}><code>{expression}</code><span className={`classification ${table.classifications[index].toLowerCase()}`}>{table.classifications[index]}</span></div>)}<p>Tautologi: selalu benar. Kontradiksi: selalu salah. Kontingensi: bergantung pada nilai variabel.</p></div>
            </section>
          )}

          <div className="workspace-footer"><button className="button button-quiet reset-button" onClick={reset} disabled={!draft && !expressions.length}><Icon name="reset" size={17} /> Mulai ulang</button>{activeTab === 'editor' ? <button className="button button-primary" onClick={generate} disabled={!draft.trim() && !expressions.length}>Buat tabel kebenaran <Icon name="arrow" size={19} /></button> : <button className="button button-primary" onClick={() => setActiveTab('editor')}>Edit ekspresi <Icon name="plus" size={18} /></button>}</div>
        </div>

        <section className="operator-reference" aria-labelledby="reference-title"><div><h2 id="reference-title">Referensi operator</h2><p>Operator logika proposisional.</p></div><dl>{OPERATORS.map(([symbol, name]) => <div key={symbol}><dt>{symbol}</dt><dd>{name === 'Disjungsi eksklusif' ? 'XOR' : name}</dd></div>)}</dl></section>
      </main>

      <footer className="site-footer"><span>Kalkulator tabel kebenaran online.</span><a href="https://github.com/prastianhdd/" rel="author noopener noreferrer" target="_blank">Dibuat oleh Prastian Hidayat <span aria-hidden="true">↗</span></a></footer>

      <dialog ref={dialogRef} className="help-dialog" aria-labelledby="help-title" onCancel={() => setShowHelp(false)} onClose={() => setShowHelp(false)} onClick={event => { if (event.target === event.currentTarget) setShowHelp(false); }}>
        <div className="help-content"><div className="dialog-heading"><div><div className="eyebrow">PANDUAN SINGKAT</div><h2 id="help-title">Kenali logikamu.</h2></div><button className="icon-button" autoFocus aria-label="Tutup panduan" onClick={() => setShowHelp(false)}><Icon name="close" /></button></div><ol className="usage-steps"><li>Pilih 1–5 variabel yang ingin digunakan.</li><li>Tulis ekspresi, lalu tekan Enter atau Tambah ekspresi.</li><li>Tekan Buat tabel kebenaran untuk melihat semua kombinasi.</li></ol><dl className="help-operators">{OPERATORS.map(([symbol, name, description]) => <div key={symbol}><dt>{symbol}</dt><dd><strong>{name}</strong><span>{description}</span></dd></div>)}</dl><p className="field-hint">Alias keyboard: ! atau ~ untuk ¬, | atau V untuk ∨, -&gt; untuk →, &lt;-&gt; untuk ↔. Gunakan kurung untuk mengatur urutan.</p><p className="field-hint">Prioritas: ¬, &amp;, ⊕, ∨, →, ↔. Implikasi dikelompokkan dari kanan.</p><button className="button button-primary" onClick={() => setShowHelp(false)}>Mengerti, mulai eksplorasi <Icon name="arrow" size={18} /></button></div>
      </dialog>
    </div>
  );
}

export default App;

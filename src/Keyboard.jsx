import './Keyboard.css';

const OPERATORS = [
  ['¬', 'Negasi'], ['&', 'Konjungsi'], ['∨', 'Disjungsi'], ['⊕', 'XOR'],
  ['→', 'Implikasi'], ['↔', 'Biimplikasi'], ['(', 'Kurung buka'], [')', 'Kurung tutup'],
];

export default function Keyboard({ variables, onKeyClick }) {
  return (
    <div className="keyboard" role="group" aria-label="Keyboard ekspresi logika">
      <div className="keyboard-variables">
        <span className="keyboard-label">VARIABEL</span>
        <div className="variable-keys">{variables.map(variable => <button type="button" className="keyboard-key variable-key" key={variable} onMouseDown={event => event.preventDefault()} onClick={() => onKeyClick(variable)} aria-label={`Variabel ${variable}`}>{variable}</button>)}</div>
        <button type="button" className="keyboard-key backspace-key" onMouseDown={event => event.preventDefault()} onClick={() => onKeyClick('Backspace')} aria-label="Hapus karakter sebelum kursor" title="Hapus karakter sebelum kursor"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-7-7 7-7Z" /><path d="m11 9 6 6m0-6-6 6" /></svg></button>
      </div>
      <div className="operator-keys">{OPERATORS.map(([symbol, label]) => <button type="button" className="keyboard-key operator-key" key={symbol} onMouseDown={event => event.preventDefault()} onClick={() => onKeyClick(symbol)} aria-label={`${label}, ${symbol}`} title={label}><span>{symbol}</span><small>{label.startsWith('Kurung') ? label.replace('Kurung ', '') : label}</small></button>)}</div>
    </div>
  );
}

import React from 'react';
import './Keyboard.css'; 

const Keyboard = ({ onKeyClick }) => {
  const variables = ['p', 'q', 'r', 's', 't'];
  const symbols = ['&', 'V', '¬', '⊕', '→', '↔', '(', ')'];

  return (
    <div className="keyboard-container">
      <div className="keyboard-grid variables-grid">
        {variables.map((v) => (
          <button
            key={v}
            className="keyboard-key"
            onClick={() => onKeyClick(v)}
          >
            {v}
          </button>
        ))}
      </div>
      
      <div className="keyboard-grid symbols-grid">
        {symbols.map((s) => (
          <button
            key={s}
            className="keyboard-key symbol"
            onClick={() => onKeyClick(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Keyboard;
import React, { useState, useEffect } from 'react';
import Keyboard from './Keyboard.jsx';
import './App.css';

// --- LOGIKA UTAMA EVALUATOR ---

const PRECEDENCE = {
  '!': 4, '&': 3, '⊕': 2, '|': 2, '→': 1, '↔': 1, '(': 0,
};

function getVariables(expression) {
  const variables = expression.match(/[a-z]/g) || [];
  return [...new Set(variables)].sort();
}

function parseToRPN(expression) {
  const outputQueue = [];
  const operatorStack = [];
  const tokens = expression
    .replace(/↔/g, 'B').replace(/→/g, 'I').replace(/⊕/g, 'X')
    .replace(/\s/g, '').split('') 
    .map(t => t === 'B' ? '↔' : (t === 'I' ? '→' : (t === 'X' ? '⊕' : t)));
  for (const token of tokens) {
    if (/[a-z]/.test(token)) {
      outputQueue.push(token);
    } else if (PRECEDENCE[token] !== undefined) {
      while (operatorStack.length > 0 && PRECEDENCE[operatorStack[operatorStack.length - 1]] >= PRECEDENCE[token]) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.pop();
    }
  }
  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop());
  }
  return outputQueue;
}

function evaluateRPN(rpnQueue, values) {
  const stack = [];
  for (const token of rpnQueue) {
    if (/[a-z]/.test(token)) {
      stack.push(values[token]);
    } else {
      if (token === '!') { const a = stack.pop(); stack.push(!a); }
      else {
        const b = stack.pop(); const a = stack.pop();
        if (token === '&') stack.push(a && b);
        else if (token === '|') stack.push(a || b); 
        else if (token === '⊕') stack.push((a && !b) || (!a && b));
        else if (token === '→') stack.push(!a || b);
        else if (token === '↔') stack.push((a && b) || (!a && !b));
      }
    }
  }
  return stack[0];
}

function generatePermutations(variables) {
  const n = variables.length;
  const rowCount = Math.pow(2, n);
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    const row = {};
    const binary = i.toString(2).padStart(n, '0');
    for (let j = 0; j < n; j++) {
      row[variables[j]] = binary[j] === '1'; 
    }
    rows.push(row);
  }
  return rows; // FFF di atas
}

// --- KOMPONEN REACT ---

function App() {
  const [variableCount, setVariableCount] = useState(2);
  const [expressionsList, setExpressionsList] = useState([]); 
  const [currentExpression, setCurrentExpression] = useState(''); 
  
  const [tableData, setTableData] = useState(null);
  const [error, setError] = useState('');
  const [showResultsPage, setShowResultsPage] = useState(false); 

  const keyLegend = {
    '&': 'AND (Konjungsi)',
    'V': 'OR (Disjungsi / Atau)',
    '¬': 'NOT (Negasi / Bukan)',
    '⊕': 'XOR (Exclusive OR)',
    '→': 'IMPLIES (Implikasi / Jika-Maka)',
    '↔': 'Biiimplikasi (IFF / Jika dan Hanya Jika)',
    '( )': 'Grouping (Kurung)',
  };

  useEffect(() => {
    setExpressionsList([]);
    setCurrentExpression('');
    setTableData(null);
    setError('');
    setShowResultsPage(false); 
  }, [variableCount]);
  
  const handleKeyClick = (key) => {
    setCurrentExpression((prev) => prev + key);
  };
  
  const handleAddExpression = () => {
    if (currentExpression.trim() === '') return;
    setExpressionsList([...expressionsList, currentExpression]);
    setCurrentExpression(''); 
  };

  const handleRemoveExpression = (indexToRemove) => {
    setExpressionsList(expressionsList.filter((_, index) => index !== indexToRemove));
  };

  const handleClearAll = () => {
    setVariableCount(2);
    setExpressionsList([]);
    setCurrentExpression('');
    setTableData(null);
    setError('');
    setShowResultsPage(false); 
  };

  const handleGenerate = () => {
    try {
      setError('');
      if (expressionsList.length === 0) {
        throw new Error("Tidak ada perhitungan. Silakan 'Tambah Perhitungan' terlebih dahulu.");
      }

      const allVars = ['p', 'q', 'r', 's', 't'];
      const baseVariables = allVars.slice(0, variableCount); 

      const processedExpressions = expressionsList.map(expr => 
        expr.replace(/V/g, '|')  
            .replace(/¬/g, '!')   
      );
      
      processedExpressions.forEach((expr, i) => {
        const varsInExpr = getVariables(expr); 
        for (const v of varsInExpr) {
          if (!baseVariables.includes(v)) {
            throw new Error(`Ekspresi "${expressionsList[i]}" memakai variabel '${v}'. Pilih jumlah variabel ${variableCount} hanya mengizinkan: ${baseVariables.join(', ')}.`);
          }
        }
      });

      const rpns = processedExpressions.map(expr => parseToRPN(expr));
      const permutations = generatePermutations(baseVariables);
      
      const headers = [...baseVariables, ...expressionsList];
      const rows = []; 

      for (const perm of permutations) {
        const rowData = baseVariables.map(v => (perm[v] ? 'T' : 'F')); 
        for (const rpn of rpns) {
          const result = evaluateRPN([...rpn], perm);
          rowData.push(result ? 'T' : 'F'); 
        }
        rows.push(rowData); 
      }

      setTableData({ headers, rows }); 
      setShowResultsPage(true); 

    } catch (e) {
      console.error(e);
      setError(`Error: ${e.message}`);
      setTableData(null); 
      setShowResultsPage(false); 
    }
  };

  if (showResultsPage && tableData) {
    return (
      <div className="app-container">
        <div className="app-header">Hasil Tabel Kebenaran</div>
        
        <button 
          className="button back-to-input" 
          onClick={() => setShowResultsPage(false)} 
        >
          &larr; Kembali ke Input
        </button>

        <div className="table-container result-table-full">
          <h3>Tabel Kebenaran Lengkap:</h3>
          <table className="results-table">
            <thead>
              <tr>{tableData.headers.map((h, i) => (<th key={i}>{h}</th>))}</tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="app-footer">
          Tools ini dibuat oleh <a href="https://github.com/prastianhdd/" target="_blank" rel="noopener noreferrer">PrastianHD</a>
        </footer>

        {error && ( <div className="error-message">{error}</div> )} 

      </div>
    );
  }

  // --- RENDER HALAMAN INPUT (DEFAULT) ---
  return (
    <div className="app-container">
      <div className="app-header">Tabel Kebenaran Logika Informatika</div>

      {/* --- MENU INPUT 1 --- */}
      <div className="form-section">
        <label htmlFor="var-select">1. Pilih Jumlah Variabel</label>
        <select 
          id="var-select" 
          className="variable-select"
          value={variableCount} 
          onChange={(e) => setVariableCount(Number(e.target.value))}
        >
          <option value={1}>1 (p)</option>
          <option value={2}>2 (p, q)</option>
          <option value={3}>3 (p, q, r)</option>
          <option value={4}>4 (p, q, r, s)</option>
          <option value={5}>5 (p, q, r, s, t)</option>
        </select>
      </div>

      <div className="form-section">
        <label htmlFor="expr-input">2. Masukkan Perhitungan </label>
        <input
          type="text"
          id="expr-input"
          className="input-display"
          value={currentExpression}
          onChange={(e) => setCurrentExpression(e.target.value)}
          placeholder="Ketik ekspresi (cth: p & (q V ¬r))"
        />
        <Keyboard onKeyClick={handleKeyClick} />
        <button 
          className="button add-expression" 
          onClick={handleAddExpression}
        >
          Tambah Perhitungan
        </button>
      </div>

      <div className="expression-list">
        <h3>Daftar Perhitungan </h3>
        {expressionsList.length === 0 ? (
          <p>Belum ada operator yang ditambahkan.</p>
        ) : (
          <ul className="expression-list-ul">
            {expressionsList.map((expr, index) => (
              <li key={index}>
                <span>{expr}</span>
                <button 
                  className="remove-button" 
                  onClick={() => handleRemoveExpression(index)}
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="button-container main-controls">
        <button className="button generate" onClick={handleGenerate}>
          Generate Table
        </button>
        <button className="button clear" onClick={handleClearAll}>
          Clear All
        </button>
      </div>
      
      <div className="legend">
        <div className="legend-title">Keterangan Keyboard :</div>
        {Object.entries(keyLegend).map(([key, desc]) => (
          <div key={key} className="legend-item">
            <strong>{key}</strong> = {desc}
          </div>
        ))}
      </div>
      
      {error && ( <div className="error-message">{error}</div> )}

      <div className="table-container base-permutation-table">
          <h3>Contoh Permutasi Dasar (Variabel):</h3>
          {(() => {
            const allVars = ['p', 'q', 'r', 's', 't'];
            const currentBaseVariables = allVars.slice(0, variableCount);
            const basePermutations = generatePermutations(currentBaseVariables);
            const baseRows = basePermutations.map(perm => 
              currentBaseVariables.map(v => (perm[v] ? 'T' : 'F'))
            );

            return (
              <table className="results-table">
                <thead>
                  <tr>{currentBaseVariables.map((h, i) => (<th key={i}>{h}</th>))}</tr>
                </thead>
                <tbody>
                  {baseRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      <footer className="app-footer">
        Tools ini dibuat oleh <a href="https://github.com/prastianhdd/" target="_blank" rel="noopener noreferrer">PrastianHD</a>
      </footer> 
    </div>
  );
}

export default App;
import React, { useState } from 'react';

// Definisikan styles di sini agar JSX lebih bersih
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    width: '90%',
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
  },
  inputDisplay: {
    width: '100%',
    boxSizing: 'border-box', // Pastikan padding tidak menambah lebar
    padding: '12px',
    fontSize: '18px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  keyboard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
    gap: '5px',
    marginBottom: '20px',
  },
  key: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  keySymbol: {
    backgroundColor: '#e0e0e0',
    fontWeight: 'bold',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '10px 15px',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
  },
  tableContainer: {
    marginTop: '20px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    border: '1px solid #ddd',
    padding: '8px',
    backgroundColor: '#f2f2f2',
    textAlign: 'center',
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'center',
  },
};

function App() {
  const [expression, setExpression] = useState('');
  const [tableData, setTableData] = useState(null);

  // Kunci keyboard
  const variables = ['p', 'q', 'r', 's', 't', 'u'];
  const symbols = ['&', '|', '!', '(', ')', '→', '↔'];

  const handleKeyClick = (key) => {
    setExpression((prev) => prev + key);
  };

  const handleClear = () => {
    setExpression('');
    setTableData(null);
  };

  const handleGenerate = () => {
    // --- STUB LOGIC ---
    // Logika parser ekspresi dan generator tabel yang sesungguhnya sangat kompleks.
    // Untuk demo ini, kita hanya akan menangani kasus sederhana "p & q" dan "p | q".

    let data = {
      headers: [],
      rows: [],
    };

    const cleanExpression = expression.trim();

    if (cleanExpression === 'p & q') {
      data.headers = ['p', 'q', 'p & q'];
      data.rows = [
        ['T', 'T', 'T'],
        ['T', 'F', 'F'],
        ['F', 'T', 'F'],
        ['F', 'F', 'F'],
      ];
    } else if (cleanExpression === 'p | q') {
      data.headers = ['p', 'q', 'p | q'];
      data.rows = [
        ['T', 'T', 'T'],
        ['T', 'F', 'T'],
        ['F', 'T', 'T'],
        ['F', 'F', 'F'],
      ];
    } else if (cleanExpression === '!p') {
      data.headers = ['p', '!p'];
      data.rows = [
        ['T', 'F'],
        ['F', 'T'],
      ];
    } else {
      alert(`Ekspresi "${cleanExpression}" belum didukung oleh generator minimal ini.`);
      return;
    }

    setTableData(data);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>Dashboard Kalkulator Logika</div>

      <input
        type="text"
        style={styles.inputDisplay}
        value={expression}
        readOnly // Input hanya melalui keyboard virtual
        placeholder="Gunakan keyboard di bawah untuk memasukkan ekspresi..."
      />

      <div style={styles.keyboard}>
        {variables.map((v) => (
          <button
            key={v}
            style={styles.key}
            onClick={() => handleKeyClick(v)}
          >
            {v}
          </button>
        ))}
        {symbols.map((s) => (
          <button
            key={s}
            style={{ ...styles.key, ...styles.keySymbol }}
            onClick={() => handleKeyClick(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={styles.buttonContainer}>
        <button
          style={{ ...styles.button, backgroundColor: '#28a745' }}
          onClick={handleGenerate}
        >
          Generate Table
        </button>
        <button
          style={{ ...styles.button, backgroundColor: '#dc3545' }}
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {/* Area Output Tabel */}
      {tableData && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                {tableData.headers.map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={styles.td}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
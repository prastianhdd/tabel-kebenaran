export const VARIABLES = ['p', 'q', 'r', 's', 't'];

const PRECEDENCE = { '!': 5, '&': 4, '⊕': 3, '|': 2, '→': 1, '↔': 0 };

export function normalizeExpression(expression) {
  return expression.trim().replace(/<->/g, '↔').replace(/->/g, '→')
    .replace(/[∧]/g, '&').replace(/[∨V]/g, '|').replace(/[¬~]/g, '!').replace(/\s/g, '');
}

function compile(expression, variables) {
  if (!expression.trim()) throw new Error('Tulis ekspresi terlebih dahulu.');
  // ponytail: maksimal 200 karakter untuk editor lokal; naikkan bersama pengujian ekspresi panjang.
  if (expression.length > 200) throw new Error('Gunakan maksimal 200 karakter per ekspresi.');
  const tokens = normalizeExpression(expression);
  const output = [];
  const operators = [];
  let needsOperand = true;

  for (const token of tokens) {
    if (/[a-z]/.test(token)) {
      if (!variables.includes(token)) throw new Error(`Variabel “${token}” tidak aktif. Gunakan ${variables.join(', ')} atau ubah jumlah variabel.`);
      if (!needsOperand) throw new Error(`Tambahkan operator sebelum “${token}”.`);
      output.push(token);
      needsOperand = false;
    } else if (token === '(') {
      if (!needsOperand) throw new Error('Tambahkan operator sebelum kurung buka.');
      operators.push(token);
    } else if (token === ')') {
      if (needsOperand) throw new Error('Kurung tutup harus didahului variabel atau ekspresi lengkap.');
      while (operators.length && operators.at(-1) !== '(') output.push(operators.pop());
      if (operators.pop() !== '(') throw new Error('Kurung tutup belum memiliki pasangan.');
    } else if (Object.hasOwn(PRECEDENCE, token)) {
      if (token === '!') {
        if (!needsOperand) throw new Error('Letakkan negasi sebelum variabel atau kurung buka.');
        operators.push(token);
        continue;
      }
      if (needsOperand) throw new Error(`Tambahkan variabel sebelum operator “${token}”.`);
      while (operators.length && operators.at(-1) !== '(' &&
        (PRECEDENCE[operators.at(-1)] > PRECEDENCE[token] ||
          (PRECEDENCE[operators.at(-1)] === PRECEDENCE[token] && token !== '→'))) {
        output.push(operators.pop());
      }
      operators.push(token);
      needsOperand = true;
    } else {
      throw new Error(`Simbol “${token}” tidak dikenali. Gunakan tombol operator di bawah editor.`);
    }
  }

  if (needsOperand) throw new Error('Ekspresi belum lengkap. Tambahkan variabel setelah operator.');
  if (operators.includes('(')) throw new Error('Kurung buka belum ditutup. Tambahkan “)”.');
  return [...output, ...operators.reverse()];
}

export function validateExpression(expression, variableCount) {
  compile(expression, VARIABLES.slice(0, variableCount));
}

function evaluate(tokens, values) {
  const stack = [];
  for (const token of tokens) {
    if (Object.hasOwn(values, token)) {
      stack.push(values[token]);
    } else if (token === '!') {
      stack.push(!stack.pop());
    } else {
      const b = stack.pop();
      const a = stack.pop();
      switch (token) {
        case '&': stack.push(a && b); break;
        case '|': stack.push(a || b); break;
        case '⊕': stack.push(a !== b); break;
        case '→': stack.push(!a || b); break;
        case '↔': stack.push(a === b); break;
      }
    }
  }
  return stack[0];
}

export function buildTruthTable(expressions, variableCount) {
  if (!Number.isInteger(variableCount) || variableCount < 1 || variableCount > 5) {
    throw new Error('Pilih 1 hingga 5 variabel.');
  }
  if (!Array.isArray(expressions) || !expressions.length) throw new Error('Tambahkan setidaknya satu ekspresi.');
  const variables = VARIABLES.slice(0, variableCount);
  const compiled = expressions.map((expression, index) => {
    try {
      return compile(expression, variables);
    } catch (error) {
      throw new Error(`Ekspresi ${index + 1}: ${error.message}`);
    }
  });
  const rows = Array.from({ length: 2 ** variableCount }, (_, index) => {
    const values = Object.fromEntries(variables.map((variable, bit) =>
      [variable, Boolean(index & (1 << (variableCount - bit - 1)))]));
    return [...Object.values(values), ...compiled.map(tokens => evaluate(tokens, values))];
  });
  const classifications = expressions.map((_, index) => {
    const column = rows.map(row => row[variableCount + index]);
    return column.every(Boolean) ? 'Tautologi' : column.every(value => !value) ? 'Kontradiksi' : 'Kontingensi';
  });
  return { variables, expressions: [...expressions], rows, classifications };
}

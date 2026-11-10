import assert from 'node:assert/strict';
import { buildTruthTable, normalizeExpression, validateExpression } from './truthTable.js';

const column = (expression, count = 2) => buildTruthTable([expression], count).rows.map(row => row.at(-1));
assert.deepEqual(column('p & q'), [false, false, false, true]);
assert.deepEqual(column('p ∨ q'), [false, true, true, true]);
assert.deepEqual(column('p ⊕ q'), [false, true, true, false]);
assert.deepEqual(column('p → q'), [true, true, false, true]);
assert.deepEqual(column('p ↔ q'), [true, false, false, true]);
assert.deepEqual(column('¬¬p', 1), [false, true]);
assert.deepEqual(column('¬(p ∨ q)'), [true, false, false, false]);
assert.deepEqual(column('(p & q) ∨ (¬p & ¬q)'), column('p ↔ q'));
assert.deepEqual(column('p & (q ∨ r)', 3), [false, false, false, false, false, true, true, true]);
assert.deepEqual(column('p → q → r', 3), column('p → (q → r)', 3));
assert.notDeepEqual(column('p → q → r', 3), column('(p → q) → r', 3));
assert.deepEqual(column('p V q ⊕ r', 3), column('p ∨ (q ⊕ r)', 3));
assert.deepEqual(column('p & q ∨ r', 3), column('(p & q) ∨ r', 3));
assert.equal(normalizeExpression(' ~(p V q) <-> !p & !q '), '!(p|q)↔!p&!q');
assert.deepEqual(column('p -> q'), column('p → q'));
assert.deepEqual(buildTruthTable(['p ∨ ¬p', 'p & ¬p', 'p'], 1).classifications, ['Tautologi', 'Kontradiksi', 'Kontingensi']);
assert.equal(buildTruthTable(['p'], 5).rows.length, 32);
for (const expression of ['', 'p &', 'p q', '(p', 'p)', '()', 'p(q)', 'p!q', '&p', 'p||q', 'p + q', 'p2', 'r', ')p(', 'p & (q ∨)']) {
  assert.throws(() => validateExpression(expression, 2), undefined, expression);
}
assert.throws(() => validateExpression('!'.repeat(201) + 'p', 2));
assert.throws(() => buildTruthTable([], 2));
for (const count of [0, 6, 1.5, '2']) assert.throws(() => buildTruthTable(['p'], count));
console.log('Lulus: operator, prioritas, kurung, alias, klasifikasi, dan validasi ekspresi.');

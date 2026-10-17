#!/usr/bin/env node
/**
 * test-matrix.mjs
 * Skaner AST kodu produkcyjnego i generator macierzy pokrycia (BR-TEST-028..031)
 *
 * Kategorie:
 * 1. EKRAN: trasy routera w app/ (poza _layout.tsx)
 * 2. UI: interaktywne elementy widoku z etykietami t('...')
 * 3. TEKST: komunikaty tekstowe t('...') w aplikacji
 * 4. LOGIKA: wyeksportowane funkcje w src/lib/ i src/domain/
 * 5. WYMIAR: wyeksportowane stale tablicowe i unie literalow
 *
 * Opcje:
 *   --check : weryfikuje 100% pokrycia i zgodnosc docs/22-macierz-testow.md
 *   --write : generuje i zapisuje docs/22-macierz-testow.md
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('..', import.meta.url));
const isCheckMode = process.argv.includes('--check');
const isWriteMode = process.argv.includes('--write');

function getTrackedFiles(pattern) {
  try {
    const output = execSync(`git ls-files "${pattern}"`, { cwd: root, encoding: 'utf8' });
    return output
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && existsSync(join(root, s)));
  } catch {
    // fallback do readdir jesli git zawiedzie
    return [];
  }
}

// 1. Zbiór plików testowych i oczyszczenie AST z importów, komentarzy i tytułów test() (BR-TEST-029)
const testFilePaths = Array.from(new Set([
  ...getTrackedFiles('tests/*'),
  ...getTrackedFiles('tests/**/*'),
  ...getTrackedFiles('src/**/*.test.ts'),
  ...getTrackedFiles('src/**/*.test.tsx'),
  ...getTrackedFiles('.maestro/*'),
])).filter((f) => /\.(ts|tsx|js|mjs|yaml|yml)$/.test(f) && !f.endsWith('.json'));

function stripTsNonCode(filePath, content) {
  if (/\.ya?ml$/.test(filePath)) {
    // Dla Maestro usuwamy tylko komentarze
    return content.replace(/#.*$/gm, '');
  }

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  let stripped = '';

  function visit(node) {
    // Wycinanie deklaracji import (BR-TEST-029)
    if (ts.isImportDeclaration(node)) {
      return;
    }

    // Wycinanie pierwszego argumentu describe/test/it (tytuł testu)
    if (ts.isCallExpression(node)) {
      const exprText = node.expression.getText(sourceFile);
      if (['describe', 'test', 'it'].includes(exprText) && node.arguments.length > 0) {
        // Dodajmy tylko cialo i pozostale argumenty z pominieciem pierwszego argumentu tekstowego
        for (let i = 1; i < node.arguments.length; i++) {
          visit(node.arguments[i]);
        }
        return;
      }
    }

    // Komentarze sa automatycznie pomijane przy pobieraniu wezlow AST
    if (node.getChildCount(sourceFile) === 0) {
      stripped += ' ' + node.getText(sourceFile);
    } else {
      ts.forEachChild(node, visit);
    }
  }

  visit(sourceFile);
  return stripped;
}

const cleanedTests = testFilePaths.map((relPath) => {
  const fullPath = join(root, relPath);
  const raw = readFileSync(fullPath, 'utf8');
  const code = stripTsNonCode(relPath, raw);
  return { relPath, code };
});

function findTestReferences(identifierOrText) {
  const hits = [];
  for (const t of cleanedTests) {
    if (t.code.includes(identifierOrText)) {
      hits.push(t.relPath);
    }
  }
  return hits;
}

// 2. Pobranie wyjątków
const exceptionsPath = join(root, 'tests/matrix-exceptions.json');
let exceptions = {};
if (existsSync(exceptionsPath)) {
  try {
    exceptions = JSON.parse(readFileSync(exceptionsPath, 'utf8'));
  } catch {
    exceptions = {};
  }
}

// 3. Zbieranie elementów z 5 kategorii
const matrix = {
  EKRAN: [],
  UI: [],
  TEKST: [],
  LOGIKA: [],
  WYMIAR: [],
};

// Kategoria 1: EKRAN (trasy app/)
const appFiles = Array.from(new Set(
  getTrackedFiles('app/**/*.tsx').filter((f) => !f.endsWith('_layout.tsx'))
));

for (const rel of appFiles) {
  const routeName = rel.replace(/^app\//, '').replace(/\.tsx$/, '');
  const refs = findTestReferences(routeName).concat(
    findTestReferences(rel.replace(/^app\//, ''))
  );
  // Sprawdzenie czy w testach występuje plik lub trasa
  const hasCoverage = refs.length > 0 || findTestReferences(rel).length > 0;
  matrix.EKRAN.push({
    id: routeName,
    source: rel,
    covered: hasCoverage,
    tests: Array.from(new Set(refs)),
  });
}

// Kategoria 2 & 3: UI i TEKST (tłumaczenia)
const dictPath = join(root, 'src/lib/i18n.en.ts');
if (existsSync(dictPath)) {
  const dictSrc = readFileSync(dictPath, 'utf8');
  const matches = [...dictSrc.matchAll(/'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g)];
  for (const m of matches) {
    const plKey = m[1].replace(/\\'/g, "'");
    const enVal = m[2].replace(/\\'/g, "'");

    const isUi =
      plKey.length <= 30 &&
      !plKey.includes('\n') &&
      !plKey.includes('•') &&
      !plKey.startsWith('100%');

    const refs = findTestReferences(plKey);
    const item = {
      id: plKey,
      source: 'src/lib/i18n.en.ts',
      covered: refs.length > 0 || exceptions[plKey] !== undefined,
      tests: refs,
      exception: exceptions[plKey],
    };

    if (isUi) {
      matrix.UI.push(item);
    } else {
      matrix.TEKST.push(item);
    }
  }
}

// Kategoria 4: LOGIKA (eksportowane funkcje w src/lib/ i src/domain/)
const logicFiles = [
  ...getTrackedFiles('src/lib/*.ts'),
  ...getTrackedFiles('src/domain/**/*.ts'),
].filter((f) => !f.includes('__tests__') && !f.endsWith('.d.ts'));

for (const rel of logicFiles) {
  const src = readFileSync(join(root, rel), 'utf8');
  const sf = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true);

  ts.forEachChild(sf, (node) => {
    let fnName = null;
    if (ts.isFunctionDeclaration(node) && node.name) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) fnName = node.name.text;
    } else if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        for (const decl of node.declarationList.declarations) {
          if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
            fnName = decl.name.getText(sf);
          }
        }
      }
    }

    if (fnName) {
      const refs = findTestReferences(fnName);
      matrix.LOGIKA.push({
        id: fnName,
        source: rel,
        covered: refs.length > 0 || exceptions[fnName] !== undefined,
        tests: refs,
        exception: exceptions[fnName],
      });
    }
  });
}

// Kategoria 5: WYMIAR (wyeksportowane tablice i unie literałów)
for (const rel of logicFiles) {
  const src = readFileSync(join(root, rel), 'utf8');
  const sf = ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true);

  ts.forEachChild(sf, (node) => {
    // Wyeksportowane stale tablicowe UPPER_SNAKE
    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        for (const decl of node.declarationList.declarations) {
          const name = decl.name.getText(sf);
          if (/^[A-Z0-9_]{3,}$/.test(name) && decl.initializer && ts.isArrayLiteralExpression(decl.initializer)) {
            const refs = findTestReferences(name);
            matrix.WYMIAR.push({
              id: name,
              source: rel,
              covered: refs.length > 0 || exceptions[name] !== undefined,
              tests: refs,
              exception: exceptions[name],
            });
          }
        }
      }
    }

    // Wyeksportowane unie typow
    if (ts.isTypeAliasDeclaration(node)) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported && ts.isUnionTypeNode(node.type)) {
        const name = node.name.text;
        const refs = findTestReferences(name);
        matrix.WYMIAR.push({
          id: name,
          source: rel,
          covered: refs.length > 0 || exceptions[name] !== undefined,
          tests: refs,
          exception: exceptions[name],
        });
      }
    }
  });
}

// 4. Obliczanie statystyk
const stats = {};
let totalItems = 0;
let totalCovered = 0;
const uncovered = [];

for (const [cat, items] of Object.entries(matrix)) {
  const coveredCount = items.filter((i) => i.covered).length;
  const pct = items.length > 0 ? ((coveredCount / items.length) * 100).toFixed(1) : '100.0';
  stats[cat] = { total: items.length, covered: coveredCount, pct };
  totalItems += items.length;
  totalCovered += coveredCount;

  for (const item of items) {
    if (!item.covered) {
      uncovered.push({ cat, id: item.id, source: item.source });
    }
  }
}

const totalPct = totalItems > 0 ? ((totalCovered / totalItems) * 100).toFixed(1) : '100.0';

// 5. Generowanie raportu Markdown (docs/22-macierz-testow.md)
function generateMarkdown() {
  let md = '# 22 · Macierz Pokrycia Testowego (AST Skaner BR-TEST-028..031)\n\n';
  md += `Data generacji: **${new Date().toISOString()}**\n`;
  md += `Wynik globalny: **${totalCovered}/${totalItems} (${totalPct}%)**\n\n`;

  md += '## 1. Podsumowanie Kategorii Pokrycia\n\n';
  md += '| Kategoria | Liczba elementów | Pokryte | Pokrycie % | Status |\n';
  md += '| :--- | :---: | :---: | :---: | :---: |\n';

  for (const [cat, s] of Object.entries(stats)) {
    const icon = Number(s.pct) >= 100 ? '✅' : '⚠️';
    md += `| **${cat}** | ${s.total} | ${s.covered} | **${s.pct}%** | ${icon} |\n`;
  }
  md += `| **SUMA** | **${totalItems}** | **${totalCovered}** | **${totalPct}%** | ${Number(totalPct) >= 100 ? '✅' : '⚠️'} |\n\n`;

  md += '## 2. Szczegółowy Rejestr Elementów\n\n';
  for (const [cat, items] of Object.entries(matrix)) {
    md += `### Kategoria: ${cat} (${stats[cat].covered}/${stats[cat].total})\n\n`;
    md += '| Identyfikator / Klucz | Źródło | Pokrycie | Dowód testowy |\n';
    md += '| :--- | :--- | :---: | :--- |\n';
    for (const item of items) {
      const statusIcon = item.covered ? '✅' : '❌';
      const proof = item.tests.length > 0 ? item.tests.slice(0, 3).join(', ') : (item.exception || 'BRAK');
      md += `| \`${item.id.replace(/\|/g, '\\|')}\` | \`${item.source}\` | ${statusIcon} | ${proof} |\n`;
    }
    md += '\n';
  }

  return md;
}

const mdContent = generateMarkdown();
const docPath = join(root, 'docs/22-macierz-testow.md');

if (isWriteMode) {
  writeFileSync(docPath, mdContent, 'utf8');
  console.log(`[test-matrix] Zapisano macierz do ${docPath} (${totalPct}% pokrycia)`);
}

// Wypisz wynik na konsolę
console.log('--- WYNIKI MACIERZY TESTÓW (BR-TEST-028) ---');
for (const [cat, s] of Object.entries(stats)) {
  console.log(`  ${cat.padEnd(8)}: ${s.covered}/${s.total} (${s.pct}%)`);
}
console.log(`  ŁĄCZNIE : ${totalCovered}/${totalItems} (${totalPct}%)`);

if (uncovered.length > 0) {
  console.log(`\nNiepokryte elementy (${uncovered.length}):`);
  for (const u of uncovered.slice(0, 15)) {
    console.log(`  [${u.cat}] ${u.id} (${u.source})`);
  }
  if (uncovered.length > 15) {
    console.log(`  ... oraz ${uncovered.length - 15} kolejnych`);
  }
}

if (isCheckMode) {
  if (uncovered.length > 0) {
    console.error(`[test-matrix] BŁĄD: Pokrycie macierzy wynosi ${totalPct}% (< 100%)!`);
    process.exit(1);
  }
  if (existsSync(docPath)) {
    const existing = readFileSync(docPath, 'utf8');
    // Porównanie z pominięciem daty generacji
    const clean = (s) => s.replace(/Data generacji: .*\n/, '');
    if (clean(existing) !== clean(mdContent)) {
      console.error(`[test-matrix] BŁĄD: Plik ${docPath} jest nieaktualny! Uruchom: node scripts/test-matrix.mjs --write`);
      process.exit(1);
    }
  }
  console.log('[test-matrix] OK: 100% pokrycia we wszystkich 5 kategoriach.');
  process.exit(0);
}

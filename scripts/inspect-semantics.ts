import ExcelJS from 'exceljs';

function extractText(val: ExcelJS.CellValue): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val).trim();
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === 'object') {
    // RichText
    if ('richText' in val && Array.isArray((val as { richText: Array<{ text: string }> }).richText)) {
      return (val as { richText: Array<{ text: string }> }).richText.map(t => t.text).join('').trim();
    }
    // Formula
    if ('result' in val && val.result !== undefined && val.result !== null) {
      return String(val.result).trim();
    }
    if ('text' in val && typeof (val as { text: string }).text === 'string') {
      return (val as { text: string }).text.trim();
    }
  }
  return String(val).trim();
}

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('clean_NOMENCLATURE.VERSION.AOUT_.2026- (1).xlsx');

  for (const ws of wb.worksheets) {
    console.log(`\n========================================`);
    console.log(`WORKSHEET: "${ws.name}" (Rows: ${ws.rowCount})`);
    console.log(`========================================`);

    // Print rows 1 to 16 to see titles, headers, legends, notes
    for (let r = 1; r <= 16; r++) {
      const row = ws.getRow(r);
      const rowVals: string[] = [];
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const txt = extractText(cell.value);
        if (txt) {
          rowVals.push(`Col ${colNumber}: "${txt}"`);
        }
      });
      if (rowVals.length > 0) {
        console.log(`Row ${r}: ${rowVals.slice(0, 5).join(' | ')}`);
      }
    }
  }

  // Check Non Renouvelés and Retraits column mappings and distinct values
  const nonWs = wb.getWorksheet('Non Renouvelés ')!;
  const retWs = wb.getWorksheet('Retraits')!;

  console.log('\n--- Non Renouvelés Row 12 (Headers) ---');
  nonWs.getRow(12).eachCell({ includeEmpty: false }, (cell, col) => {
    console.log(`  Col ${col}: "${extractText(cell.value)}"`);
  });

  console.log('\n--- Retraits Row 11 (Headers) ---');
  retWs.getRow(11).eachCell({ includeEmpty: false }, (cell, col) => {
    console.log(`  Col ${col}: "${extractText(cell.value)}"`);
  });

  // Check distinct values across all sheets
  const stats = {
    STATUT: new Map<string, number>(),
    TYPE: new Map<string, number>(),
    P1: new Map<string, number>(),
    P2: new Map<string, number>(),
    LISTE: new Map<string, number>(),
  };

  const sheetsConfig = [
    { ws: wb.getWorksheet('Nomenclature Aout 2026')!, headerRow: 16, startRow: 17 },
    { ws: wb.getWorksheet('Non Renouvelés ')!, headerRow: 12, startRow: 13 },
    { ws: wb.getWorksheet('Retraits')!, headerRow: 11, startRow: 12 },
  ];

  for (const { ws, headerRow, startRow } of sheetsConfig) {
    const colMap = new Map<string, number>();
    ws.getRow(headerRow).eachCell({ includeEmpty: false }, (cell, col) => {
      const h = extractText(cell.value).toUpperCase();
      colMap.set(h, col);
    });

    for (let r = startRow; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const getVal = (colName: string) => {
        const c = colMap.get(colName);
        if (!c) return '';
        return extractText(row.getCell(c).value);
      };

      const s = getVal('STATUT');
      stats.STATUT.set(s, (stats.STATUT.get(s) || 0) + 1);

      const t = getVal('TYPE');
      stats.TYPE.set(t, (stats.TYPE.get(t) || 0) + 1);

      const p1 = getVal('P1');
      stats.P1.set(p1, (stats.P1.get(p1) || 0) + 1);

      const p2 = getVal('P2');
      stats.P2.set(p2, (stats.P2.get(p2) || 0) + 1);

      const l = getVal('LISTE');
      stats.LISTE.set(l, (stats.LISTE.get(l) || 0) + 1);
    }
  }

  console.log('\n--- ALL SHEETS COMBINED STATUT: ---');
  for (const [k, v] of stats.STATUT.entries()) {
    console.log(`  "${k}": ${v}`);
  }

  console.log('\n--- ALL SHEETS COMBINED TYPE: ---');
  for (const [k, v] of stats.TYPE.entries()) {
    console.log(`  "${k}": ${v}`);
  }

  console.log('\n--- ALL SHEETS COMBINED P1: ---');
  for (const [k, v] of stats.P1.entries()) {
    console.log(`  "${k}": ${v}`);
  }

  console.log('\n--- ALL SHEETS COMBINED P2: ---');
  for (const [k, v] of stats.P2.entries()) {
    console.log(`  "${k}": ${v}`);
  }

  console.log('\n--- ALL SHEETS COMBINED LISTE: ---');
  for (const [k, v] of stats.LISTE.entries()) {
    console.log(`  "${k}": ${v}`);
  }
}

main().catch(console.error);

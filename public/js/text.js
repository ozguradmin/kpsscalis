// Ders içeriğini düz metne çevirir (hoca bağlamı, sesli okuma, bilgi tabanı). Tarayıcı ve Worker ortak kullanır.
const L = ['A', 'B', 'C', 'D', 'E'];
export const strip = (s) => String(s ?? '').replace(/\*\*|==/g, '').replace(/(^|[\s(])_(.+?)_(?=[\s).,;:!?]|$)/g, '$1$2');

export function vizText(v) {
  if (!v) return '';
  switch (v.type) {
    case 'timeline': return v.items.map((i) => `${i.y}: ${strip(i.t)}${i.d ? ' (' + strip(i.d) + ')' : ''}`).join('\n');
    case 'table': return [v.head, ...v.rows].filter(Boolean).map((r) => r.map(strip).join(' | ')).join('\n');
    case 'mnemonic': return v.lines.map(([l, t]) => `${l}: ${strip(t)}`).join('\n');
    case 'compare': return v.cols.map((c) => `${strip(c.h)}: ${c.items.map(strip).join('; ')}`).join('\n');
    case 'flow': return v.items.map(strip).join(' → ');
    case 'org': return `${strip(v.root)}: ` + v.kids.map((k) => `${strip(k.h)} (${(k.items || []).map(strip).join(', ')})`).join('; ');
    case 'cards': return v.items.map(([h, t]) => `${strip(h)}: ${strip(t)}`).join('\n');
    case 'bars': case 'pie': return v.items.map((i) => `${strip(i[0])}: ${i[2] ?? i[1]}`).join(', ');
    case 'map': return (v.groups || []).map((g) => `${strip(g.label || '')}: ${g.iller.join(', ')}`).join('\n') + (v.pins ? '\n' + v.pins.map((p) => strip(p.t)).join(', ') : '');
    case 'sentence': return v.parts.map(([w, r]) => `${w} (${r})`).join(' ');
    case 'grid': return `Tablo: ${v.rows.join(', ')} × ${v.cols.join(', ')}`;
    default: return v.caption ? strip(v.caption) : '';
  }
}

export function cardText(c) {
  const out = [];
  if (c.h) out.push(strip(c.h));
  if (c.b) out.push(strip(c.b));
  for (const v of c.vizs || (c.viz ? [c.viz] : [])) { const t = vizText(v); if (t) out.push(t); if (v.caption) out.push(strip(v.caption)); }
  if (c.steps) out.push(c.steps.map((s, i) => `${i + 1}) ${strip([s.t, s.m].filter(Boolean).join(' '))}`).join('\n'));
  if (c.q) out.push(`Soru: ${strip(c.q)}${c.o ? '\n' + c.o.map((o, j) => `${L[j]}) ${strip(o)}`).join('\n') + `\nCevap: ${L[c.a]}` : ''}${c.ans ? '\nCevap: ' + strip(c.ans) : ''}`);
  if (c.ex) out.push(`Açıklama: ${strip(c.ex)}`);
  if (c.mn) out.push(`Kodlama: ${c.mn.code} — ${strip(c.mn.t)}`);
  if (c.note) out.push(`${c.note.h || 'Not'}: ${strip(c.note.t)}`);
  return out.join('\n');
}

export function questionText(q, withAnswer = true) {
  return `${strip(q.q)}\n${q.o.map((o, j) => `${L[j]}) ${strip(o)}`).join('\n')}${withAnswer ? `\nDoğru: ${L[q.a]}${q.ex ? `\nAçıklama: ${strip(q.ex)}` : ''}` : ''}`;
}


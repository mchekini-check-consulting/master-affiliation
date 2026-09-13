import React, { useMemo } from 'react';

// Rendu Markdown minimal pour les articles du blog générés par le pipeline
// SEO (titres, listes, paragraphes, gras/italique/code/liens). Le H1 initial
// est ignoré : la page affiche déjà le titre de l'article.

function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={key}>{part.slice(1, -1)}</em>;
    if (/^`[^`]+`$/.test(part)) return <code key={key}>{part.slice(1, -1)}</code>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const isInternal = link[2].startsWith('/');
      return (
        <a
          key={key}
          href={link[2]}
          {...(isInternal ? {} : { target: '_blank', rel: 'noreferrer noopener' })}>
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

/** Ligne de tableau Markdown : | cellule | cellule | */
const isTableLine = (line) => /^\s*\|.*\|\s*$/.test(line);

const splitCells = (line) => line.trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

/** Ligne séparatrice d'en-tête : | --- | :---: | */
const isSeparatorRow = (cells) => cells.length > 0 && cells.every((c) => /^:?-{3,}:?$/.test(c));

export default function MarkdownContent({ md }) {
  const blocks = useMemo(() => {
    const lines = (md ?? '').split('\n');
    const out = [];
    let list = null;
    let table = null;
    const flushList = () => {
      if (list) { out.push(list); list = null; }
    };
    const flushTable = () => {
      if (table) { out.push(table); table = null; }
    };
    for (const raw of lines) {
      const line = raw.trimEnd();

      // Tableaux : suite de lignes | ... |, la 2e (---) sépare l'en-tête
      if (isTableLine(line)) {
        flushList();
        const cells = splitCells(line);
        if (!table) table = { type: 'table', header: null, rows: [] };
        if (isSeparatorRow(cells) && table.rows.length === 1 && !table.header) {
          table.header = table.rows.pop();
        } else {
          table.rows.push(cells);
        }
        continue;
      }
      flushTable();

      const heading = /^(#{1,4})\s+(.*)$/.exec(line);
      const bullet = /^[-*]\s+(.*)$/.exec(line);
      const ordered = /^\d+[.)]\s+(.*)$/.exec(line);
      const quote = /^>\s?(.*)$/.exec(line);
      if (heading) {
        flushList();
        out.push({ type: `h${heading[1].length}`, text: heading[2] });
      } else if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
        flushList();
        out.push({ type: 'hr' });
      } else if (quote) {
        flushList();
        const previous = out.at(-1);
        if (previous?.type === 'blockquote') previous.text += `\n${quote[1]}`;
        else out.push({ type: 'blockquote', text: quote[1] });
      } else if (bullet || ordered) {
        const item = (bullet ?? ordered)[1];
        const isOrdered = Boolean(ordered);
        if (!list || list.orderedList !== isOrdered) {
          flushList();
          list = { type: 'list', orderedList: isOrdered, items: [] };
        }
        list.items.push(item);
      } else if (line.trim() === '') {
        flushList();
      } else {
        flushList();
        out.push({ type: 'p', text: line });
      }
    }
    flushList();
    flushTable();
    // Le H1 du Markdown duplique le titre de page : on l'écarte
    const firstH1 = out.findIndex((b) => b.type === 'h1');
    if (firstH1 !== -1) out.splice(firstH1, 1);
    return out;
  }, [md]);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'table') {
          return (
            <div key={i} className="table-wrapper">
              <table>
                {block.header && (
                  <thead>
                    <tr>
                      {block.header.map((cell, j) => <th key={j}>{renderInline(cell, `${i}-h${j}`)}</th>)}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {block.rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((cell, k) => <td key={k}>{renderInline(cell, `${i}-${j}-${k}`)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === 'list') {
          const Tag = block.orderedList ? 'ol' : 'ul';
          return (
            <Tag key={i}>
              {block.items.map((item, j) => <li key={j}>{renderInline(item, `${i}-${j}`)}</li>)}
            </Tag>
          );
        }
        if (block.type === 'blockquote') {
          return (
            <blockquote key={i}>
              {block.text.split('\n').map((line, j) => <p key={j}>{renderInline(line, `${i}-${j}`)}</p>)}
            </blockquote>
          );
        }
        if (block.type === 'hr') {
          return <hr key={i} />;
        }
        if (block.type === 'p') {
          return <p key={i}>{renderInline(block.text, i)}</p>;
        }
        const Tag = block.type === 'h1' ? 'h2' : block.type;
        return <Tag key={i}>{renderInline(block.text, i)}</Tag>;
      })}
    </>
  );
}

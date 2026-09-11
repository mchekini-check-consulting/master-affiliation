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

export default function MarkdownContent({ md }) {
  const blocks = useMemo(() => {
    const lines = (md ?? '').split('\n');
    const out = [];
    let list = null;
    const flushList = () => {
      if (list) { out.push(list); list = null; }
    };
    for (const raw of lines) {
      const line = raw.trimEnd();
      const heading = /^(#{1,4})\s+(.*)$/.exec(line);
      const bullet = /^[-*]\s+(.*)$/.exec(line);
      const ordered = /^\d+[.)]\s+(.*)$/.exec(line);
      if (heading) {
        flushList();
        out.push({ type: `h${heading[1].length}`, text: heading[2] });
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
    // Le H1 du Markdown duplique le titre de page : on l'écarte
    const firstH1 = out.findIndex((b) => b.type === 'h1');
    if (firstH1 !== -1) out.splice(firstH1, 1);
    return out;
  }, [md]);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'list') {
          const Tag = block.orderedList ? 'ol' : 'ul';
          return (
            <Tag key={i}>
              {block.items.map((item, j) => <li key={j}>{renderInline(item, `${i}-${j}`)}</li>)}
            </Tag>
          );
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

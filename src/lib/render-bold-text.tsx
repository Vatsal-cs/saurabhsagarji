import { InlineLink } from '@/components/ui/inline-link';

/**
 * Renders a small markdown-lite subset used in admin-editable bio text:
 * `**bold**` as <strong>, and `[label](url)` as a link (hover-previewed via
 * InlineLink). Everything else is plain text. Kept as one combined pass (not
 * bold-then-link in sequence) so the two never get confused about which one
 * owns a given `*`/`[`/`]`.
 */
export function renderBoldText(text: string): React.ReactNode {
  const pattern = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      nodes.push(<strong key={key++}>{match[1].slice(2, -2)}</strong>);
    } else if (match[2]) {
      const linkMatch = match[2].match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        nodes.push(<InlineLink key={key++} href={href} label={label} />);
      }
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

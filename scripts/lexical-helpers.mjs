// Small helpers to hand-build Lexical rich text JSON matching the exact
// shape Payload's lexicalEditor produces (verified against the existing
// "The Danna Langkawi" hotel document created through the admin UI).

export function textNode(text) {
  return { mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }
}

export function linebreak() {
  return { type: 'linebreak', version: 1 }
}

export function paragraph(text, format = 'left') {
  return {
    type: 'paragraph',
    format,
    indent: 0,
    version: 1,
    children: text ? [textNode(text)] : [],
    direction: null,
    textStyle: '',
    textFormat: 0,
  }
}

export function heading(tag, text, format = 'left') {
  return {
    tag,
    type: 'heading',
    format,
    indent: 0,
    version: 1,
    children: [textNode(text)],
    direction: null,
  }
}

// A single paragraph containing "•   line" bullets separated by <br>,
// matching the pattern already used on the live "Highlights" block.
export function bulletsParagraph(lines, format = 'start') {
  const children = []
  lines.forEach((line, i) => {
    if (i > 0) children.push(linebreak())
    children.push(textNode(`•   ${line}`))
  })
  return {
    type: 'paragraph',
    format,
    indent: 0,
    version: 1,
    children,
    direction: null,
    textStyle: '',
    textFormat: 0,
  }
}

export function richText(children) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
      direction: null,
    },
  }
}

let idCounter = 1
function genId() {
  idCounter += 1
  return `seed${Date.now().toString(16)}${idCounter.toString(16)}`
}

const defaultLink = {
  type: 'reference',
  newTab: null,
  url: null,
  label: null,
  appearance: 'default',
}

export function richTextBlock(children, blockName = null) {
  return {
    id: genId(),
    richText: richText(children),
    blockName,
    blockType: 'richTextBlock',
  }
}

export function infoBlock({ children, media, reverse = false, blockName = null }) {
  return {
    id: genId(),
    richText: richText(children),
    media,
    reverse,
    enableLink: null,
    blockName,
    blockType: 'infoBlock',
    link: { ...defaultLink },
  }
}

// Two-column Content block, e.g. heading on the left, bullet list on the right.
export function contentTwoColumn(leftChildren, rightChildren) {
  return {
    id: genId(),
    blockName: null,
    columns: [
      {
        id: genId(),
        size: 'half',
        richText: richText(leftChildren),
        enableLink: null,
        link: { ...defaultLink },
      },
      {
        id: genId(),
        size: 'half',
        richText: richText(rightChildren),
        enableLink: null,
        link: { ...defaultLink },
      },
    ],
    blockType: 'content',
  }
}

// cards: [{ title, media: imageId, description: [lexical children] }]
export function cardsBlock(cards, header = null, blockName = null) {
  return {
    id: genId(),
    blockName,
    header: header ? richText(header) : null,
    cards: cards.map((c) => ({
      id: genId(),
      title: c.title,
      media: [{ id: genId(), image: c.media }],
      description: c.description ? richText(c.description) : null,
    })),
    blockType: 'cardsBlock',
  }
}

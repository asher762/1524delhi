import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedInlineBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
  InfoBlock as InfoBlockProps,
  ContentBlock as ContentBlockProps,
  IconBlock as IconBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { InfoBlockComponent as InfoBlock } from '@/blocks/InfoBlock/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { IconBlockComponent as IconBlock } from '@/blocks/Icon/Component'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | InfoBlockProps | ContentBlockProps>
  | SerializedInlineBlockNode<IconBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  // Override paragraph: if any child would render as a block-level element,
  // use a <div> instead of <p> to prevent invalid HTML nesting hydration errors.
  // This covers: embedded blocks, nested paragraphs, lists, headings, etc.
  paragraph: ({ node, nodesToJSX }) => {
    const BLOCK_CHILD_TYPES = new Set(['block', 'paragraph', 'horizontalrule', 'list', 'listitem', 'heading', 'quote', 'table'])
    const hasBlock = node.children.some((child: any) => BLOCK_CHILD_TYPES.has(child.type))
    const children = nodesToJSX({ nodes: node.children })
    if (hasBlock) {
      return <div>{children}</div>
    }
    return <p>{children}</p>
  },
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    infoBlock: ({ node }) => <InfoBlock {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
    content: ({ node }) => <ContentBlock {...node.fields} />,
  },
  inlineBlocks: {
    icon: ({ node }) => <IconBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}

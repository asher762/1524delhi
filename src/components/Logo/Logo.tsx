import clsx from 'clsx'
import logoWhite from '../../../public/logo/white_logo_transparent.svg'
import logoBlack from '../../../public/logo/black_logo_transparent.svg'
import Image from 'next/image'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'
  const imgClass = clsx('max-w-37.5 w-auto lg:h-[42px] h-[32px]', className)

  return (
    <>
      {/* Show white logo on dark theme, hide on light */}
      <Image
        alt="1524 Logo"
        width={150}
        height={34}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx(imgClass, 'hidden [html[data-theme=dark]_&]:block')}
        src={logoWhite}
      />
      {/* Show black logo on light theme, hide on dark */}
      <Image
        alt="1524 Logo"
        width={150}
        height={34}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx(imgClass, 'block [html[data-theme=dark]_&]:hidden')}
        src={logoBlack}
      />
    </>
  )
}

import clsx from 'clsx'
import logo from '../../../public/logo/white_logo_transparent.svg'
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

  return (
    /* eslint-disable @next/next/no-img-element */
    <Image
      alt="1524 Logo"
      width={193}
      height={34}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('max-w-37.5 w-full lg:h-[48px] h-[32px]', className)}
      src={logo}
    />
  )
}

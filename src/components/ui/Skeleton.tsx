import clsx from 'clsx'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  count?: number
  className?: string
}

const Skeleton = ({ width, height, count = 1, className }: SkeletonProps) => {
  const items = Array.from({ length: count })
  return (
    <div>
      {items.map((_, i) => (
        <div
          key={i}
          className={clsx('skeleton', className)}
          style={{
            width: width ?? '100%',
            height: height ?? 12,
            marginBottom: i === count - 1 ? 0 : 8,
          }}
        />
      ))}
    </div>
  )
}

export default Skeleton


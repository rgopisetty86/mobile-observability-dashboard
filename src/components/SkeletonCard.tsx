export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-3 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 h-72 animate-pulse">
      <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="h-full w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
    </div>
  )
}

// biome-ignore lint/suspicious/noExplicitAny: args can be anything
export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timer: number | undefined

  const debounced = (...args: Parameters<T>) => {
    if (timer !== undefined) {
      window.clearTimeout(timer)
    }

    timer = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }

  debounced.cancel = () => {
    if (timer !== undefined) {
      window.clearTimeout(timer)
    }
  }

  return debounced
}

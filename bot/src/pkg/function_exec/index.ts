export const goLike = async <T>(promise: Promise<T>): Promise<[T, any]> => {
  try {
    const res = await promise
    return [res as T, null]
  } catch (error) {
    return [null as any, error]
  }
}

/** Utility to convert async generators into arrays */
export async function toArray<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const output: T[] = [];
  for await (const o of generator) output.push(o);
  return output;
}

/** Grab the first value from a async generator */
export async function toFirst<T>(generator: AsyncGenerator<T>): Promise<T> {
  const first = await generator.next();
  return first.value;
}

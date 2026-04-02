/* eslint-disable @typescript-eslint/no-explicit-any */
import z from 'zod';

export function ZRobustArray<const T extends z.ZodDiscriminatedUnion>(element: T) {
  return z
    .array(element.catch(null as any))
    .transform((val) => val.filter((item) => item !== null)) as unknown as z.ZodPipe<
    z.ZodArray<z.ZodCatch<z.ZodLazy<T>>>,
    z.ZodArray<z.ZodLazy<T>>
  >;
}

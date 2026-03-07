/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import z from 'zod';

export const ZRobustArray: <T extends z.ZodDiscriminatedUnion>(
  element: T
) => z.ZodPipe<z.ZodArray<z.ZodCatch<z.ZodLazy<T>>>> = (element) =>
  // @ts-ignore
  z.array(element.catch(null as any)).transform((val) => val.filter((item) => item !== null));

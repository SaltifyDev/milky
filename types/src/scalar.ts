import { z } from 'zod';

export const ZInt32 = z.number().int().positive().meta({ scalarType: 'int32' });
export const ZInt64 = z.number().int().positive().meta({ scalarType: 'int64' });
export const ZBoolean = z.boolean().meta({ scalarType: 'boolean' });
export const ZString = z.string().meta({ scalarType: 'string' });

export const ZUin = ZInt64.min(10001).max(4294967295);

export const ZInt32WithDefault = (defaultValue: number) => z.number()
  .int()
  .positive()
  .nullish()
  .default(defaultValue)
  .transform<number>((v) => v ?? defaultValue)
  .meta({ scalarType: 'int32' });

export const ZInt64WithDefault = (defaultValue: number) => z.number()
  .int()
  .positive()
  .nullish()
  .default(defaultValue)
  .transform<number>((v) => v ?? defaultValue)
  .meta({ scalarType: 'int64' });

export const ZBooleanWithDefault = (defaultValue: boolean) => z.boolean()
  .nullish()
  .default(defaultValue)
  .transform<boolean>((v) => v ?? defaultValue)
  .meta({ scalarType: 'boolean' });

export const ZStringWithDefault = (defaultValue: string) => z.string()
  .nullish()
  .default(defaultValue)
  .transform<string>((v) => v ?? defaultValue)
  .meta({ scalarType: 'string' });

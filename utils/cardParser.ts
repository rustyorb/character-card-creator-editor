
import * as Cards from 'character-card-utils';

const areV1FieldsInSyncWithV2Fields = (card: Cards.BackfilledV2): boolean =>
  card.name === card.data.name &&
  card.description === card.data.description &&
  card.personality === card.data.personality &&
  card.scenario === card.data.scenario &&
  card.first_mes === card.data.first_mes &&
  card.mes_example === card.data.mes_example;

export type V2ValidationResult =
  | { type: 'V2'; data: Cards.V2 }
  | { type: 'BackfilledV2'; inSync: boolean; data: Cards.BackfilledV2 }
  | { type: 'InvalidCard'; error: any }
  | { type: 'InvalidJson'; error: any }
  | { type: 'Empty' };

export const parseJsonToV2Card = (input: string): V2ValidationResult => {
  if (!input.trim()) return { type: 'Empty' };
  try {
    const inputAsJson = JSON.parse(input);
    const v2WithBackfill = Cards.v1.merge(Cards.v2).safeParse(inputAsJson);
    if (v2WithBackfill.success)
      return {
        type: 'BackfilledV2',
        inSync: areV1FieldsInSyncWithV2Fields(inputAsJson),
        data: v2WithBackfill.data,
      };
    const v2 = Cards.v2.safeParse(inputAsJson);
    if (v2.success) return { type: 'V2', data: v2.data };
    return { type: 'InvalidCard', error: v2.error };
  } catch (error) {
    return { type: 'InvalidJson' as const, error };
  }
};

export type V1ValidationResult =
  | { type: 'V1'; data: Cards.V1 }
  | { type: 'BackfilledV2' }
  | { type: 'V2' }
  | { type: 'InvalidCard'; error: any }
  | { type: 'InvalidJson'; error: any }
  | { type: 'Empty' };

export const parseJsonToV1Card = (input: string): V1ValidationResult => {
  if (!input.trim()) return { type: 'Empty' };
  try {
    const inputAsJson = JSON.parse(input);
    const v2WithBackfill = Cards.v1.merge(Cards.v2).safeParse(inputAsJson);
    if (v2WithBackfill.success) return { type: 'BackfilledV2' };
    const v2 = Cards.v2.safeParse(inputAsJson);
    if (v2.success) return { type: 'V2' };
    const v1 = Cards.v1.safeParse(inputAsJson);
    if (v1.success) return { type: 'V1', data: v1.data };
    // V1 is a subset of V2, so Zod's V2 error is more informative
    return { type: 'InvalidCard', error: v2.error ?? v1.error };
  } catch (error) {
    return { type: 'InvalidJson' as const, error };
  }
};

export const stringify = (json: any): string => JSON.stringify(json, null, 2);

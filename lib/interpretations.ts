import data from './transitInterpretations.json';

const interpretations: Record<string, string> = data as Record<string, string>;

export function getInterpretation(key: string): string {
  return interpretations[key] ?? '';
}

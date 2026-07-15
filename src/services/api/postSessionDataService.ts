import type { SessionExportData } from '../../types';

export async function postSessionData(
  data: SessionExportData,
  score: number
): Promise<{ ok: boolean; error?: string }> {
  void data;
  void score;
  return { ok: true };
}

import type { SessionExportData } from '../../types';
import { SESSION_DIFFICULTY_API_VALUE, type MenuDifficultyId } from '../../utils/constants';
import { clearGameSamplesAfterSubmit } from '../vfc';
import { formatSessionData } from './formatSessionDataService';
import { postSessionData } from './postSessionDataService';

export type SubmitSessionExportParams = {
  score: number;
  sessionWithSensor: boolean;
  sessionCompleted: boolean;
  elapsedTimeMs: number;
  sessionLimit: number;
  cyclesPerMinute: number;
  sessionDifficulty: MenuDifficultyId;
  fullSensorExportEligible?: boolean;
};

let sessionExportSucceeded = false;

export const resetSessionExportGate = (): void => {
  sessionExportSucceeded = false;
};

export const isSessionExportSettled = (): boolean => sessionExportSucceeded;

export async function submitSessionExport(params: SubmitSessionExportParams): Promise<boolean> {
  if (sessionExportSucceeded) return true;

  const difficultLevel = SESSION_DIFFICULTY_API_VALUE[params.sessionDifficulty];
  const eligible = params.fullSensorExportEligible ?? params.sessionWithSensor;

  const baseParams = {
    sessionLimit: params.sessionLimit,
    sessionCompleted: params.sessionCompleted,
    elapsedTimeMs: params.elapsedTimeMs,
    difficult_level: difficultLevel
  };

  if (eligible) {
    const sensorPayload = formatSessionData({
      withSensor: true,
      cyclesPerMinute: params.cyclesPerMinute,
      ...baseParams
    });

    if (sensorPayload) {
      const res = await postSessionData(sensorPayload, params.score);
      if (res.ok) {
        sessionExportSucceeded = true;
        clearGameSamplesAfterSubmit();
      }
      return res.ok;
    }

    return false;
  }

  const minimalPayload: SessionExportData = formatSessionData({
    withSensor: false,
    ...baseParams
  });

  const res = await postSessionData(minimalPayload, params.score);
  if (res.ok) {
    sessionExportSucceeded = true;
  }
  return res.ok;
}

import { type QuestionnaireFormData, EMPTY_FORM } from "@/types/questionnaire";

const STORAGE_KEY = "ascent_questionnaire";

export function saveQuestionnaireData(data: QuestionnaireFormData): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadQuestionnaireData(): QuestionnaireFormData {
  if (typeof window === "undefined") return EMPTY_FORM;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return EMPTY_FORM;
  try {
    return JSON.parse(raw) as QuestionnaireFormData;
  } catch {
    return EMPTY_FORM;
  }
}

export function clearQuestionnaireData(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function hasQuestionnaireData(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) !== null;
}

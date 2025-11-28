import { useTranslation } from 'react-i18next';

export const NAMESPACE = 'file-previewer-pdfjs';

export function useT() {
  const { t } = useTranslation(NAMESPACE);
  return t;
}

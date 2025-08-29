import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <select
      value={i18n.resolvedLanguage}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="form-select form-select-sm"
      style={{ width: 140 }}
      aria-label="Language"
    >
      <option value="en">English</option>
      <option value="fr">Français</option>
    </select>
  );
}

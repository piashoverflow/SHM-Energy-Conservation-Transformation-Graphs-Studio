import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Language, ModuleId } from '../types/physics';
import { TranslationDict } from '../i18n/translations';

interface TopNavBarProps {
  activeModule: ModuleId;
  language: Language;
  t: TranslationDict;
  onSelectModule: (id: ModuleId) => void;
  onToggleLanguage: (lang: Language) => void;
  onResetAll: () => void;
}

const MODULE_ORDER: ModuleId[] = ['tanks', 'ex-graph', 'et-graph'];

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeModule,
  language,
  t,
  onSelectModule,
  onToggleLanguage,
  onResetAll,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-200 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-2.5 flex flex-wrap xl:flex-nowrap items-center justify-between gap-3">
        {/* Left: Studio Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M2 12h3l2-6 3 12 3-12 2 6h7" />
            </svg>
          </div>
          <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-950 truncate">
            {t.studioTitle}
          </h1>
        </div>

        {/* Center: 3 Interactive Lab Mode Tabs */}
        <nav
          aria-label="Lab Modules"
          className="flex items-center gap-1 p-1 bg-sky-50 border border-sky-200 rounded-xl overflow-x-auto max-w-full"
        >
          {MODULE_ORDER.map((id) => {
            const isActive = activeModule === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectModule(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
                }`}
              >
                {t.tabs[id].short}
              </button>
            );
          })}
        </nav>

        {/* Right: Language Switcher, Reset Button & Brand Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label="Language Switcher"
            className="flex items-center p-0.5 bg-slate-100 border border-sky-200 rounded-lg"
          >
            <button
              type="button"
              onClick={() => onToggleLanguage('bn')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                language === 'bn'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => onToggleLanguage('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-200 bg-white hover:bg-sky-50 text-xs font-bold text-slate-800 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>{t.controls.resetAll}</span>
          </button>

          <span className="bg-rose-50 border border-rose-300 text-rose-600 font-extrabold px-3 py-1 rounded-full text-sm whitespace-nowrap shrink-0">
            উদ্ভাস
          </span>
        </div>
      </div>
    </header>
  );
};

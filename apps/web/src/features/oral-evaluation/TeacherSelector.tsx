import React from 'react';

export type AvatarIdentity = 'PROF_ELENA' | 'PROF_DAVID';

interface TeacherSelectorProps {
  selectedAvatar: AvatarIdentity;
  onSelectAvatar: (avatar: AvatarIdentity) => void;
  disabled?: boolean;
}

export const TeacherSelector: React.FC<TeacherSelectorProps> = ({
  selectedAvatar,
  onSelectAvatar,
  disabled = false,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Docente Evaluador
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Ready Player Me 3D
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Opción Prof. Elena */}
        <button
          type="button"
          data-testid="select-teacher-elena"
          disabled={disabled}
          onClick={() => onSelectAvatar('PROF_ELENA')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedAvatar === 'PROF_ELENA'
              ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500 shadow-lg shadow-indigo-500/20'
              : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/30">
              E
            </div>
            <div>
              <p className="text-sm font-bold text-white">Prof. Elena</p>
              <p className="text-[11px] text-slate-400">Voz Femenina</p>
            </div>
          </div>
        </button>

        {/* Opción Prof. David */}
        <button
          type="button"
          data-testid="select-teacher-david"
          disabled={disabled}
          onClick={() => onSelectAvatar('PROF_DAVID')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedAvatar === 'PROF_DAVID'
              ? 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
              D
            </div>
            <div>
              <p className="text-sm font-bold text-white">Prof. David</p>
              <p className="text-[11px] text-slate-400">Voz Masculina</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

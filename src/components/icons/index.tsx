/**
 * Icon components - Stroke-based SVG icons for Memory Gym
 * All icons use currentColor, 24x24 viewBox, 2px stroke
 */

interface IconProps {
  className?: string;
  size?: number;
}

const defaultProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  strokeWidth: 2,
  stroke: 'currentColor',
};

// ============ NAVIGATION ICONS ============

export function HomeIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

export function BrainIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-2.558.426a6.676 6.676 0 01-1.577.187H12m0 0h-2c-.94 0-1.864-.134-2.74-.387l-2.558-.426c-1.717-.293-2.299-2.379-1.067-3.61L5 14.5"
      />
    </svg>
  );
}

export function ChartIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );
}

export function SettingsIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// ============ GAMIFICATION ICONS ============

export function FlameIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z"
      />
    </svg>
  );
}

export function TrophyIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m3.044-1.35a6.726 6.726 0 01-2.748 1.35m0 0a6.772 6.772 0 01-3.044 0"
      />
    </svg>
  );
}

export function StarIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

export function TargetIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ZapIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );
}

// ============ MODULE ICONS ============

export function GridIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  );
}

export function VolumeIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
      />
    </svg>
  );
}

export function EyeIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function RewindIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z"
      />
    </svg>
  );
}

// ============ ACTION ICONS ============

export function PlayIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
      />
    </svg>
  );
}

export function ChevronLeftIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

export function ChevronRightIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export function CheckIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export function XIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function ArrowRightIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

export function RefreshIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

export function UndoIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
      />
    </svg>
  );
}

export function EraserIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.636 17.657l9.9-9.9a2 2 0 012.828 0l1.414 1.414a2 2 0 010 2.828l-9.9 9.9a2 2 0 01-2.828 0l-1.414-1.414a2 2 0 010-2.828zM13 11l3 3M21 21H9"
      />
    </svg>
  );
}

export function PencilIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
      />
    </svg>
  );
}

export function PauseIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25v13.5m-7.5-13.5v13.5"
      />
    </svg>
  );
}

export function ClockIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function SudokuIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      {/* 3x3 grid representing Sudoku */}
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="3" x2="9" y2="21" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="15" y1="3" x2="15" y2="21" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" y1="9" x2="21" y2="9" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" y1="15" x2="21" y2="15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LinkChainIcon({ className, size = 24 }: IconProps): JSX.Element {
  return (
    <svg {...defaultProps} width={size} height={size} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    </svg>
  );
}

// ============ APP LOGO ============

export function AppLogo({ className, size = 32 }: IconProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect width="32" height="32" rx="8" fill="#0F172A" />
      {/* Neural network nodes */}
      <g fill="url(#logoGrad)">
        <circle cx="16" cy="16" r="4" />
        <circle cx="8" cy="8" r="2.5" />
        <circle cx="24" cy="8" r="2.5" />
        <circle cx="8" cy="24" r="2.5" />
        <circle cx="24" cy="24" r="2.5" />
      </g>
      {/* Connections */}
      <g stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
        <line x1="13" y1="13" x2="10" y2="10" />
        <line x1="19" y1="13" x2="22" y2="10" />
        <line x1="13" y1="19" x2="10" y2="22" />
        <line x1="19" y1="19" x2="22" y2="22" />
      </g>
    </svg>
  );
}

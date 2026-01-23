interface ImageViewerProps {
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
  timeRemaining: number; // seconds - managed by parent hook
  totalTime: number; // seconds
}

export function ImageViewer({
  imageUrl,
  photographer,
  photographerUrl,
  timeRemaining,
  totalTime,
}: ImageViewerProps): JSX.Element {
  // Timer is managed by parent hook - we just display the time
  // Calculate SVG circle properties
  const circleSize = 60;
  const strokeWidth = 4;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeRemaining / totalTime;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className="relative w-full h-full min-h-screen bg-black"
      role="img"
      aria-label={`Image by ${photographer}. ${timeRemaining} seconds remaining to memorize.`}
    >
      {/* Full-screen image */}
      <img
        src={imageUrl}
        alt={`Photo by ${photographer}`}
        className="w-full h-full object-cover"
      />

      {/* Countdown timer - top right */}
      <div
        className="absolute top-4 right-4 flex items-center justify-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <svg
          width={circleSize}
          height={circleSize}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="rgba(0, 0, 0, 0.5)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        {/* Time display in center */}
        <span
          className="absolute text-white font-bold text-lg tabular-nums"
          aria-label={`${timeRemaining} seconds remaining`}
        >
          {timeRemaining}
        </span>
      </div>

      {/* Photographer attribution - bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white/70 text-sm">
          Photo by{' '}
          <a
            href={photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/90 underline hover:text-white transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
          >
            {photographer}
          </a>
        </p>
      </div>
    </div>
  );
}

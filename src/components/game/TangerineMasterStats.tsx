"use client";


interface TangerineMasterStatsProps {
  survivalTime: number;
  highScore: number;
}

export const TangerineMasterStats = ({ 
  survivalTime, 
  highScore
}: TangerineMasterStatsProps) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* 생존 시간 */}
      <div className="bg-card border border-border rounded-lg p-4 text-center">
        <div className="text-sm text-muted-foreground mb-1">생존 시간</div>
        <div className="text-xl font-semibold">
          {formatTime(survivalTime)}
        </div>
      </div>

      {/* 최고 기록 */}
      <div className="bg-card border border-border rounded-lg p-4 text-center">
        <div className="text-sm text-muted-foreground mb-1">최고 기록</div>
        <div className="text-xl font-semibold">
          {formatTime(highScore)}
        </div>
      </div>
    </div>
  );
}; 
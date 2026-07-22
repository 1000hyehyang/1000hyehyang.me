export const TrafficLights = () => {
  const colors = [
    "var(--terminal-dot-red)",
    "var(--terminal-dot-yellow)",
    "var(--terminal-dot-green)",
  ] as const;
  
  return (
    <div className="flex items-center gap-2 border-b border-terminal-border bg-terminal-header px-4 py-3">
      <div className="flex gap-1.5">
        {colors.map((color, index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
};

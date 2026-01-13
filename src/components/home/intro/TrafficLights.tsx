export const TrafficLights = () => {
  const colors = ["#ff5f57", "#ffbd2e", "#28ca42"] as const;
  
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border-b border-zinc-300 dark:border-zinc-800/50">
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

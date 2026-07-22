interface TerminalContentProps {
  text: string;
}

export const TerminalContent = ({ text }: TerminalContentProps) => (
  <div className="px-6 py-6 font-mono">
    <div className="flex items-start gap-3 w-full">
      <span className="mt-0.5 flex-shrink-0 text-sm font-bold text-brand">
        $
      </span>
      <div className="flex-1">
        <p className="text-sm leading-relaxed text-terminal-foreground">
          {text}
        </p>
      </div>
    </div>
  </div>
);

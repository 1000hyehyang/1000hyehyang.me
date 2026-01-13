import { TerminalCursor } from "./TerminalCursor";

interface TerminalContentProps {
  text: string;
}

export const TerminalContent = ({ text }: TerminalContentProps) => (
  <div className="px-6 py-6 font-mono">
    <div className="flex items-start gap-3 w-full">
      <span className="text-orange-300 text-sm font-bold mt-0.5 flex-shrink-0">
        $
      </span>
      <div className="flex-1">
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm">
          {text}
          <TerminalCursor />
        </p>
      </div>
    </div>
  </div>
);

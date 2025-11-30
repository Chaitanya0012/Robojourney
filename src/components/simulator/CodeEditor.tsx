import { useMemo } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export const CodeEditor = ({ value, onChange, readOnly = false, placeholder }: CodeEditorProps) => {
  const lineNumbers = useMemo(() => value.split("\n").map((_, index) => index + 1).join("\n"), [value]);

  return (
    <div className="relative h-[520px] rounded-md border border-border/50 bg-background/95 shadow-glow-cyan/20 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-12 select-none bg-muted/40 px-2 py-3 text-xs font-mono text-muted-foreground/80 border-r border-border/50">
        <pre className="whitespace-pre leading-6">{lineNumbers}</pre>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        placeholder={placeholder}
        className="absolute inset-0 w-full h-full resize-none border-0 bg-transparent pl-14 pr-4 py-3 font-mono text-sm leading-6 text-foreground focus:outline-none focus:ring-0"
      />
    </div>
  );
};

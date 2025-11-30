import { ChangeEvent } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  language?: string;
}

export const CodeEditor = ({ value, onChange, readOnly = false }: CodeEditorProps) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="h-[450px] rounded-md overflow-hidden border border-border/50 bg-background/95 shadow-glow-cyan/20">
      <textarea
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground outline-none"
        spellCheck={false}
      />
    </div>
  );
};

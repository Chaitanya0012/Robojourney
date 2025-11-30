interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export const CodeEditor = ({ value, onChange, readOnly = false, language = "javascript" }: CodeEditorProps) => {
  return (
    <div className="h-[450px] border border-border/50 rounded-md overflow-hidden bg-background/95 backdrop-blur shadow-glow-cyan/20">
      <label className="sr-only" htmlFor="code-editor">
        {language} code editor
      </label>
      <textarea
        id="code-editor"
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className="h-full w-full resize-none bg-background text-foreground font-mono text-sm p-4 outline-none border-0 focus:ring-0"
        spellCheck={false}
      />
    </div>
  );
};

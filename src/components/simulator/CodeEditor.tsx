import { Textarea } from "@/components/ui/textarea";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  language?: string;
}

export const CodeEditor = ({ value, onChange, readOnly = false, language = "javascript" }: CodeEditorProps) => {
  return (
    <div className="h-[450px] border border-border/50 rounded-md overflow-hidden bg-background/95 backdrop-blur shadow-glow-cyan/20">
      <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-b border-border/40">
        <span className="font-semibold">{language.toUpperCase()} editor</span>
        {readOnly && <span className="text-[10px]">Read only</span>}
      </div>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        className="h-[calc(100%-40px)] resize-none font-mono text-sm leading-6 bg-transparent border-0 rounded-none focus-visible:ring-0"
      />
    </div>
  );
};

import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  language?: string;
}

export const CodeEditor = ({ value, onChange, readOnly = false, language = "javascript" }: CodeEditorProps) => {
  const { theme } = useTheme();

  return (
    <div className="h-[450px] border border-border/50 rounded-md overflow-hidden bg-background/95 backdrop-blur shadow-glow-cyan/20">
      <Editor
        height="100%"
        defaultLanguage={language}
        value={value}
        onChange={(value) => onChange(value || "")}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
          fontLigatures: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
};

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-bg p-4 font-mono text-sm leading-relaxed text-ink">
      <code>{code}</code>
    </pre>
  );
}

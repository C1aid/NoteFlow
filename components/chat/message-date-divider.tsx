type MessageDateDividerProps = {
  label: string;
};

export function MessageDateDivider({ label }: MessageDateDividerProps) {
  return (
    <div className="relative my-5 flex items-center px-2">
      <div className="h-px flex-1 bg-white/10" />
      <span className="mx-3 shrink-0 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-medium text-gray-300">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

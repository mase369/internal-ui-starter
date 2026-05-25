type Props = {
  title: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export function SplitView({ title, sidebar, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <h1 className="text-lg font-bold text-brand-blue">{title}</h1>
        </div>
      </header>
      <div className="flex">
        <aside className="w-60 shrink-0 min-h-[calc(100vh-57px)] bg-white border-r border-slate-200 p-4">
          {sidebar}
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

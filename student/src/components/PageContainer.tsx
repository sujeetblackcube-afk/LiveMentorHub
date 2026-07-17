interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

export default function PageContainer({ title, children }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
      <div className="h-20 md:h-0" />
    </div>
  );
}

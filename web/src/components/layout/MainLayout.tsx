import React from 'react';

interface MainLayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function MainLayout({ header, sidebar, children }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {header}
      <div className="flex-1 flex overflow-hidden">
        {sidebar}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

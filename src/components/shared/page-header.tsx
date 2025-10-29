
import type { FC, ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export const PageHeader: FC<PageHeaderProps> = ({ title, description, children }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
};

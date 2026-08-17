import { type HTMLAttributes, type ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    noPadding?: boolean;
}

export function Card({ children, noPadding = false, className = '', ...props }: CardProps) {
    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${noPadding ? '' : 'p-4 sm:p-6'} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

// Usamos forwardRef para permitir que bibliotecas como react-hook-form acessem a referência do DOM
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', id, ...props }, ref) => {

        // Gerar um ID aleatório se não for passado
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

        return (
            <div className={`flex flex-col w-full ${className}`}>
                <label htmlFor={inputId} className="mb-1 text-sm font-medium text-gray-700">
                    {label}
                </label>
                <input
                    id={inputId}
                    ref={ref}
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors sm:text-sm
            ${error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }
          `}
                    {...props}
                />
                {error && (
                    <span className="mt-1 text-xs text-red-500 font-medium">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

// Usamos forwardRef para permitir que bibliotecas como react-hook-form acessem a referência do DOM
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', id, type = 'text', ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        // Gerar um ID aleatório se não for passado
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
        
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className={`flex flex-col w-full ${className}`}>
                {label && (
                    <label htmlFor={inputId} className="mb-1 text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                
                <div className="relative">
                    <input
                        id={inputId}
                        ref={ref}
                        type={inputType}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors sm:text-sm
                            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
                            ${isPassword ? 'pr-10' : ''}
                        `}
                        {...props}
                    />
                    
                    {isPassword && (
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                // Ícone Eye Slash (Olho fechado)
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                // Ícone Eye (Olho aberto)
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>

                {error && (
                    <span className="mt-1 text-xs text-red-500 font-medium">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
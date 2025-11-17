'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
    id?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ id, checked = false, onCheckedChange, disabled = false, className, ...props }, ref) => {
        return (
            <div className='relative inline-flex items-center'>
                <input
                    ref={ref}
                    id={id}
                    type='checkbox'
                    checked={checked}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    disabled={disabled}
                    className='sr-only'
                    {...props}
                />
                <div
                    className={cn(
                        'h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center transition-colors',
                        'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                        checked && 'bg-blue-600 border-blue-600',
                        disabled && 'opacity-50 cursor-not-allowed',
                        !disabled && 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500',
                        className
                    )}
                    onClick={() => !disabled && onCheckedChange?.(!checked)}
                >
                    {checked && (
                        <Check className='h-3 w-3 text-white' strokeWidth={3} />
                    )}
                </div>
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
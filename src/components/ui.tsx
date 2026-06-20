import { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = 'primary',
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: 'primary' | 'accent' | 'warning' | 'error' | 'success';
}) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-700',
    accent: 'bg-sky-50 text-accent-600',
    warning: 'bg-amber-50 text-warning',
    error: 'bg-red-50 text-error',
    success: 'bg-emerald-50 text-success',
  };
  return (
    <Card className="flex items-center gap-4">
      {icon && <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[accent]}`}>{icon}</div>}
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </Card>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
    secondary: 'bg-primary-100 hover:bg-primary-200 text-primary-800',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-primary-600 text-primary-700 hover:bg-primary-50',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  hint,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition"
      />
      {hint && <span className="text-xs text-gray-400 mt-1 block">{hint}</span>}
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition bg-white"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Badge({
  children,
  color = 'primary',
}: {
  children: ReactNode;
  color?: 'primary' | 'warning' | 'success' | 'error' | 'accent' | 'gray';
}) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-700',
    warning: 'bg-amber-100 text-amber-700',
    success: 'bg-emerald-100 text-emerald-700',
    error: 'bg-red-100 text-red-700',
    accent: 'bg-sky-100 text-accent-600',
    gray: 'bg-gray-100 text-gray-600',
  };
  return <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>{children}</span>;
}

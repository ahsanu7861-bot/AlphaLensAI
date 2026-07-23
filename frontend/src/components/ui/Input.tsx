import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: ReactNode;
  trailingElement?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leadingIcon,
      trailingElement,
      className = "",
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            {label}
          </label>
        )}

        <div
          className={[
            "flex min-h-12 items-center rounded-2xl border bg-white/[0.04]",
            "transition duration-200",
            error
              ? "border-rose-500/50 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/10"
              : "border-white/10 focus-within:border-emerald-500/40 focus-within:ring-2 focus-within:ring-emerald-500/10",
            disabled ? "cursor-not-allowed opacity-50" : "",
          ].join(" ")}
        >
          {leadingIcon && (
            <span className="ml-4 shrink-0 text-slate-500">
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            className={[
              "min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none",
              "placeholder:text-slate-600",
              className,
            ].join(" ")}
            {...props}
          />

          {trailingElement && (
            <span className="mr-4 shrink-0">{trailingElement}</span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-rose-400"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="mt-2 text-sm text-slate-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
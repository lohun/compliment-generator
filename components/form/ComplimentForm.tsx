"use client";

import React, { useState, useRef } from "react";

export interface FormFields {
  name: string;
  jobTitle: string;
  location: string;
  favoriteMeal: string;
  uniqueThing: string;
}

type FieldErrors = Partial<Record<keyof FormFields, string>>;

interface ComplimentFormProps {
  onSubmit: (fields: FormFields) => Promise<void>;
  submitting: boolean;
  serverError: string | null;
}

const FIELD_CONFIG: {
  key: keyof FormFields;
  label: string;
  placeholder: string;
  type: "input" | "textarea";
}[] = [
  {
    key: "name",
    label: "Full Moniker",
    placeholder: "Enter your birthright name...",
    type: "input",
  },
  {
    key: "jobTitle",
    label: "Vocation & Role",
    placeholder: "By what trade are you known?",
    type: "input",
  },
  {
    key: "location",
    label: "Territory of Origin",
    placeholder: "Where do you hold court?",
    type: "input",
  },
  {
    key: "favoriteMeal",
    label: "Gourmet Indulgence",
    placeholder: "The dish that sustains your soul...",
    type: "input",
  },
  {
    key: "uniqueThing",
    label: "A Singularity of Spirit",
    placeholder: "Tell us one thing that sets you apart from the common herd...",
    type: "textarea",
  },
];

function validate(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {};
  for (const { key } of FIELD_CONFIG) {
    const val = fields[key].trim();
    if (!val) {
      errors[key] = "This field is required.";
    } else if (val.length > 200) {
      errors[key] = "Must be 200 characters or fewer.";
    }
  }
  return errors;
}

export default function ComplimentForm({
  onSubmit,
  submitting,
  serverError,
}: ComplimentFormProps) {
  const [fields, setFields] = useState<FormFields>({
    name: "",
    jobTitle: "",
    location: "",
    favoriteMeal: "",
    uniqueThing: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (key: keyof FormFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Clear field error on change if it was previously touched
    if (touched[key] && errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleBlur = (key: keyof FormFields) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const fieldErrors = validate(fields);
    if (fieldErrors[key]) {
      setErrors((prev) => ({ ...prev, [key]: fieldErrors[key] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.fromEntries(FIELD_CONFIG.map(({ key }) => [key, true]));
    setTouched(allTouched);

    const fieldErrors = validate(fields);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      // Focus first error field
      const firstErrorKey = FIELD_CONFIG.find(({ key }) => fieldErrors[key])?.key;
      if (firstErrorKey && formRef.current) {
        const el = formRef.current.querySelector<HTMLElement>(`[data-field="${firstErrorKey}"]`);
        el?.focus();
      }
      return;
    }

    setErrors({});
    await onSubmit(fields);
  };

  const inputBaseClass =
    "w-full bg-transparent border-b border-primary/40 focus:border-primary focus:outline-none px-0 py-2 transition-all duration-200 font-sans text-on-surface placeholder:italic placeholder:text-on-surface-variant/50 text-base";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6 flex flex-col items-center">
      {FIELD_CONFIG.map(({ key, label, placeholder, type }) => (
        <div key={key} className="w-full relative group">
          <label
            htmlFor={`field-${key}`}
            className="block text-[13px] font-semibold text-on-surface-variant mb-1 uppercase tracking-widest transition-colors group-focus-within:text-primary"
          >
            {label}
          </label>

          {type === "textarea" ? (
            <textarea
              id={`field-${key}`}
              data-field={key}
              value={fields[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              onBlur={() => handleBlur(key)}
              placeholder={placeholder}
              rows={2}
              disabled={submitting}
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `error-${key}` : undefined}
              className={`${inputBaseClass} resize-none ${errors[key] ? "border-error" : ""}`}
            />
          ) : (
            <input
              id={`field-${key}`}
              data-field={key}
              type="text"
              value={fields[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              onBlur={() => handleBlur(key)}
              placeholder={placeholder}
              disabled={submitting}
              aria-invalid={!!errors[key]}
              aria-describedby={errors[key] ? `error-${key}` : undefined}
              className={`${inputBaseClass} ${errors[key] ? "border-error" : ""}`}
            />
          )}

          {errors[key] && (
            <p id={`error-${key}`} className="mt-1 text-[12px] text-error" role="alert">
              {errors[key]}
            </p>
          )}
        </div>
      ))}

      {/* Server error banner */}
      {serverError && (
        <div
          role="alert"
          className="w-full rounded-lg border border-error/30 bg-error-container text-on-error-container px-4 py-3 text-sm flex items-start gap-2"
        >
          <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
          <span>{serverError}</span>
        </div>
      )}

      {/* Submit */}
      <div className="pt-2 w-full">
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-on-primary font-bold text-lg py-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 hover:bg-primary-container disabled:opacity-70 disabled:cursor-not-allowed group"
          style={{
            boxShadow: submitting ? "none" : "0 0 0 0 rgba(201,162,39,0)",
            transition: "box-shadow 0.3s ease, background-color 0.3s ease, transform 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!submitting) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 20px rgba(201,162,39,0.35)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
          onMouseDown={(e) => {
            if (!submitting)
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            if (!submitting)
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
        >
          {submitting ? (
            <>
              <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>
              <span>Preparing the Stage…</span>
            </>
          ) : (
            <>
              <span>Generate My Praise</span>
              <span
                className="material-symbols-outlined text-secondary-fixed transition-transform group-hover:rotate-12"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </>
          )}
        </button>
      </div>

      <p className="font-sans text-[13px] text-on-surface-variant/70 italic text-center">
        Caution: Flattery may cause a temporary sense of invincibility.
      </p>
    </form>
  );
}

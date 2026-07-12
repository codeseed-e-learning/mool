export type Rules = Record<string, string>;

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(
  data: Record<string, unknown>,
  rules: Rules
): ValidationResult {
  const errors: Record<string, string[]> = {};

  for (const [field, ruleString] of Object.entries(rules)) {
    const value = data[field];

    for (const rule of ruleString.split("|")) {
      const [ruleName, param] = rule.split(":");
      const message = applyRule(ruleName, param, field, value);

      if (!message) {
        continue;
      }

      errors[field] = errors[field] ?? [];
      errors[field].push(message);
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function applyRule(
  ruleName: string,
  param: string | undefined,
  field: string,
  value: unknown
): string | null {
  switch (ruleName) {
    case "required":
      return value === undefined || value === null || value === ""
        ? `${field} is required`
        : null;

    case "string":
      return value !== undefined && typeof value !== "string"
        ? `${field} must be a string`
        : null;

    case "number":
      return value !== undefined && typeof value !== "number"
        ? `${field} must be a number`
        : null;

    case "email":
      return value !== undefined && !EMAIL_PATTERN.test(String(value))
        ? `${field} must be a valid email`
        : null;

    case "min": {
      const min = Number(param);

      if (typeof value === "string" && value.length < min) {
        return `${field} must be at least ${min} characters`;
      }

      if (typeof value === "number" && value < min) {
        return `${field} must be at least ${min}`;
      }

      return null;
    }

    case "max": {
      const max = Number(param);

      if (typeof value === "string" && value.length > max) {
        return `${field} must be at most ${max} characters`;
      }

      if (typeof value === "number" && value > max) {
        return `${field} must be at most ${max}`;
      }

      return null;
    }

    default:
      return null;
  }
}

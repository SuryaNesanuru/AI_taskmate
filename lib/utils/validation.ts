export function validateInput(data: any, schema: Record<string, any>) {
  const errors: string[] = [];
  const validatedData: Record<string, any> = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    // Check if required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }

    // Use default value if not provided
    if (value === undefined && rules.default !== undefined) {
      validatedData[key] = rules.default;
      continue;
    }

    // Skip validation if value is not provided and not required
    if (value === undefined) {
      continue;
    }

    // Type validation
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push(`${key} must be a string`);
      continue;
    }

    if (rules.type === 'number' && typeof value !== 'number') {
      errors.push(`${key} must be a number`);
      continue;
    }

    // String length validation
    if (rules.type === 'string' && rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${key} must be less than ${rules.maxLength} characters`);
      continue;
    }

    // Number range validation
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${key} must be at least ${rules.min}`);
        continue;
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${key} must be at most ${rules.max}`);
        continue;
      }
    }

    validatedData[key] = value;
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData,
  };
}

export function sanitizeOutput(data: any): any {
  if (typeof data === 'string') {
    // Remove potentially harmful content
    return data
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeOutput);
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeOutput(value);
    }
    return sanitized;
  }

  return data;
}
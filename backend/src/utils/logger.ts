export interface LogMetadata {
  requestId?: string;
  userId?: string;
  action?: string;
  [key: string]: any;
}

function sanitize(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const clone = { ...data };
  const sensitiveKeys = ['password', 'otp', 'code', 'token', 'codeMac', 'authorization'];
  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object') {
      clone[key] = sanitize(clone[key]);
    }
  }
  return clone;
}

export const logger = {
  info: (message: string, meta?: LogMetadata) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? sanitize(meta) : {})
    }));
  },
  warn: (message: string, meta?: LogMetadata) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? sanitize(meta) : {})
    }));
  },
  error: (message: string, error?: any, meta?: LogMetadata) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      ...(meta ? sanitize(meta) : {})
    }));
  }
};

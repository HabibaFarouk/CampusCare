/**
 * Error Handler Utility
 * Converts technical error codes and messages into user-friendly text
 */

const ERROR_MESSAGES = {
  // Network errors
  ECONNREFUSED: 'Cannot connect to server. Check if the backend is running.',
  ENOTFOUND: 'Network error. Check your internet connection.',
  ETIMEDOUT: 'Request timed out. The server took too long to respond.',
  ECONNRESET: 'Connection reset. Try again in a moment.',
  
  // HTTP status codes
  400: 'Invalid request. Please check your input.',
  401: 'Unauthorized. Please log in again.',
  403: 'Access denied. You don\'t have permission for this action.',
  404: 'Not found. This resource doesn\'t exist.',
  408: 'Request timeout. Please check your connection and try again.',
  409: 'Conflict. This item may already exist.',
  422: 'Invalid data. Please check your input and try again.',
  500: 'Server error. Our team is notified. Please try again later.',
  502: 'Bad gateway. The server is temporarily unavailable.',
  503: 'Service unavailable. Please try again in a few moments.',
  
  // Specific API errors (match your backend messages)
  'User already exists': 'This email is already registered. Try logging in instead.',
  'Invalid credentials': 'Email or password is incorrect.',
  'Invalid email or password': 'Email or password is incorrect.',
  'User not found': 'No account found with this email.',
  'Token expired': 'Your session expired. Please log in again.',
  'Unauthorized': 'Please log in to continue.',
  'Missing token': 'Authentication required. Please log in.',
  
  // Generic fallbacks
  'Network Error': 'Network error. Check your connection and try again.',
  'Timeout': 'The request took too long. Please try again.',
};

export const getErrorMessage = (error) => {
  // Handle string error messages
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }

  // Handle axios error response
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    // Check for specific backend error messages
    if (data?.error && typeof data.error === 'string') {
      return ERROR_MESSAGES[data.error] || data.error;
    }
    if (data?.message && typeof data.message === 'string') {
      return ERROR_MESSAGES[data.message] || data.message;
    }
    
    // Fall back to status code mapping
    return ERROR_MESSAGES[status] || `Error ${status}: Something went wrong.`;
  }

  // Handle network errors
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // Handle timeout
  if (error.message && error.message.includes('timeout')) {
    return ERROR_MESSAGES.ETIMEDOUT;
  }

  // Handle generic message
  if (error.message && ERROR_MESSAGES[error.message]) {
    return ERROR_MESSAGES[error.message];
  }

  // Last resort: return the raw message or generic fallback
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Categorize error for logging/analytics
 */
export const getErrorType = (error) => {
  if (error.response) {
    return 'HTTP_ERROR';
  }
  if (error.code) {
    return 'NETWORK_ERROR';
  }
  return 'UNKNOWN_ERROR';
};

/**
 * Log error with context (for debugging)
 */
export const logError = (context, error) => {
  console.log(`[${context}]`, {
    type: getErrorType(error),
    status: error.response?.status,
    code: error.code,
    message: error.message,
    data: error.response?.data,
  });
};

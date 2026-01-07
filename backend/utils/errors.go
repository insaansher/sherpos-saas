package utils

import "github.com/gin-gonic/gin"

// ErrorResponse returns a consistent error format
type ErrorResponse struct {
	ErrorCode string      `json:"error_code"`
	Message   string      `json:"message"`
	RequestID string      `json:"request_id"`
	Details   interface{} `json:"details,omitempty"`
}

// RespondError sends a standardized error response
func RespondError(c *gin.Context, statusCode int, errorCode string, message string, details interface{}) {
	c.JSON(statusCode, ErrorResponse{
		ErrorCode: errorCode,
		Message:   message,
		RequestID: c.GetString("request_id"),
		Details:   details,
	})
}

// Common error codes
const (
	ErrCodeValidation        = "VALIDATION_ERROR"
	ErrCodeUnauthorized      = "UNAUTHORIZED"
	ErrCodeForbidden         = "FORBIDDEN"
	ErrCodeNotFound          = "NOT_FOUND"
	ErrCodeConflict          = "CONFLICT"
	ErrCodeInternalError     = "INTERNAL_ERROR"
	ErrCodeRateLimitExceeded = "RATE_LIMIT_EXCEEDED"
	ErrCodeSubscriptionBlock = "SUBSCRIPTION_BLOCKED"
)

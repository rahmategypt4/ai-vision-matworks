variable "project" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "gemini-vision"
}

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-southeast-1"
}

variable "db_username" {
  description = "MySQL master username"
  type        = string
  default     = "gemini_user"
  sensitive   = true
}

variable "db_password" {
  description = "MySQL master password — set via TF_VAR_db_password env var, never hardcode"
  type        = string
  sensitive   = true
}

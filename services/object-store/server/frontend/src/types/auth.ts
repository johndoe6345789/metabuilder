/** @brief S3 access credentials. */
export interface S3Credentials {
  accessKey: string;
  secretKey: string;
}

/** @brief Authentication state. */
export interface AuthState {
  isAuthenticated: boolean;
  credentials: S3Credentials | null;
}

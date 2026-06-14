/**
 * Express Request type augmentation.
 * Middleware attaches session/user data here so controllers are fully typed.
 */
import type { IUserDocument } from '../modules/users/users.model.js';

declare global {
  namespace Express {
    interface Request {
      /** Populated by requireAuth / requireGoogleAuth middleware */
      user?: IUserDocument;
      /** Raw Better Auth session (if you need the full session object) */
      session?: {
        user: {
          id: string;
          email?: string | null;
          name?: string | null;
          image?: string | null;
        };
        session: {
          id: string;
          userId: string;
          expiresAt: Date;
        };
      };
    }
  }
}

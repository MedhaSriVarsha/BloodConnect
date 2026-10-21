import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthenticatedUser, UserRoleType } from '../types/index.js';
import { memoryStore } from '../services/db.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'bloodconnect_super_secure_access_secret_2026_dev_key';

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Authentication token is required to access this resource.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as any;
    
    // Look up user from database or memoryStore
    const user = memoryStore.users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'The account associated with this session no longer exists.',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        status: 'error',
        code: 'ACCOUNT_SUSPENDED',
        message: 'This account has been suspended by administration.',
      });
    }

    const userRoles = memoryStore.userRoles
      .filter(ur => ur.userId === user.id)
      .map(ur => {
        const role = memoryStore.roles.find(r => r.id === ur.roleId);
        return (role?.name as UserRoleType) || 'DONOR';
      });

    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      roles: userRoles.length > 0 ? userRoles : ['DONOR'],
      status: user.status,
    };

    next();
  } catch (error: any) {
    return res.status(401).json({
      status: 'error',
      code: 'TOKEN_INVALID',
      message: error.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid authentication token.',
    });
  }
}

// Role-based access control middleware
export function requireRole(allowedRoles: UserRoleType[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'User authentication required.',
      });
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN_ROLE',
        message: `Forbidden: This resource requires one of the following roles: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CreditService } from '../services/credit.service';
import { AdjustCreditsDTO, CreditTransactionQuery } from '../types/dtos';

const creditService = new CreditService();

export class CreditController {
  /**
   * Adjust customer credits (admin only)
   */
  async adjustCredits(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const data: AdjustCreditsDTO = req.body;
      const result = await creditService.adjustCredits(data, req.user.userId);

      res.json({
        success: true,
        data: result,
        message: 'Credits adjusted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get credit transactions
   */
  async getTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query: CreditTransactionQuery = {
        customerId: req.query.customerId as string,
        type: req.query.type as any,
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
      };

      if (req.query.startDate) {
        query.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        query.endDate = new Date(req.query.endDate as string);
      }

      const transactions = await creditService.getCreditTransactions(query);

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer's credit history
   */
  async getMyHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const history = await creditService.getCustomerCreditHistory(req.user.userId);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer's credit history by ID (admin only)
   */
  async getCustomerHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { customerId } = req.params;
      const history = await creditService.getCustomerCreditHistory(customerId);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get credit statistics (admin only)
   */
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await creditService.getCreditStatistics();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

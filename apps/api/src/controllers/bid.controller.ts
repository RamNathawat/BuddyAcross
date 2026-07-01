import type { Request, Response, NextFunction } from "express";
import { BidService } from "../services/bid.service.js";

const bidService = new BidService();

export class BidController {
  async createBid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawTaskId = req.params.taskId;
      const taskId = Array.isArray(rawTaskId) ? rawTaskId[0] : rawTaskId;
      const bid = await bidService.createBid(taskId, req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: bid,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawBidId = req.params.bidId;
      const bidId = Array.isArray(rawBidId) ? rawBidId[0] : rawBidId;
      const bid = await bidService.updateBid(bidId, req.body);
      res.status(200).json({
        success: true,
        data: bid,
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptBid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawBidId = req.params.bidId;
      const bidId = Array.isArray(rawBidId) ? rawBidId[0] : rawBidId;
      const result = await bidService.acceptBid(bidId, req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bidController = new BidController();

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log } from './entities/log.entity';

@Injectable()
export class LogsService {
    constructor(
        @InjectModel(Log.name) private logModel: Model<Log>,
    ) {}

    async createLog(logData: Partial<Log>): Promise<Log> {
        const log = new this.logModel(logData);
        return log.save();
    }

    async getAllLogs(
        page = 1,
        limit = 50,
        filters?: {
            type?: string;
            action?: string;
            method?: string;
            startDate?: string;
            endDate?: string;
            userId?: string;
            endpoint?: string;
        },
    ) {
        const query: any = {};

        if (filters) {
            if (filters.type) query.type = filters.type;
            if (filters.action) query.action = filters.action;
            if (filters.method) query.method = filters.method;
            if (filters.userId) query.userId = filters.userId;
            if (filters.endpoint) query.endpoint = { $regex: filters.endpoint, $options: 'i' };
            if (filters.startDate || filters.endDate) {
                query.timestamp = {};
                if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
                if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
            }
        }

        const total = await this.logModel.countDocuments(query).exec();
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const logs = await this.logModel
            .find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        return {
            logs,
            total,
            page,
            totalPages,
        };
    }

    async getLogStats() {
        const totalLogs = await this.logModel.countDocuments().exec();

        const byType = {};
        for (const type of ['info', 'warning', 'error', 'success']) {
            byType[type] = await this.logModel.countDocuments({ type }).exec();
        }

        const byAction = {};
        for (const action of ['CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT', 'REGISTER', 'OTHER']) {
            byAction[action] = await this.logModel.countDocuments({ action }).exec();
        }

        const recentErrors = await this.logModel
            .find({ type: 'error' })
            .sort({ timestamp: -1 })
            .limit(10)
            .exec();

        return { totalLogs, byType, byAction, recentErrors };
    }

    async getLogById(id: string) {
        return this.logModel.findById(id).exec();
    }

    async cleanupOldLogs(days = 30) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const result = await this.logModel.deleteMany({ timestamp: { $lt: cutoff } }).exec();
        return { deletedCount: result.deletedCount };
    }
}

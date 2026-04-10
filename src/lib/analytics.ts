import type { WorkOrder } from '../types/work-order';
import { differenceInDays, isBefore, startOfDay, startOfWeek, startOfMonth, format, isAfter, isSameDay } from 'date-fns';

export function filterByDateRange(workOrders: WorkOrder[], { from, to }: { from: Date; to: Date }): WorkOrder[] {
    return workOrders.filter(wo => {
        const d = startOfDay(wo.callDate);
        return (isAfter(d, startOfDay(from)) || isSameDay(d, startOfDay(from))) && 
               (isBefore(d, startOfDay(to)) || isSameDay(d, startOfDay(to)));
    });
}

export function isOpenStatus(status: string) {
    const s = status.toLowerCase();
    return ['new', 'in progress', 'logged', 'updated by user', 'waiting for vendor', 'waiting for user'].includes(s);
}

export function isOverdue(wo: WorkOrder) {
    if (!wo.targetDate) return false;
    if (wo.isCompleted || wo.isClosed) return false;
    return isBefore(startOfDay(wo.targetDate), startOfDay(new Date()));
}

export function getSummaryMetrics(workOrders: WorkOrder[]) {
    const total = workOrders.length;
    let open = 0;
    let overdue = 0;
    
    let totalCompletionDays = 0;
    let completedCount = 0;

    workOrders.forEach(wo => {
        if (isOpenStatus(wo.status)) open++;
        if (isOverdue(wo)) overdue++;

        if ((wo.isCompleted || wo.isClosed) && wo.targetDate) {
            const days = differenceInDays(wo.targetDate, wo.callDate);
            if (days >= 0) {
                totalCompletionDays += days;
                completedCount++;
            }
        }
    });

    const openPercentage = total > 0 ? (open / total) * 100 : 0;
    const avgDaysToComplete = completedCount > 0 ? totalCompletionDays / completedCount : 0;

    return {
        total,
        open,
        openPercentage,
        overdue,
        avgDaysToComplete
    };
}

export function getStatusBreakdown(workOrders: WorkOrder[]) {
    const counts: Record<string, number> = {};
    workOrders.forEach(wo => {
        // Normalize status strings
        const status = wo.status.trim();
        counts[status] = (counts[status] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
}

export function getWorkOrdersOverTime(workOrders: WorkOrder[], dateRange: { from: Date; to: Date }) {
    const spanDays = differenceInDays(dateRange.to, dateRange.from);
    const useMonthly = spanDays >= 90;

    const bucketsMap = new Map<number, { name: string, WorkOrders: number }>();
    workOrders.forEach(wo => {
        const bucketDate = useMonthly 
            ? startOfMonth(wo.callDate) 
            : startOfWeek(wo.callDate, { weekStartsOn: 1 });
            
        const t = bucketDate.getTime();
        if (!bucketsMap.has(t)) {
            bucketsMap.set(t, { name: format(bucketDate, useMonthly ? 'MMM yyyy' : 'MMM d'), WorkOrders: 0 });
        }
        bucketsMap.get(t)!.WorkOrders += 1;
    });

    return Array.from(bucketsMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(entry => entry[1]);
}

export function getCategoryRankings(workOrders: WorkOrder[]) {
    const counts: Record<string, number> = {};
    workOrders.forEach(wo => {
        const cat = wo.category || 'Uncategorized';
        counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
}

export function getTopBuildings(workOrders: WorkOrder[]) {
    const map = new Map<string, { name: string, total: number, open: number, completed: number, overdue: number }>();

    workOrders.forEach(wo => {
        const b = wo.buildingRoom || 'Unknown';
        if (!map.has(b)) {
            map.set(b, { name: b, total: 0, open: 0, completed: 0, overdue: 0 });
        }
        const item = map.get(b)!;
        item.total++;
        if (isOpenStatus(wo.status)) item.open++;
        if (wo.isCompleted || wo.isClosed) item.completed++;
        if (isOverdue(wo)) item.overdue++;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 50); // limit to top 50
}

export function getTechnicianWorkload(workOrders: WorkOrder[]) {
    const map = new Map<string, { technician: string, assigned: number, completed: number, open: number, totalDays: number, completedWithTarget: number }>();

    workOrders.forEach(wo => {
        const tech = wo.technician || wo.technicianGroup || 'Unassigned';
        if (!map.has(tech)) {
            map.set(tech, { technician: tech, assigned: 0, completed: 0, open: 0, totalDays: 0, completedWithTarget: 0 });
        }
        const item = map.get(tech)!;
        item.assigned++;
        if (isOpenStatus(wo.status)) item.open++;
        if (wo.isCompleted || wo.isClosed) {
            item.completed++;
            if (wo.targetDate) {
                const d = differenceInDays(wo.targetDate, wo.callDate);
                if (d >= 0) {
                    item.totalDays += d;
                    item.completedWithTarget++;
                }
            }
        }
    });

    return Array.from(map.values()).map(t => ({
        technician: t.technician,
        assigned: t.assigned,
        completed: t.completed,
        open: t.open,
        avgDays: t.completedWithTarget > 0 ? Math.round(t.totalDays / t.completedWithTarget) : 0
    })).sort((a, b) => b.assigned - a.assigned);
}

export function getOverdueTickets(workOrders: WorkOrder[]) {
    return workOrders
        .filter(wo => isOverdue(wo))
        .map(wo => {
            return {
                id: wo.id,
                building: wo.buildingRoom,
                category: wo.category,
                technician: wo.technician || wo.technicianGroup,
                callDate: wo.callDate,
                targetDate: wo.targetDate!,
                daysOverdue: Math.abs(differenceInDays(new Date(), wo.targetDate!))
            }
        })
        .sort((a, b) => b.daysOverdue - a.daysOverdue);
}

import * as xlsx from 'xlsx';
import type { WorkOrder } from '../types/work-order';

export async function parseWorkOrderFiles(files: File[]): Promise<WorkOrder[]> {
  const allWorkOrders = new Map<string, WorkOrder>();

  for (const file of files) {
    const data = await file.arrayBuffer();
    const workbook = xlsx.read(data, { type: 'array', cellDates: true });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // cellDates: true combined with raw: true ensures excel dates come out as JS Date objects or numbers (which we can cast to Date)
    const rawRows = xlsx.utils.sheet_to_json<any>(worksheet, { raw: true });

    rawRows.forEach((row) => {
      const id = row["'Work Order' number"];
      // If there's no Work Order number, or it's that weird first row "Line" thing, we skip it
      if (!id || id === 'Work Order') return;

      const isCompleted = row["Completed"] === true || row["Completed"]?.toString()?.toLowerCase() === 'true';
      const isClosed = row["Closed"] === true || row["Closed"]?.toString()?.toLowerCase() === 'true';

      let callDate = new Date();
      if (row["Call Date"]) {
        callDate = new Date(row["Call Date"]);
      }

      let targetDate = null;
      if (row["Target date"]) {
        targetDate = new Date(row["Target date"]);
      }

      const wo: WorkOrder = {
        id: id,
        callDate: callDate,
        userName: row["User name"] || "",
        buildingCaller: row["Building (Caller)"] || "",
        type: row["'Work Order' type"] || "",
        status: row["Status"] || "New",
        technician: row["Technician"] || "",
        buildingRoom: row["Building (room)"] || "",
        isCompleted,
        isClosed,
        targetDate,
        impact: row["Impact"] || "",
        category: row["Category"] || "",
        subcategory: row["Subcategory"] || "",
        technicianGroup: row["Technician Group"] || "",
        escalationTechnician: row["(De-)escalation Technician"] || "",
        requestText: row["Request"] || "",
        actionText: row["Action"] || null
      };

      allWorkOrders.set(wo.id, wo);
    });
  }

  // Sort them by callDate descending (newest first)
  const orders = Array.from(allWorkOrders.values());
  orders.sort((a, b) => b.callDate.getTime() - a.callDate.getTime());
  
  return orders;
}

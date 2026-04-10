export interface WorkOrder {
  id: string; // 'Work Order' number
  callDate: Date;
  userName: string;
  buildingCaller: string;
  type: string; // 'Work Order' type
  status: string;
  technician: string;
  buildingRoom: string; // Building (room)
  isCompleted: boolean; // Completed
  isClosed: boolean; // Closed
  targetDate: Date | null;
  impact: string;
  category: string;
  subcategory: string;
  technicianGroup: string;
  escalationTechnician: string; // (De-)escalation Technician
  requestText: string; // Request
  actionText: string | null; // Action
}

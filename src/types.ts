export enum ServerStatus {
  PENDING = "待处理",
  RECONFIGURING = "改配中",
  WAITING_FOR_CONFIG = "等待配置",
  PENDING_INSPECTION = "待检测",
  INSPECTION_EXCEPTION = "检测异常",
  COMPLETED = "改配完成",
}

export interface Accessory {
  id: string;
  name: string;
  type: "install" | "remove";
  quantity: number;
  status: "pending" | "done" | "faulty";
}

export interface Feedback {
  id: string;
  type: "FAULTY" | "REMOVAL";
  partName: string;
  quantity: number;
  reason?: string;
  timestamp: string;
}

export interface Server {
  id: string;
  sn: string;
  model: string;
  status: ServerStatus;
  accessories: Accessory[];
  location: string;
  feedbacks?: Feedback[];
}

export type ViewState = "LIST" | "PICKUP" | "RECONFIG" | "MORE" | "SCAN" | "FAULTY_FEEDBACK" | "REMOVAL_FEEDBACK" | "PICKUP_SUMMARY";

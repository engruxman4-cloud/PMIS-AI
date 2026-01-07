export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  SCHEDULE_CONTROL = 'SCHEDULE_CONTROL',
  FINANCIAL_CONTROL = 'FINANCIAL_CONTROL',
  INTEGRATED_CONTROL = 'INTEGRATED_CONTROL',
}

export enum FileCategory {
  SCHEDULE = 'SCHEDULE',
  FINANCIAL = 'FINANCIAL',
  COMMON = 'COMMON',
}

export enum FileType {
  SCHEDULE_BASELINE = 'Schedule Baseline',
  PROJECT_SCHEDULE_ACTUALS = 'Project Schedule (Actuals)',
  WORK_PERFORMANCE_DATA = 'Work Performance Data',
  COST_BASELINE = 'Cost Baseline',
  ACTUAL_COST_REPORT = 'Actual Cost Report',
  FINANCIAL_PLAN = 'Financial Management Plan',
  RISK_REGISTER = 'Risk Register',
  OTHER = 'Other'
}

export interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  category: FileCategory;
  uploadDate: Date;
  size: number;
  base64Data?: string;
  mimeType?: string;
}

export interface AnalysisMetric {
  label: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warning' | 'critical' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface ChartDataPoint {
  name: string;
  planned: number;
  actual: number;
  forecast?: number;
}

export interface AnalysisResult {
  mode: AppMode;
  timestamp: Date;
  executiveSummary: string;
  metrics: AnalysisMetric[];
  chartData: ChartDataPoint[];
  forecasts: string[];
  risks: string[];
  recommendations: string[];
  changeRequests: ChangeRequest[];
  dataReadinessScore: number;
}

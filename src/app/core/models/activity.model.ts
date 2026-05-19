export interface Activity {
  id: string;
  name: string;
  budgetAtCompletion: number;
  plannedProgressPercent: number;
  actualProgressPercent: number;
  actualCost: number;
  pv: number;
  ev: number;
  cv: number;
  sv: number;
  cpi: number;
  spi: number;
  eac: number;
  vac: number;
  cpiInterpretation?: string;
  spiInterpretation?: string;
}

export interface ActivityPayload {
  name: string;
  budgetAtCompletion: number;
  plannedProgressPercent: number;
  actualProgressPercent: number;
  actualCost: number;
}

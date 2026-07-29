import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';
import { DataSource, DataSourceData } from './types/config.js';
import { getTimerFromSecondsElapsed } from './helpers/time.js';

interface RenderParams {
  width: number;
  height: number;
  padding: number;
  datasetLabelsize: number;
  axisLabelSize: number;
  timeKnobSize: number;
  lineWidth: number;
}

interface DataSourceConfig {
  color: string;
  lineWidth: number;
  scale?: {
    min?: number;
    max?: number;
    position: 'left' | 'right';
  };
}

export class CustomRenderer {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;
  private params: RenderParams;
  
  private readonly dataSourceConfigs: { [key in DataSource]: DataSourceConfig } = {
    oxiwearCsv: {
      color: 'rgb(99, 157, 207)',
      lineWidth: 6,
      scale: { min: 50, max: 100, position: 'right' }
    },
    garminFit: {
      color: 'rgb(253, 126, 53)',
      lineWidth: 10,
      scale: { position: 'left' }
    },
    oxiwearHRCsv: {
      color: 'rgb(253, 126, 53)',
      lineWidth: 10,
      scale: { position: 'left' }
    },
    polarCsv: {
      color: 'rgb(161, 60, 2)',
      lineWidth: 10,
      scale: { position: 'left' }
    }
  };

  constructor(params: RenderParams) {
    this.params = params;
    this.canvas = createCanvas(params.width, params.height);
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.ctx.fillStyle = 'transparent';
    this.ctx.fillRect(0, 0, this.params.width, this.params.height);
    this.ctx.imageSmoothingEnabled = true;
  }

  private getScaleBounds(data: { [k in DataSource]?: DataSourceData }): {
    left: { min: number; max: number };
    right: { min: number; max: number };
  } {
    const bounds = {
      left: { min: Infinity, max: -Infinity },
      right: { min: Infinity, max: -Infinity }
    };

    for (const [source, sourceData] of Object.entries(data)) {
      if (!sourceData) continue;
      
      const config = this.dataSourceConfigs[source as DataSource];
      const dataMin = Math.min(...sourceData.dataPoints);
      const dataMax = Math.max(...sourceData.dataPoints);
      
      if (config.scale?.position === 'right') {
        bounds.right.min = Math.min(bounds.right.min, config.scale.min ?? dataMin);
        bounds.right.max = Math.max(bounds.right.max, config.scale.max ?? dataMax);
      } else {
        bounds.left.min = Math.min(bounds.left.min, dataMin);
        bounds.left.max = Math.max(bounds.left.max, dataMax);
      }
    }

    // Handle case where no data exists for a side
    if (bounds.left.min === Infinity) bounds.left = { min: 0, max: 100 };
    if (bounds.right.min === Infinity) bounds.right = { min: 0, max: 100 };

    return bounds;
  }

  private mapDataToCanvas(
    value: number,
    scale: { min: number; max: number }
  ): { x: number; y: number } {
    const { padding, height } = this.params;
    
    // Y coordinate (inverted for canvas)
    const normalizedY = (value - scale.min) / (scale.max - scale.min);
    const y = height - padding - (normalizedY * (height - 2 * padding));
    
    // X coordinate (will be set per data point)
    const x = 0; // This will be calculated per point in renderLine
    
    return { x, y };
  }

  private renderAxes(bounds: {
    left: { min: number; max: number };
    right: { min: number; max: number };
  }): void {
    const { padding, width, height, axisLabelSize } = this.params;
    const chartHeight = height - 2 * padding;

    this.ctx.font = `bold ${axisLabelSize}px sans-serif`;
    this.ctx.textAlign = 'center';

    // Left Y-axis labels
    this.ctx.fillStyle = this.dataSourceConfigs.polarCsv.color;
    const leftSteps = 5;
    for (let i = 0; i <= leftSteps; i++) {
      const value = bounds.left.min + (bounds.left.max - bounds.left.min) * (i / leftSteps);
      const y = height - padding - (i / leftSteps) * chartHeight;
      
      this.ctx.textAlign = 'right';
      this.ctx.fillText(Math.round(value).toString().padStart(3, '0'), padding - 10, y + axisLabelSize / 3);
    }

    // Right Y-axis labels (for oxiwear)
    this.ctx.fillStyle = this.dataSourceConfigs.oxiwearCsv.color;
    const rightSteps = 4;
    for (let i = 0; i <= rightSteps; i++) {
      const value = bounds.right.min + (bounds.right.max - bounds.right.min) * (i / rightSteps);
      const y = height - padding - (i / rightSteps) * chartHeight;
      
      this.ctx.textAlign = 'left';
      this.ctx.fillText(Math.round(value).toString(), width - padding + 10, y + axisLabelSize / 3);
    }
  }

  private renderLine(
    sourceData: DataSourceData,
    source: DataSource,
    currentFrame: number,
    bounds: { left: { min: number; max: number }; right: { min: number; max: number } }
  ): void {
    const config = this.dataSourceConfigs[source];
    const isRightAxis = config.scale?.position === 'right';
    const scale = isRightAxis ? bounds.right : bounds.left;
    
    const { padding, width } = this.params;
    const chartWidth = width - 2 * padding;
    const dataPoints = sourceData.dataPoints;

    this.ctx.strokeStyle = config.color;
    this.ctx.lineWidth = config.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'bevel';

    this.ctx.beginPath();
    
    for (let i = 0; i < dataPoints.length; i++) {
      const value = dataPoints[i];
      const x = padding + (i / (dataPoints.length - 1)) * chartWidth;
      const coords = this.mapDataToCanvas(value, scale);
      coords.x = x;

      if (i === 0) {
        this.ctx.moveTo(coords.x, coords.y);
      } else {
        this.ctx.lineTo(coords.x, coords.y);
      }
    }

    this.ctx.stroke();

    // Render current point indicator
    if (currentFrame < dataPoints.length) {
      const currentValue = dataPoints[currentFrame];
      const currentX = padding + (currentFrame / (dataPoints.length - 1)) * chartWidth;
      const currentCoords = this.mapDataToCanvas(currentValue, scale);
      currentCoords.x = currentX;

      this.ctx.fillStyle = '#18263A';
      this.ctx.beginPath();
      this.ctx.arc(currentCoords.x, currentCoords.y, 20, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  private renderLegend(
    data: { [k in DataSource]?: DataSourceData },
    currentFrame: number,
    stepResolution: number,
    timerStartSecond: number,
    timerStopSecond: number
  ): void {
    const { width, datasetLabelsize } = this.params;
    const legendY = 40;
    let currentX = width - 50;

    this.ctx.font = `${datasetLabelsize}px sans-serif`;
    this.ctx.textAlign = 'right';

    // Timer display
    const timer = this.getTimer(currentFrame, stepResolution, timerStartSecond, timerStopSecond);
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(`Apnea: ${timer}`, currentX, legendY);
    currentX -= 200;

    // Data source labels
    for (const [source, sourceData] of Object.entries(data)) {
      if (!sourceData) continue;
      
      const config = this.dataSourceConfigs[source as DataSource];
      const currentSecond = Math.floor(currentFrame / stepResolution) * stepResolution;
      const currentValue = sourceData.dataPoints[currentSecond] || 0;
      
      this.ctx.fillStyle = config.color;
      this.ctx.fillText(
        `${sourceData.label}: ${currentValue.toString().padStart(3, '0')}`,
        currentX,
        legendY
      );
      currentX -= 250;
    }
  }

  private getTimer(
    currentFrame: number,
    stepResolution: number,
    start: number = 0,
    stop: number = Infinity
  ): string {
    let second = 0;
    const currentSecond = Math.floor(currentFrame / stepResolution);

    if (currentSecond >= start && currentSecond < stop) {
      second = currentSecond - start + 1;
    }

    if (currentSecond >= stop) {
      second = stop - start + 1;
    }

    return getTimerFromSecondsElapsed(second);
  }

  public renderFrame(
    data: { [k in DataSource]?: DataSourceData },
    currentFrame: number,
    stepResolution: number,
    timerStartSecond: number,
    timerStopSecond: number
  ): Buffer {
    // Clear canvas
    this.setupCanvas();

    // Calculate scale bounds
    const bounds = this.getScaleBounds(data);

    // Render axes
    this.renderAxes(bounds);

    // Render data lines
    for (const [source, sourceData] of Object.entries(data)) {
      if (sourceData) {
        this.renderLine(sourceData, source as DataSource, currentFrame, bounds);
      }
    }

    // Render legend
    this.renderLegend(data, currentFrame, stepResolution, timerStartSecond, timerStopSecond);

    return this.canvas.toBuffer('image/png');
  }
}
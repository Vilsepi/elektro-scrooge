import { ChartJSNodeCanvas, ChartCallback } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import { TimeSegment } from '../datasource/datasourceTypes';
import { promises as fs } from 'fs';
import { registerFont } from 'canvas';
import path from 'path';

// Used kWh per euro (100 eurocents) per one use
const sauna_cost_multiplier = 10/100;
const white_appliance_cost_multiplier = 1.25/100;

export const getDifferenceBetweenDays = (priceToday: number, priceTomorrow: number): string => {
  const difference = (100 * (priceTomorrow - priceToday) / priceToday);
  if (difference > 0) {
    return `+${+Number(difference).toFixed(0)}% enemmän`;
  }
  return `${+Number(difference).toFixed(0)}% vähemmän`;
}

// Renders a rich-text formatted message describing electricity prices
export const renderMessage = (today: TimeSegment, tomorrow: TimeSegment, detailedHours: TimeSegment[]): string => {
  const baseMessage =
    `Sähkön hinta on huomenna <b>~${+Number(tomorrow.priceAverage).toFixed(0)}c/kWh</b>, ` +
    `joka on <b>${getDifferenceBetweenDays(today.priceAverage, tomorrow.priceAverage)}</b> kuin tänään.` +
    '\n\n' +
    `Saunominen maksaa ${+Number(tomorrow.priceHighest*sauna_cost_multiplier).toFixed(1)}€ ja ` +
    `muut kodinkoneet ${+Number(tomorrow.priceHighest*white_appliance_cost_multiplier).toFixed(1)}€ per kerta.\n\n`;

  let tableOfPrices = '';
  for (const segment of detailedHours) {
    tableOfPrices += `${segment.hours}: ${+Number(segment.priceLowest).toFixed(0)}-${+Number(segment.priceHighest).toFixed(0)}c/kWh\n`;
  }

  return baseMessage + tableOfPrices;
}

// Renders a simple summary of prices, meant for image caption
export const renderCaption = (today: TimeSegment, tomorrow: TimeSegment): string => {
  const baseMessage =
    `Sähkön hinta on huomenna ~${+Number(tomorrow.priceAverage).toFixed(0)}c/kWh, ` +
    `joka on ${getDifferenceBetweenDays(today.priceAverage, tomorrow.priceAverage)} kuin tänään.` +
    '\n\n' +
    `Saunominen maksaa ${+Number(tomorrow.priceHighest*sauna_cost_multiplier).toFixed(1)}€ ja ` +
    `muut kodinkoneet ${+Number(tomorrow.priceHighest*white_appliance_cost_multiplier).toFixed(1)}€ per kerta.\n\n`;
  return baseMessage;
}

export const renderGraph = async (today: TimeSegment, tomorrow: TimeSegment): Promise<string> => {
  const width = 600;
  const height = 400;
  const configuration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: Array.from({ length: 23 - 7 + 1 }, (_, i) => (i + 7).toString().padStart(2, '0')),
      datasets: [
        {
          label: 'Huomenna',
          data: tomorrow.hourlyPrices,
          backgroundColor: [
            'rgb(252, 179, 23)'
          ],
          borderColor: [
            'rgb(252, 179, 23)'
          ],
          borderWidth: 4
        },
        {
          label: 'Tänään',
          data: today.hourlyPrices,
          backgroundColor: [
            'rgb(147, 189, 223)'
          ],
          borderColor: [
            'rgb(147, 189, 223)'
          ],
          borderWidth: 2
        }
      ]
    },

    options: {
      elements: {
        line: {
          stepped: true
        },
        point: {
          radius: 0
        }
      },
      layout: {
        padding: 5
      },
      scales: {
        x: {
          grid: {
            color: '#f1f1f1'
          }
        },
        y: {
          display: true,
          min: 0,
          max: 50,
          title: {
            display: true,
            text: 'c/kWh',
          },
          grid: {
            color: '#f1f1f1'
          }
        }
      }
    },

    plugins: [{
      id: 'background-colour',
      beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }]
  };
  const chartCallback: ChartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.maintainAspectRatio = false;
    ChartJS.defaults.font.family = "'Roboto', 'sans-serif'";
    ChartJS.defaults.font.size = 14;
  };

  const isInAws = !!process.env.LAMBDA_TASK_ROOT;
  let filePath = '';
  if (isInAws) {
    // Lambda runtime does not contain any fonts so we need to manually include one
    registerFont(path.resolve(__dirname, 'Roboto-Regular.ttf'), { family: 'Roboto' });
    filePath = '/tmp/elektro-scrooge-price-graph.png';
  }
  else {
    filePath = 'graph.png';
  }

  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  await fs.writeFile(filePath, buffer, 'base64');
  return filePath;
}

import { ChartJSNodeCanvas, ChartCallback } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import { promises as fs } from 'fs';
import { registerFont } from 'canvas';
import path from 'path';
import { AggregatedSpotPricesResponse } from '../datasource/datasourceTypes';

export const renderGraph = async (pricesToday: AggregatedSpotPricesResponse, pricesTomorrow: AggregatedSpotPricesResponse): Promise<string> => {
  const pricesTodayValues = pricesToday.prices.map(price => price.measurement.value);
  const pricesTomorrowValues = pricesTomorrow.prices.map(price => price.measurement.value);

  //const numberOfLabels =

  const width = 600;
  const height = 400;
  const configuration: ChartConfiguration = {
    type: 'line',
    data: {
      labels: pricesToday.prices.map(p => p.hour.toString().padStart(2, '0')),
      datasets: [
        {
          label: 'Huomenna',
          data: pricesTomorrowValues,
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
          data: pricesTodayValues,
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


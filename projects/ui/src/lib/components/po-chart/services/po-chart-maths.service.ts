import { Injectable } from '@angular/core';

import { PoChartAxisXLabelArea, PoChartPadding } from '../helpers/po-chart-default-values.constant';

import { PoChartContainerSize } from '../interfaces/po-chart-container-size.interface';
import { PoLineChartSeries } from '../interfaces/po-chart-line-series.interface';
import { PoChartMinMaxValues } from '../interfaces/po-chart-min-max-values.interface';

@Injectable({
  providedIn: 'root'
})
export class PoChartMathsService {
  constructor() {}

  /**
   * Calcula e retorna os válores mínimo e máximo das séries.
   *
   * @param series Lista de séries.
   * @param acceptNegativeValues boolean.
   */
  calculateMinAndMaxValues(series: Array<any>, acceptNegativeValues: boolean = true): PoChartMinMaxValues {
    const minValue = this.getDomain(series, 'min');
    const maxValue = this.getDomain(series, 'max');
    return { minValue: !acceptNegativeValues && minValue < 0 ? 0 : minValue, maxValue };
  }

  /**
   * Efetua o cálculo da área lateral entre o os labels X e a plotagem da primeira série. Válido para gráficos do tipo linha e área.
   *
   * > A largura máxima permitida é de 24px.
   *
   * @param containerWidth Largura do container SVG.
   * @param seriesLength Quantidade de séries.
   */
  calculateSideSpacing(containerWidth: PoChartContainerSize['svgWidth'], seriesLength: number): number {
    const halfCategoryWidth = Math.trunc((containerWidth - PoChartAxisXLabelArea) / seriesLength / 2);

    return halfCategoryWidth <= PoChartPadding ? halfCategoryWidth : PoChartPadding;
  }

  /**
   * Retorna o tamanho da série que tiver mais itens.
   *
   * @param series Lista de séries.
   */
  seriesGreaterLength(series: Array<PoLineChartSeries>): number {
    return series.reduce((result, serie) => (result > serie.data.length ? result : serie.data.length), 0);
  }

  /**
   * Retorna o percentual em decimal da série passada pela distância entre os valores mínimos e máximos da série.
   *
   * Se o valor mínimo for negativo o alcance partirá dele como sendo zero %.
   *
   * Por exemplo:
   *    minValue = -10;
   *    maxValue = 0;
   *    serieValue = -8
   *    O resultado será de 0.20;
   *
   * @param minMaxValues Objeto contendo os valores mínimo e máximo de todas as séries.
   * @param serieValue O valor da série.
   */
  getSeriePercentage(minMaxValues: any, serieValue: number): number {
    const { minValue, maxValue } = minMaxValues;

    const range = maxValue - minValue;
    const displacement = serieValue - minValue;
    const result = displacement / range;

    return isNaN(result) ? 0 : result;
  }

  /**
   * Calcula e retorna uma lista de valores referentes aos textos dos eixos X em relação à quantidade de linhas horizontais.
   *
   * @param minMaxValues Objeto contendo os valores mínimo e máximo de todas as séries.
   * @param gridLines Quantidade de linhas horizontais. Valor default é 5.
   */
  range(minMaxValues: PoChartMinMaxValues, gridLines: number = 5) {
    const { minValue, maxValue } = minMaxValues;

    const result = [];
    const step = this.getGridLineArea(minMaxValues, gridLines);

    for (let index = minValue; index <= maxValue; index = (index * 10 + step * 10) / 10) {
      result.push(index);
    }

    return result;
  }

  /**
   *
   * Verifica se o valor passado é um Integer ou Float.
   *
   * @param number O valor a ser validado
   */
  verifyIfFloatOrInteger(number: number) {
    const notABoolean = typeof number !== 'boolean';
    const notInfinity = number !== Infinity;

    const isInteger = Number(number) === number && number % 1 === 0 && notInfinity;
    const isFloat = Number(number) === number && number % 1 !== 0 && notInfinity;

    return (notABoolean && isInteger) || (notABoolean && isFloat);
  }

  // Cálculo que retorna o valor obtido de gridLines em relação ao alcance dos valores mínimos e máximos das séries (maxMinValues)
  private getGridLineArea(minMaxValues: PoChartMinMaxValues, gridLines: number) {
    const percentageValue = this.getFractionFromInt(gridLines - 1);
    const { minValue, maxValue } = minMaxValues;
    const result = (percentageValue * (maxValue - minValue)) / 100;

    return result === 0 ? 1 : result;
  }

  // Retorna o valor máximo ou mínimo das séries baseado no tipo passado(type).
  private getDomain(series: Array<any>, type: string) {
    const result = Math[type](
      ...series.map(serie => {
        if (Array.isArray(serie.data)) {
          return Math[type](...serie.data);
        }
      })
    );
    return isNaN(result) ? 0 : result;
  }

  // Retorna a fração do número passado referente à quantidade de linhas no eixo X (gridLines)
  private getFractionFromInt(value: number) {
    return (1 / value) * (100 / 1);
  }
}

import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ApexGrid,
  ApexTooltip,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { HomeService } from '../../../services/home.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  colors: string[];
};
@Component({
  selector: 'app-group-bar-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './group-bar.component.html',
  styleUrl: './group-bar.component.css',
})
export class GroupBarChartComponent {
  constructor(private homeService: HomeService) {}

  @Input() properties: any[] = [];

  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<'next' | 'prev'>();

  chartSeries: ApexAxisChartSeries = [];
  totalRecords = 0;

  chartCategories: string[] = [];

  private readonly maxCategoryLabelLength = 13;

  private formatCategoryLabel = (value: any): string => {
    const label = `${value ?? ''}`;

    if (label.length <= this.maxCategoryLabelLength) {
      return label;
    }

    return `${label.slice(0, this.maxCategoryLabelLength)}...`;
  };

  private getYAxisMax(data: any[]): number {
    const maxValue = data.reduce((max, property) => {
      const rentedUnits = Number(property.rented_units) || 0;
      const vacantUnits = Number(property.vacant_units) || 0;

      return Math.max(max, rentedUnits + vacantUnits);
    }, 0);

    return Math.max(20, Math.ceil(maxValue / 20) * 20);
  }

  chartOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
      type: 'bar',
      height: 245,
      stacked: true,
      parentHeightOffset: 0,
      toolbar: {
        show: false,
      },
    },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%',
        borderRadius: 6,
      },
    },

    dataLabels: {
      enabled: false,
    },

    grid: {
      show: true,
      borderColor: '#e5e7eb',
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },

    tooltip: {
      enabled: true,
      x: {
        formatter: (value: any) => `${value ?? ''}`,
      },
    },

    xaxis: {
      categories: [],
      labels: {
        rotate: -35,
        rotateAlways: true,
        trim: true,
        maxHeight: 60,
        formatter: this.formatCategoryLabel,
        style: {
          fontSize: '11px',
        },
      },
      tooltip: {
        enabled: true,
      },
    },

    yaxis: {
      min: 0,
      max: 20,
      tickAmount: 1,
      labels: {
        formatter: (value: number) => `${Math.round(value)}`,
      },
    },

    colors: ['#2C7AFF', '#00BEDB'],

    legend: {
      position: 'top',
      horizontalAlign: 'center',
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['properties'] && this.properties?.length) {
      this.updateChart(this.properties);
    }
  }
  updateChart(data: any[]) {
    if (!data || data.length === 0) return;
    this.totalRecords = data.length;

    this.chartCategories = data.map((x) => x.property_name);

    this.chartSeries = [
      {
        name: 'Rented Units',
        data: data.map((x) => Number(x.rented_units) || 0),
      },
      {
        name: 'Vacant Units',
        data: data.map((x) => Number(x.vacant_units) || 0),
      },
    ];

    const yAxisMax = this.getYAxisMax(data);

    this.chartOptions = {
      ...this.chartOptions,
      series: this.chartSeries,
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: this.chartCategories,
      },
      yaxis: {
        ...this.chartOptions.yaxis,
        min: 0,
        max: yAxisMax,
        tickAmount: yAxisMax / 20,
      },
    };
  }
  nextPage() {
    this.pageChange.emit('next');
  }

  previousPage() {
    this.pageChange.emit('prev');
  }
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import { IReportEmbedConfiguration, models, service } from 'powerbi-client';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import 'powerbi-report-authoring';
import { embedUrl, errorClass, errorElement, hidden, position, reportId, reportUrl, successClass, successElement, token } from './constants';
import { HttpService } from './services/http.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild(PowerBIReportEmbedComponent)
  reportObj!: PowerBIReportEmbedComponent;

  @ViewChild('status') private statusRef!: ElementRef<HTMLDivElement>;

  @ViewChild('embedReportBtn')
  private embedBtnRef!: ElementRef<HTMLButtonElement>;

  isEmbedded = false;
  displayMessage = 'The report is bootstrapped. Click Embed Report button to set the access token.';
  reportClass = 'report-container hidden';
  phasedEmbeddingFlag = false;

  reportConfig: IReportEmbedConfiguration = {
    type: 'report',
    embedUrl: undefined,
    tokenType: models.TokenType.Embed,
    accessToken: undefined,
    settings: undefined,
  };

  eventHandlersMap = new Map<string, (event?: service.ICustomEvent<any>) => void>([
    ['loaded', () => console.log('Report has loaded')],
    [
      'rendered',
      () => {
        console.log('Report has rendered');

        if (!this.isEmbedded) {
          this.displayMessage = 'Use the buttons above to interact with the report using Power BI Client APIs.';
        }

        this.isEmbedded = true;
      },
    ],
    [
      'error',
      (event?: service.ICustomEvent<any>) => {
        if (event) {
          console.error(event.detail);
        }
      },
    ],
    ['visualClicked', () => console.log('visual clicked')],
    ['pageChanged', event => console.log(event)],
  ]);

  constructor(
    public httpService: HttpService,
    private element: ElementRef<HTMLDivElement>,
  ) {}

  async embedReport(): Promise<void> {
    let reportConfigResponse: any;

    // to use api based flow
    try {
      reportConfigResponse = await firstValueFrom(this.httpService.getEmbedConfig(reportUrl));
    } catch (error: any) {
      await this.prepareDisplayMessageForEmbed(errorElement, errorClass);
      this.displayMessage = `Failed to fetch config for report. Status: ${error.statusText} Status Code: ${error.status}`;
      console.error(this.displayMessage);
      return;
    }

    this.reportConfig = {
      ...this.reportConfig,
      id: reportConfigResponse.Id,
      embedUrl: reportConfigResponse.EmbedUrl,
      accessToken: reportConfigResponse.EmbedToken.Token,
    };

    // for constant based flow
    // this.reportConfig = {
    //   ...this.reportConfig,
    //   id: reportId,
    //   embedUrl: embedUrl,
    //   accessToken: token,
    // };

    const reportDiv = this.element.nativeElement.querySelector('.report-container');
    if (reportDiv) {
      reportDiv.classList.remove(hidden);
    }

    const displayMessage = this.element.nativeElement.querySelector('.display-message');
    if (displayMessage) {
      displayMessage.classList.remove(position);
    }

    await this.prepareDisplayMessageForEmbed(successElement, successClass);

    this.displayMessage = 'Access token is successfully set. Loading Power BI report.';
  }

  async prepareDisplayMessageForEmbed(img: HTMLImageElement, type: string): Promise<void> {
    this.embedBtnRef.nativeElement.remove();
    this.statusRef.nativeElement.prepend(img);
    this.statusRef.nativeElement.classList.add(type);
  }

  prepareStatusMessage(img: HTMLImageElement, type: string) {
    this.statusRef.nativeElement.prepend(img);
    this.statusRef.nativeElement.classList.add(type);
  }
}

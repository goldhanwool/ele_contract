import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Render, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ContractService } from './contract.service';

@Controller('contract')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly contractService: ContractService,
  ) {}

  @Get('healthcheck')
  getHello() {
    return 'hello';
  }

  @Post('/info')
  async createPDF(@Body() body) {
    console.log('contract makeing start: ');
    const orderid = body.orderId;
    return await this.contractService.selectContractInfo(orderid);
  }

  @Get('/convert')
  async convertHtml() {
    const data = 'helloPdf';
    const html = `<div style={font-size: 12px;}><p>사업장 위 수탁 계약서</p>
      <p>&ldquo;갑&rdquo;은 &ldquo;갑의 사업장에서 발생하는 사업장폐기물의 처리를 &ldquo;을&rdquo;에게 수집 &nbsp;운반 의뢰하고, &ldquo;을&quot;은 &ldquo;갑&rdquo;이 지정하는 처리 업자인 &ldquo;을&quot;에게 운반, 처리하여야 한다.&nbsp;</p>
      <p>&ldquo;병&rdquo;은 &ldquo;갑&rdquo;의 사업장폐기물의 처리를 &ldquo;을&rdquo;로부터 수탁 받아 폐기물관리법이 정하는 바에 의하여 합법적으로 처리하며, &ldquo;을&quot;은 &ldquo;갑&rdquo;의 사업장에서 발생하는 사업장 폐기물의 양에 따라 정기 또는 수시로 이를 수집하여 &ldquo;병&rdquo;에게 적법하게 운반하여야 한다.&nbsp;</p>
      <p>&ldquo;갑&rdquo;은 자신이 임의로 불법처리하거나 폐기물 관리법에 위배되어 발생하는 민.형사상의 문제에 대하여 절대적으로 &ldquo;갑&rdquo;이책임지며 &ldquo;을&rdquo;은 &ldquo;갑&rdquo;이 지정한 &ldquo;병에게 수집.운반하지 아니하고 다른 처리업자에게 불법 처리 할 경우 발생되는 민.형사상의 책임은 &ldquo;을&rdquo;이 진다.&nbsp;</p>
      <p>&ldquo;갑&rdquo;의 사업장에서 발생하는 사업장폐기물의 운반사는 &ldquo;갑&quot;, &rdquo;을&rdquo;이 쌍방 확인하여야 한다. 확인시 폐기물의 혼합, 수분함량 및 기타 유해물질의 기준초과가 우려되는 경우에는 성분분석 확인 및 분리작업이 완료될 때까지 &ldquo;을&quot;은 폐기물의 수집.운반을 &ldquo;병&rdquo;은 처리를 보류할 수 있다.</p>
      <p>계약기간 중 &ldquo;을&rdquo;, &rdquo;병&quot;이 영업정지 등 행정처분을 받은 경우에는 이를 지체없이 &ldquo;갑&rdquo;에게 통보하여야한다.&nbsp;<br>처리비는 사업장 폐기물을 운반과 동시에 &ldquo;갑&rdquo;이 수집.운반비는 &ldquo;을&rdquo;에게 지불하고 처리비는 &ldquo;병&rdquo;에게 지불함을 원칙으로 한다. 단 &ldquo;을&rdquo;이 수집.운반비 및 처리비를 &ldquo;갑&rdquo;에게 일괄 청구하고 &ldquo;병&quot;은 처리비를 &ldquo;을&rdquo;에게 청구 정산 할 수도 있다.&nbsp;</p>
      <p><br>폴리에틸렌 | 고상 | KG | 250 | 20,500,000 | 소각</p>
      <p><br></p>
      <p>느루 (&lsquo;갑&apos; 배출자)&nbsp;</p>
      <p>충북 음성군 금왕읍 금일로 183번길 125 75-456412 &nbsp;</p>
      <p><span style="white-space:pre-wrap;">금호(&lsquo;을&apos; 수집운반자)</span></p>
      <p>충북 음성군 금왕읍 금일로 183번길 125 75-456412 &nbsp;</p>`;
    return await this.contractService.convertHtmlToPdf(html, data);
  }

  @Get('/puppeteer')
  async puppeteer() {
    const data = 'helloPdf';
    const html = `<div style={font-size: 12px;}><p>사업장 위 수탁 계약서</p>
      <p>&ldquo;갑&rdquo;은 &ldquo;갑의 사업장에서 발생하는 사업장폐기물의 처리를 &ldquo;을&rdquo;에게 수집 &nbsp;운반 의뢰하고, &ldquo;을&quot;은 &ldquo;갑&rdquo;이 지정하는 처리 업자인 &ldquo;을&quot;에게 운반, 처리하여야 한다.&nbsp;</p>
      <p>&ldquo;병&rdquo;은 &ldquo;갑&rdquo;의 사업장폐기물의 처리를 &ldquo;을&rdquo;로부터 수탁 받아 폐기물관리법이 정하는 바에 의하여 합법적으로 처리하며, &ldquo;을&quot;은 &ldquo;갑&rdquo;의 사업장에서 발생하는 사업장 폐기물의 양에 따라 정기 또는 수시로 이를 수집하여 &ldquo;병&rdquo;에게 적법하게 운반하여야 한다.&nbsp;</p>
      <p>&ldquo;갑&rdquo;은 자신이 임의로 불법처리하거나 폐기물 관리법에 위배되어 발생하는 민.형사상의 문제에 대하여 절대적으로 &ldquo;갑&rdquo;이책임지며 &ldquo;을&rdquo;은 &ldquo;갑&rdquo;이 지정한 &ldquo;병에게 수집.운반하지 아니하고 다른 처리업자에게 불법 처리 할 경우 발생되는 민.형사상의 책임은 &ldquo;을&rdquo;이 진다.&nbsp;</p>
      <p>&ldquo;갑&rdquo;의 사업장에서 발생하는 사업장폐기물의 운반사는 &ldquo;갑&quot;, &rdquo;을&rdquo;이 쌍방 확인하여야 한다. 확인시 폐기물의 혼합, 수분함량 및 기타 유해물질의 기준초과가 우려되는 경우에는 성분분석 확인 및 분리작업이 완료될 때까지 &ldquo;을&quot;은 폐기물의 수집.운반을 &ldquo;병&rdquo;은 처리를 보류할 수 있다.</p>
      <p>계약기간 중 &ldquo;을&rdquo;, &rdquo;병&quot;이 영업정지 등 행정처분을 받은 경우에는 이를 지체없이 &ldquo;갑&rdquo;에게 통보하여야한다.&nbsp;<br>처리비는 사업장 폐기물을 운반과 동시에 &ldquo;갑&rdquo;이 수집.운반비는 &ldquo;을&rdquo;에게 지불하고 처리비는 &ldquo;병&rdquo;에게 지불함을 원칙으로 한다. 단 &ldquo;을&rdquo;이 수집.운반비 및 처리비를 &ldquo;갑&rdquo;에게 일괄 청구하고 &ldquo;병&quot;은 처리비를 &ldquo;을&rdquo;에게 청구 정산 할 수도 있다.&nbsp;</p>
      <p><br>폴리에틸렌 | 고상 | KG | 250 | 20,500,000 | 소각</p>
      <p><br></p>
      <p>느루 (&lsquo;갑&apos; 배출자)&nbsp;</p>
      <p>충북 음성군 금왕읍 금일로 183번길 125 75-456412 &nbsp;</p>
      <p><span style="white-space:pre-wrap;">금호(&lsquo;을&apos; 수집운반자)</span></p>
      <p>충북 음성군 금왕읍 금일로 183번길 125 75-456412 &nbsp;</p>`;
    return await this.contractService.puppeteerPdf(html, data);
  }


  @Post('/modify')
  async modify(@Body() body) {
    const pdfUrl = body.url;
    return await this.contractService.modifyPdf(pdfUrl);
  }

  @Post('/checkSeal')
  async checkSeal(@Body() body) {
    const userId = body.user_id;
    console.log(body);
    return await this.contractService.checkUserSeal(userId);
  }

  @Get('/s3get')
  async s3get() {
    return await this.contractService.getPdfFromS3();
    // return await this.contractService.b();
  }
} //controller

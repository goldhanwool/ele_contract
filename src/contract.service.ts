import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { moveMessagePortToContext } from 'worker_threads';
import { doc } from 'prettier';
import * as AWS from 'aws-sdk';
import { ServerlessApplicationRepository } from 'aws-sdk';

const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const { degrees, PDFDocument, StandardFonts, rgb } = require('pdf-lib');
//const fetch = require('fetch');
const pdf = require('html-pdf');
const options = { format: 'A4' }; //용지 크기 설정

@Injectable()
export class ContractService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;
  constructor() {
    this.awsS3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_SECRET_KEY,
      region: process.env.AWS_S3_REGION,
    });
    this.S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME; // nest-s3
  }

  // DB에서 컨트랙트 값 가져와서 프론트로 보내기
  async selectContractInfo(orderId) {
    // const contractInfo = await this.connection.query('SELECT ' + 'USER_ID ' + 'FROM ' + 'USERS ' + 'WHERE ' + 'ID = ' + sp_create_pdf_req_dto.USER_ID);
    // const userName = contractInfo[0]["USER_ID"]
  }

  // htlm태그를 pdf로 생성하기
  async convertHtmlToPdf(html: string, originalname: string) {
    const filename = `${Date.now()}_${path.basename(originalname)}`.replace(
      / /g,
      '',
    );
    console.log('create PDF start!!~-------------------------');
    // const testPdf = pdf
    //   .create(html, options)
    //   .toFile(`./${filename}.pdf`, function (err, res) {
    //     if (err) return console.log(err);
    //     console.log(res);
    //   });
    const testPdf = await pdf
      .create(html, options)
      .toFile(`./${filename}.pdf`, function (err, res) {
        if (err) return console.log(err);
        console.log(res);
      });
    // const testPdf1 = fs.readFileSync(`./${filename}.pdf`);
    const pdfWriter = await this.readFile(filename);

    // const pdfWriter = await fs.createWriteStream(
    //   path.join(__dirname, '..', 'output', `${filename}.pdf`),
    // );
    // await pdfWriter.write(testPdf1);
    // console.log('buf: ');
    // console.log(testPdf1);
    // console.log('pdfWriter------------');
    // console.log(pdfWriter);

    // pdfWriter['fieldname'] = 'document';
    // pdfWriter['originalname'] = `${filename}.pdf`;
    // pdfWriter['buffer'] = pdfWriter['_writableState']['buffered'][0]['chunk'];
    // pdfWriter['mimetype'] = 'application/pdf';
    // pdfWriter['size'] = 0;
    // pdfWriter['encoding'] = '7bit';
    console.log('aws upload------------------------------------');
    const uploadPdf = await this.uploadFileToS3('chatting', pdfWriter);
    console.log('upload finsh------------------------------------');
    return uploadPdf;
  }

  async readFile(filename) {
    let testPdf1;
    let pdfWriter;
    setTimeout(function () {
      testPdf1 = fs.readFileSync(`./${filename}.pdf`);
      pdfWriter = fs.createWriteStream(
        path.join(__dirname, '..', 'output', `${filename}.pdf`),
      );
      pdfWriter.write(testPdf1);
      console.log('buf: ');
      console.log(testPdf1);
      console.log('pdfWriter------------');
      console.log(pdfWriter);

      pdfWriter['fieldname'] = 'document';
      pdfWriter['originalname'] = `${filename}.pdf`;
      pdfWriter['buffer'] = pdfWriter['_writableState']['buffered'][0]['chunk'];
      pdfWriter['mimetype'] = 'application/pdf';
      pdfWriter['size'] = 0;
      pdfWriter['encoding'] = '7bit';
    }, 3000);

    // const testPdf1 = await fs.readFileSync(`./${filename}.pdf`);
    // await pdfWriter.write(testPdf1)
    // const pdfWriter = await fs.createWriteStream(
    //   path.join(__dirname, '..', 'output', `${filename}.pdf`),
    // );
    // await pdfWriter.write(testPdf1);
    // console.log('buf: ');
    // console.log(testPdf1);
    // console.log('pdfWriter------------');
    // console.log(pdfWriter);

    // pdfWriter['fieldname'] = 'document';
    // pdfWriter['originalname'] = `${filename}.pdf`;
    // pdfWriter['buffer'] = pdfWriter['_writableState']['buffered'][0]['chunk'];
    // pdfWriter['mimetype'] = 'application/pdf';
    // pdfWriter['size'] = 0;
    // pdfWriter['encoding'] = '7bit';

    // const uploadPdf = await this.uploadFileToS3('chatting', pdfWriter);
    return pdfWriter;
  }

  async modifyPdf(pdfUrl: string) {
    const filePath = path.join(
      process.cwd(),
      'src',
      'templates',
      '1658298699176_helloPdf.pdf',
    );

    /***********************
     * aws에 PDF 읽어오기 logic
     ************************/
    //testPDF => https://chium.s3.ap-northeast-2.amazonaws.com/chatting/test.pdf
    const uint8Array = fs.readFileSync('./1658298699176_helloPdf.pdf'); //aws링크 읽어오기
    console.log('uint8Array-------------------------------------------------');
    console.log(uint8Array);

    const pdfDoc = await PDFDocument.load(uint8Array);
    console.log('pdfDoc:---------------------------------------------------');
    console.log(pdfDoc);

    const pages = pdfDoc.getPages(); //기존 PDF페이지 가져오기
    const firstPage = pages[0]; //기존 PDF페이지 인덱싱
    // const page = pdfDoc.addPage(); //페이지 넣기

    /***********************
     * aws에 이미지 읽어오기 logic
     ************************/
    // 이미지 URL =>  https://chium.s3.ap-northeast-2.amazonaws.com/chatting/KakaoTalk_20220506_110153004.png
    const arrayBuffer = fs.readFileSync('./test.jpg');
    console.log('image_arrayBuffer----------------------------------------'); //aws링크 읽어오기
    console.log(arrayBuffer);

    const jpgImage = await pdfDoc.embedJpg(arrayBuffer);
    const jpgDims = jpgImage.scale(0.05);

    const { width, height } = firstPage.getSize();
    firstPage.drawImage(jpgImage, {
      x: firstPage.moveRight(400), //이미지 좌표 설정하기
      // x: firstPage.getWidth() / 2 - jpgDims.width / 2,
      y: firstPage.moveUp(20),
      // y: firstPage.getHeight() / 2 - jpgDims.height / 2,
      width: jpgDims.width,
      height: jpgDims.getHeight,
    });

    /***********************
     * aws에 PDF 업로드 logic
     ************************/
    fs.writeFileSync('output.pdf', await pdfDoc.save());
    console.log('파일쓰기완료');
  }

  //사용자의 도장 유무 체크하기
  async checkUserSeal(userId) {}

  async getS3Object(
    key: any,
    url: any,
    callback?: (err: AWS.AWSError, data: AWS.S3.GetObjectOutput) => void,
  ) {
    try {
      await this.awsS3
        .getObject(
          {
            Bucket: 'chium',
            Key: 'test.pdf',
          },
          callback,
        )
        .promise();
    } catch (error) {
      throw new BadRequestException(`${error}`);
    }
  }

  // pdf 가져오기
  async getPdfFromS3() {
    const getPdf_s3 = await this.awsS3
      .getObject({
        Bucket: 'chium',
        Key: 'test.pdf',
      })
      .promise();
    // return stream;
    console.log(getPdf_s3.ContentType);
    // const uint8Array = fs.readFileSync(stream);
    const uint8Array = getPdf_s3.Body;
    console.log(uint8Array);
    const pdfDoc = await PDFDocument.load(uint8Array);
    console.log('pdfDoc:---------------------------------------------------');
    console.log(pdfDoc);

    const pages = await pdfDoc.getPages(); //기존 PDF페이지 가져오기
    const firstPage = pages[0]; //기존 PDF페이지 인덱싱
    // const page = pdfDoc.addPage(); //페이지 넣기

    /***********************
     * aws에 이미지 읽어오기 logic
     ************************/
    // 이미지 URL =>  https://chium.s3.ap-northeast-2.amazonaws.com/chatting/KakaoTalk_20220506_110153004.png
    // const arrayBuffer = fs.readFileSync('./test.jpg');
    const key = 'test.png';
    const s3Img = await this.getImageFromS3(key);
    const arrayBuffer = s3Img.Body;
    console.log('image_arrayBuffer----------------------------------------'); //aws링크 읽어오기
    console.log(arrayBuffer);

    //이미지 유효성 검사
    // if (s3Img.ContentType == 'image/png') {
    // } else if (s3Img.ContentType == 'image/jpg') {
    // } else {
    //   return '도장의 이미지 형식이 올바르지 않습니다';
    // }

    const pngImage = await pdfDoc.embedPng(arrayBuffer);
    const { width, height } = await firstPage.getSize();
    const pngDims = await pngImage.scaleToFit(90, 90);
    // const pngDims = pngImage.scale(0.5);
    console.log('pngDims:-------------------------------------------');
    console.log(pngDims);

    console.log('drawImage Start:------------------------------');
    firstPage.drawImage(pngImage, {
      // x: firstPage.moveRight(5),
      //   x: firstPage.getWidth() / 2 - pngDims.width / 2,
      //   y: firstPage.moveUp(5),
      //   y: firstPage.getHeight() / 2 - pngDims.height / 2,
      x: 450, //이미지 좌표 설정하기 - 가로
      y: 50, //이미지 좌표 설정하기 - 높이
      width: pngDims.width,
      height: pngDims.height,
    });

    const htmlName = 'testPdf005';
    // fs.writeFileSync('output.pdf', await pdfDoc.save());
    const contractPdfPath = path.join(
      __dirname,
      '..',
      'output',
      `${htmlName}.pdf`,
    );
    const pdfWriter = await fs.createWriteStream(
      path.join(__dirname, '..', 'output', `${htmlName}.pdf`),
    );
    const buf = await pdfDoc.save();
    console.log(
      'before pdfWriter.write(buf)---------------------------------------------',
    );
    await pdfWriter.write(buf);
    console.log('buf: ');
    console.log(buf);
    console.log(
      'after pdfWriter.write(buf)---------------------------------------------',
    );
    await pdfWriter.end();
    console.log(
      'pdfWriter-------------------------------------------------------------',
    );
    console.log(pdfWriter);
    // const writer = fs.writeFileSync(contractPdfPath, await pdfDoc.save());
    // console.log('writer:------------------------------');
    console.log('chunk------------------------------------------------');
    console.log(pdfWriter['_writableState']['buffered'][0]['chunk']);
    pdfWriter['fieldname'] = 'document';
    pdfWriter['originalname'] = `${htmlName}.pdf`;
    pdfWriter['buffer'] = pdfWriter['_writableState']['buffered'][0]['chunk'];
    pdfWriter['mimetype'] = 'application/pdf';
    pdfWriter['size'] = 0;
    pdfWriter['encoding'] = '7bit';

    console.log('pdfWriter----------------------------------');
    console.log(pdfWriter);
    const result = await this.uploadFileToS3('chatting', pdfWriter);
    console.log('result:------------------------------');
    console.log(result);
    console.log('파일쓰기완료');
    const deletePdf = await this.cancleFile(htmlName);
    console.log('deletePdf---------------------------------------');
    console.log(deletePdf);
    return result;
  }

  //s3에서 이미지 가져오기
  async getImageFromS3(key) {
    const getImage_s3 = await this.awsS3
      .getObject({
        Bucket: 'chium',
        Key: 'test.png',
      })
      .promise();
    return getImage_s3; //buffer 형식을 리턴
  }

  //PDF 업로드 함수 => aws에서 호출하기
  async uploadFileToS3(folder, file) {
    console.log(file);
    console.log(folder);
    try {
      //   console.log('S3_BUCKET_NAME : ' + this.S3_BUCKET_NAME);
      //   console.log('awsupload begin1' + ' . ' + file.fieldname);
      const key = `${folder}/${Date.now()}_${path.basename(
        file.originalname,
      )}`.replace(/ /g, ''); //폴더명을 삽입하여 key 발급
      // const key = `${Date.now()}_${files[idx].originalname}`.replace(/ /g, '');
      console.log('key: ' + key);
      const s3Object = await this.awsS3
        .putObject({
          Bucket: 'chium',
          Key: key,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
        })
        .promise();
      console.log('aws-upload finished');
      // return { key, s3Object, contentType: files[idx].mimetype };
      console.log('key: ' + key);
      console.log(s3Object);
      const fileUrl = await this.getAwsS3FileUrl(key);
      return { data: { fileUrl } };
    } catch (error) {
      throw new BadRequestException(`File upload failed : ${error}`);
    }
  }

  async getAwsS3FileUrl(objectKey: string) {
    return `https://chium.s3.amazonaws.com/${objectKey}`;
  }

  async puppeteerPdf(html: string, originalname: string) {
    const browser = await puppeteer.launch();
    const htmlPath = path.resolve(
      __dirname,
      '..',
      'output',
      `${originalname}.html`,
    );
    fs.promises.writeFile(htmlPath, html);
    const htmluri =
      'file://' +
      path.resolve(__dirname, '..', 'output', `${originalname}.html`);
    const page = await browser.newPage();
    await page.goto(htmluri, {
      waitUntil: 'networkidle0',
    });
    console.log(page);
    await page.setContent(html);
    const buffer = await page.pdf({ format: 'A4' });
    await browser.close();
    console.log(buffer);
    const result = await this.printPDF(buffer);
    return result;
  }

  async printPDF(buffer) {
    console.log('buffer');
    // console.log(pdf)
    const buf = buffer;
    const htmlName = `${Date.now()}`;
    // path.join(`/home/goldhanwool/workspace/chium/venv_chium_back_nestjs/chium_back_nestjs/src/modules/contract/output/${htmlName}.pdf`));
    const writer = await fs.createWriteStream(
      path.join(__dirname, '..', 'output', `${htmlName}.pdf`),
    );
    await writer.write(buf);
    writer.end();

    // console.log(JSON.stringify(writer))
    // 디렉토리 불러와서 PDF 문서 찾아서 바로 S3에 업로드 하기
    // var dir = 'jsons';
    // var files = fs.readdirSync(); // 디렉토리를 읽어온다
    // return await this.uploadS3Pdf(htmlName)

    writer['fieldname'] = 'document';
    writer['originalname'] = `${htmlName}.pdf`;
    writer['buffer'] = writer['_writableState']['buffered'][0]['chunk'];
    writer['mimetype'] = 'application/pdf';
    writer['size'] = 0;
    writer['encoding'] = '7bit';
    console.log(writer);

    const result = await this.uploadFileToS3('chatting', writer);
    const pathPdf = `${htmlName}.pdf`;
    // const pathHtml = `${htmlName}.html`;
    const pathHtml = 'helloPdf.html';

    console.log(pathHtml);
    await this.cancleFile(pathPdf);
    await this.cancleFile(pathHtml);

    return result;
  }

  async cancleFile(htmlName) {
    console.log('파일삭제시도');
    //파일삭제 => fs.unlink
    //   fs.unlink(
    //     path.join(__dirname, '..', 'output', `${htmlName}.pdf`),
    //     function (err) {
    //       if (err === null) {
    //         console.log('success');
    //         return 'success';
    //       } else {
    //         return 'fail';
    //       }
    //     },
    //   );
    //   console.log('파일삭제마지막');
    //   return 'delete-success';
    // }
    fs.unlink(
      path.join(__dirname, '..', 'output', `${htmlName}`),
      function (err) {
        if (err === null) {
          console.log('success');
          return 'success';
        } else {
          return 'fail';
        }
      },
    );
    console.log('파일삭제마지막');
    return 'delete-success';
  }
} //ContractService

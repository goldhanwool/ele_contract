import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { writer } from 'repl';
import hbs from 'hbs';
import { moveMessagePortToContext } from 'worker_threads';
import { doc } from 'prettier';
// import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as puppeteer from 'puppeteer';
import * as fetch from 'fetch';

// const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const pug = require('pug');
// const fileUrl = require("file-url");
const { exit } = require('process');
// const moment = require('moment');
const html2pug = require('html2pug');
const { degrees, PDFDocument, StandardFonts, rgb } = require('pdf-lib');
//const fetch = require('fetch');
var fetchUrl = require('fetch').fetchUrl;
const PImage = require('pureimage');
var jpeg = require('jpeg-js');
const pdf = require('html-pdf');
const options = { format: 'A4' }; //용지 크기 설정


@Injectable()
export class AppService {
  constructor() {}
  // async compile(templateName, data) {
  //   const htmlName = Date.now();
  //   const filePath = path.join(
  //     process.cwd(),
  //     'templates',
  //     `${templateName}.hbs`,
  //   );
  //   const html = await fs.readFile(filePath, 'utf-8');
  //   console.log(html);
  //   return hbs.compile(html)(data);
  // }
  // async html2pug() {
  // }

  // htlm태그를 pdf로 생성하기
  async convertHtmlToPdf(html: string, originalname: string) {
    const filename = `${Date.now()}_${path.basename(originalname)}`.replace(/ /g, '',);
    pdf.create(html, options).toFile(`./${filename}.pdf`, function (err, res) {
      if (err) return console.log(err);
      console.log(res); // { filename: '/app/businesscard.pdf' }
    });
    return filename; //aws링크
  }

  async modifyPdf() {
    const filePath = path.join(
      process.cwd(),
      'src',
      'templates',
      '1658298699176_helloPdf.pdf',
    );

    /***********************
     * aws에 PDF 읽어오기 logic
    ************************/

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

  async createPdf() {
    const pdfDoc = await PDFDocument.create();
    console.log('---------------------------------------------------');
    console.log('pdfDoc: ');
    console.log(pdfDoc);
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    console.log('timesRomanFont: ');
    console.log(timesRomanFont);

    const page = pdfDoc.addPage();
    console.log('---------------------------------------------------');
    console.log('page: ');
    console.log(page);
    const { width, height } = page.getSize();
    // pdf에 text 적기
    // const fontSize = 30;
    // page.drawText('Creating PDFs in JavaScript is awesome!', {
    //   x: 50,
    //   y: height - 4 * fontSize,
    //   size: fontSize,
    //   font: timesRomanFont,
    //   color: rgb(0, 0.53, 0.71),
    // });
    const img = await PImage.decodeJPEGFromStream(
      fs.createReadStream('./sample.jpg'),
    );
    // const img = fs.readFile('./sample.jpg', function (err, data) {
    //   console.log(data);
    // });
    console.log('---------------------------------------------------');
    console.log('img: ');
    console.log(img);
    console.log(img.data);

    const jpegData = fs.readFileSync('./sample.jpg');
    const rawImageData = jpeg.decode(jpegData);
    console.log(rawImageData);

    const jpgImage = await pdfDoc.embedJpg(img.data);
    console.log('---------------------------------------------------');
    console.log('jpgImage: ');
    console.log(jpgImage);
    const jpgDims = jpgImage.scale(0.25);
    const image = await pdfDoc.embedJpg(img);
    image.scale(1);
    console.log('---------------------------------------------------');
    console.log(image);

    // const url = './sample.jpg';
    // const img = await fetch(url).then(res => res.arrayBuffer());

    // const img = Buffer.from('./sample.jpg');

    // const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
    // console.log(jpgUrl);
    // const response = await fetch(jpgUrl);
    // console.log(response);
    // const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer());
    // console.log('---------------------------------------------------');
    // console.log('jpgImageBytes: ');
    // console.log(jpgImageBytes);
    // const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
    // console.log('---------------------------------------------------');
    // console.log('jpgImage: ');
    // console.log(jpgImage);
    // const jpgDims = jpgImage.scale(0.25)
    // const image = await pdfDoc.embedJpg(img);
    // image.scale(1);
    // console.log('---------------------------------------------------');
    // console.log(image);

    // page.drawImage(img, {
    //   x: page.getWidth() / 2 - width / 2,
    //   y: page.getWidth() / 2 - height / 2,
    // });

    // page.drawImage(jpgImage, {
    //   x: page.getWidth() / 2 - jpgDims.width / 2,
    //   y: page.getHeight() / 2 - jpgDims.height / 2,
    //   width: jpgDims.width,
    //   height: jpgDims.height,
    // });

    // const pdfPath = path.resolve(__dirname, '..', 'views');

    // fs.writeFilesSync => writeFile로 교체해야함.
    fs.promises.writeFile('./output.pdf', await pdfDoc.save());

    // fs.createWriteStream('./output.pdf', await pdfDoc.save());

    const pdfBytes = await pdfDoc.save();
    console.log('---------------------------------------------------');
    console.log('pdfBytes: ');
    console.log(pdfBytes);
    // download(pdfBytes, "pdf-lib_modification_example.pdf", "application/pdf");
  }

  async compile(templateName, data) {
    const filePath = path.join(
      process.cwd(),
      'src',
      'templates',
      `${templateName}.hbs`,
    );
    const html = await fs.readFile(filePath, 'utf-8');
    console.log(html);
    return hbs.compile(html)(data);
    // return html;
  }

  async makePdf(data) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      console.log(data);
      const content = await this.compile('index007', data);
      await page.setContent(content);
      // await page.emulateMedia('screen');
      await page.pdf({
        path: 'test.pdf',
        format: 'A4',
        printBackground: true,
      });
      console.log('done');
      await browser.close();
      process.exit();
    } catch (e) {
      console.log('error', e);
    }
  }
}



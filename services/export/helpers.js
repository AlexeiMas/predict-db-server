const path = require('path');
const fs = require('fs');

const HEADER_ROW = 3;
const START_COLUMN = 3;

const sheetOptions = {
  sheetFormat: {
    defaultColWidth: 30,
    defaultRowHeight: 20,
  },
};

const alignmentStyle = {
  alignment: {
    vertical: 'center',
    horizontal: 'center',
  },
};

const greyHeaderStyle = {
  font: {
    bold: true,
  },
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: '#F2F2F2',
  },
};

const blueHeaderStyle = {
  font: {
    bold: true,
  },
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: '#D1DAE7',
  },
};

const redBoldFontStyle = {
  font: {
    bold: true,
    color: '#FF0000',
  },
};

const mutationsFillStyle = {
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: '#21C5FF',
  },
};

const copyNumbersFillStyle = {
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: '#BDD7EE',
  },
};

const expressionsFillStyle = {
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: '#FEE597',
  },
};

const fusionsFillStyle = {
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: '#F7CAAC',
  },
};

const setSheetBasicLayout = (sheet, isNgs = false) => {
  sheet.column(1).setWidth(15);
  sheet.column(2).setWidth(15);
  sheet.column(3).setWidth(15);
  sheet.column(4).setWidth(30);
  sheet.column(5).setWidth(30);

  sheet.column(isNgs ? 7 : 5).freeze();
  sheet.row(3).freeze();
  sheet.row(3).filter();

  sheet.cell(4, 1).string('© Imagen Therapeutics').style(alignmentStyle);

  sheet.addImage({
    image: fs.readFileSync(path.resolve(__dirname, 'logo.png')),
    type: 'picture',
    position: {
      type: 'absoluteAnchor',
      x: '0.05in',
      y: '0.11in',
    },
  });
};

const setColumnGrouping = (sheet, number, start, finish) => {
  for (let i = start; i < finish; i++) {
    sheet.column(i).group(number, true);
  }
};

const fillHeaderFields = (sheet, fields) => {
  fields.map((cell, index) => {
    const columnNumber = START_COLUMN + index;
    sheet.cell(HEADER_ROW, columnNumber).string(cell).style(alignmentStyle);
    return cell;
  });
};

const fillValues = (sheet, values, startCol = START_COLUMN) => {
  values.map((row, rowIndex) => {
    const rowNumber = rowIndex + HEADER_ROW + 1;

    row.map((cell, cellIndex) => {
      const columnNumber = startCol + cellIndex;
      if (typeof cell === 'number') {
        sheet.cell(rowNumber, columnNumber).number(cell).style(alignmentStyle);
      } else {
        sheet.cell(rowNumber, columnNumber).string(cell).style(alignmentStyle);
      }
      return cell;
    });

    return rowNumber;
  });
};
const queryInfoHeaderStyleFillGray25 = {
  font: {
    bold: true,
  },
  fill: {
    type: 'pattern',
    patternType: 'solid',
    fgColor: '#DCDCDC',
  },
};

const queryInfoSheetLabelAlignmentStyle = {
  alignment: {
    vertical: 'center',
    horizontal: 'left',
  },
};

const setSheetQueryInfoLayout = (sheet) => {
  sheet.column(1).setWidth(12);
  sheet.column(2).setWidth(12);

  sheet.column(10).setWidth(50);
  sheet.column(11).setWidth(50);
  sheet.column(12).setWidth(50);
  sheet.column(13).setWidth(50);

  sheet.cell(4, 1).string('© Imagen Therapeutics').style(queryInfoSheetLabelAlignmentStyle);

  sheet.addImage({
    image: fs.readFileSync(path.resolve(__dirname, 'logo.png')),
    type: 'picture',
    position: {
      type: 'absoluteAnchor',
      x: '0.05in',
      y: '0.11in',
    },
  });
};

module.exports = {
  sheetOptions,
  alignmentStyle,
  greyHeaderStyle,
  blueHeaderStyle,
  redBoldFontStyle,
  mutationsFillStyle,
  copyNumbersFillStyle,
  expressionsFillStyle,
  fusionsFillStyle,
  setSheetBasicLayout,
  setColumnGrouping,
  fillHeaderFields,
  fillValues,

  queryInfoHeaderStyleFillGray25,
  setSheetQueryInfoLayout,
};

/*
  Fill color must be an RGB value, Excel color (
  aqua,
    black,
    blue,
    blue-gray,
    bright green,
    brown,
    dark blue,
    dark green,
    dark red,
    dark teal,
    dark yellow,
    gold,
    gray-25,
    gray-40,
    gray-50,
    gray-80,
    green,
    indigo,
    lavender,
    light blue,
    light green,
    light orange,
    light turquoise,
    light yellow,
    lime,
    olive green,
    orange,
    pale blue,
    pink,
    plum,
    red,
    rose,
    sea green,
    sky blue,
    tan,
    teal,
    turquoise,
    violet,
    white,
    yellow)

    or Excel theme (
      dark 1,
    light 1,
    dark 2,
    light 2,
    accent 1,
    accent 2,
    accent 3,
    accent 4,
    accent 5,
    accent 6,
    hyperlink,
    followed hyperlink)
*/

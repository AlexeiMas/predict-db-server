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

  sheet.cell(4, 1, 4, 2, false).string('© Imagen Therapeutics').style(alignmentStyle);

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
};

//works well with tricky  firewalls 

function doGet(request) {
    var output = ContentService.createTextOutput();
    var data = {};
  
  // takes the parameters from the request. ID = spreadsheet id. Sheet = name of sheet you want to get data from
    var id = request.parameters.id;
    var sheet = request.parameters.sheet; 
    var timeStamp = (request.parameters.time !== undefined && request.parameters.time.toString() === 'include' ? true : false);
    var ss = SpreadsheetApp.openById(id);
    var sheetName = ss.getSheetByName(sheet);
  
  //if sheet doesn't exist create a new one from the master sheet
    if(sheetName === null){
      var copySheet = ss.getSheetByName('master-sheet');
      var headerCopy = copySheet.getRange(1, 1, 1, copySheet.getLastColumn());
      ss.insertSheet(String(sheet));
      var sheetName = ss.getSheetByName(String(sheet));
      var headerInsert = sheetName.getRange(1, 1, 1, 1);
      headerCopy.copyTo(headerInsert);
    }
  
  //get the sheets unique id and add to json (helps linking back to)
    var gid = sheetName.getSheetId();
    data[gid] = readData_(ss, sheet, timeStamp);
  
    var callback = request.parameters.callback;
    if (callback == undefined) {
      output.setContent(JSON.stringify(data));
      output.setMimeType(ContentService.MimeType.JSON);
    }
    else {
      output.setContent(callback + "(" + JSON.stringify(data) + ")");
      output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return output;
  }
  
  // reads through the rows of the sheet and puts in to JSON string
  function readData_(ss, sheetname, timeStamp, properties) {
    
    if (typeof properties == "undefined") {
      properties = getHeaderRow_(ss, sheetname);
    }
    
    var rows = getDataRows_(ss, sheetname);
    var data = [];
    for (var r = 0, l = rows.length; r < l; r++) {
      var row = rows[r];
      var record = {};
      for (var p in properties) {
           record[properties[p]] = convert_(row[p]);  
      }
      data.push(record);
    }

    return data;
  }
  
  
function convert_(value){
  if (value === true) return 'True';
  if (value === false) return 'False';
  return value;
}

  
  function getDataRows_(ss, sheetname) {
    var sh = ss.getSheetByName(sheetname);
    if(sh.getLastRow() > 1){
      return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
    }else{
      return '';
    }
  }
 
  
  function getHeaderRow_(ss, sheetname) {
  
    var sh = ss.getSheetByName(sheetname);
    return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  
  }
  

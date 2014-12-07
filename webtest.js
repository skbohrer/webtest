'use strict';

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;


// Global vars for the file name and data to write
// (is there a better way to get arguments into a nested callback func?)
var theFileName, theFileData;

// error codes from plugin doc
/*
    1 = NOT_FOUND_ERR
    2 = SECURITY_ERR
    3 = ABORT_ERR
    4 = NOT_READABLE_ERR
    5 = ENCODING_ERR
    6 = NO_MODIFICATION_ALLOWED_ERR
    7 = INVALID_STATE_ERR
    8 = SYNTAX_ERR
    9 = INVALID_MODIFICATION_ERR
    10 = QUOTA_EXCEEDED_ERR
    11 = TYPE_MISMATCH_ERR
    12 = PATH_EXISTS_ERR
*/



function errorHandler(e) {
  var msg = '';


  switch (e.code) {
    case 1:
      msg = 'NOT_FOUND_ERR';
      break;
    case 2:
      msg = 'SECURITY_ERR';
      break;
    case 3:
       msg = 'ABORT_ERR';
      break;
    case 4:
      msg = 'NOT_READABLE_ERR';
      break;
    case 5:
      msg = 'ENCODING_ERR';
      break;
    case 6:
      msg = 'NO_MODIFICATION_ALLOWED_ERR';
      break;
    case 7:
      msg = 'INVALID_STATE_ERR';
      break;
    case 8:
      msg = 'SYNTAX_ERR';
      break;
    case 9:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case 10:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case 11:
      msg = 'TYPE_MISMATCH_ERR';
      break;
    case 12:
      msg = 'PATH_EXISTS_ERR';
      break;
    default:
      msg = 'Unknown Error. Code ==' + e.code;
      break;
  }

  alert('Error: ' + msg);
}


function onGetDirectory(dirEntry) {

  dirEntry.getFile(theFileName, {create: true}, function(fileEntry) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {
      var blob;

      fileWriter.onwriteend = function(e) {
        alert('Success! Write completed.');
      };

      fileWriter.onerror = function(e) {
        alert('Write failed: ' + e.toString());
      };

      // Create a new Blob and write it to log.txt.
      blob = new Blob([theFileData], {type: 'text/plain'});

      fileWriter.write(blob);

    }, errorHandler);

  }, errorHandler);

}


function doFileClick() {
  theFileName = document.getElementById('fileName').value.trim();

  if (!theFileName) {
    alert('File Name can not be blank');
    return;
  }

  theFileData = document.getElementById('srcText').innerHTML;

  window.requestFileSystem(window.PERSISTENT, 5*1024*1024, function(fs) {
    fs.root.getDirectory('AndFileTest', {create: true}, onGetDirectory, errorHandler);
  }, errorHandler);
}



// Call on Android device ready event and also directly for PC testing. Thus
// init may be called twice
function init() {
  document.getElementById('writeFile').onclick = doFileClick;
}

// Wait for device API libraries to load
document.addEventListener("deviceready", init, false);

init();


'use strict';
/*jslint browser: true, devel: true, white: true */

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;


// Global vars for the file name and data to write
// (is there a better way to get arguments into a nested callback func?)
var theFileName, theUrl;

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


function encodePW() {
	var user, pw;
	
	user = document.getElementById('user').value.trim();
	pw = document.getElementById('pass').value.trim();
	return 'Basic ' + window.btoa(user + ':' + pw);
}

function onDlSuccess(entry) {
	alert("File download complete: " + entry.toURL());
}

function onErr(error) {
	var eStr = 'File transfer error: Source: ' + error.source + '\n';
        eStr += 'Target: ' + error.target + '\n';
        eStr += 'HTTP-Status: ' + error.http_status + '\n';
        eStr += 'Exception: ' + error.exception;
		alert(eStr);
}

function onGetDownDir(dirEntry) {
	dirEntry.getFile(
		theFileName, 
		{create: true}, 
		function(fileEntry) {
			var fileTransfer = new FileTransfer();
		
			fileTransfer.download(
				theUrl,
				fileEntry.toURL(),
				onDlSuccess,
				onErr,
				true,
				{
					headers: {'Authorization' : encodePW()}
				}
			);
		}, 
		errorHandler
	);
}

function onUlSuccess(ulres) {
	var eStr = 'Upload Success!\n'; 
		eStr += 'BytesSent: ' + ulres.bytesSent + '\n';
        eStr += 'ResponseCode: ' + ulres.responseCode + '\n';
        eStr += 'Response: ' + ulres.response + '\n';
        eStr += 'Headers: ' + ulres.headers;
		alert(eStr);
}


function onGetUpDir(dirEntry) {
	dirEntry.getFile(
		theFileName, 
		{create: false}, 
		function(fileEntry) {
			var fileTransfer = new FileTransfer(),
				options = new FileUploadOptions();
			logit("getFileHandler");
			options.fileKey = "file";
			options.fileName = theFileName;
			options.httpMethod = "POST";
			options.chunkedMode = false;
			options.mimeType = "text/plain";
			options.headers = {'Authorization' : encodePW()};
	
			fileTransfer.upload(
				fileEntry.toURL(),
				theUrl,
				onUlSuccess,
				onErr,
				options,
				true
			);
		}, 
		errorHandler
	);
}

function doDownloadClick() {
	theFileName = document.getElementById('fileName').value.trim();
	theUrl = document.getElementById('url').value.trim();
	  
	if (theUrl) {
		theUrl = encodeURI(theUrl);
	} else {
		alert('URL can not be blank');
	}

	if (!theFileName) {
		alert('File Name can not be blank');
		return;
	}

	window.requestFileSystem(
		window.PERSISTENT, 
		5*1024*1024, 
		function(fs) {
			fs.root.getDirectory(
				'RideCheck', 
				{create: true}, 
				onGetDownDir, 
				errorHandler
			);
		}, 
		errorHandler
	);
}

function doUploadClick() {
	theFileName = document.getElementById('fileName').value.trim();
	theUrl = document.getElementById('url').value.trim();
	  
	if (theUrl) {
		theUrl = encodeURI(theUrl);
	} else {
		alert('URL can not be blank');
		return;
	}

	if (!theFileName) {
		alert('File Name can not be blank');
		return;
	}

	clearLog();
	logit("Upload Click");
	logit(theUrl);
	logit("upload file:" + theFileName);

	window.requestFileSystem(
		window.PERSISTENT, 
		5*1024*1024, 
		function(fs) {
			fs.root.getDirectory(
				'RideCheck', 
				{create: false}, 
				onGetUpDir, 
				errorHandler
			);
		}, 
		errorHandler
	);
}

function doGetDirClick() {
	var xhr =  new XMLHttpRequest(),
		theTimeout = null;
	clearLog();
	
	theUrl = document.getElementById('url').value.trim();
	  
	if (theUrl) {
		if (theUrl.slice(-1) !== '/') {
			theUrl += '/';
		}
		theUrl = encodeURI(theUrl + '~files.lst');
	} else {
		alert('URL can not be blank');
		return;
	}
	logit(theUrl);

	xhr.open('GET', theUrl, true);
	xhr.responseType = 'text';
	xhr.setRequestHeader('Authorization', encodePW());
	
	xhr.onload = function(e) {
		clearTimeout(theTimeout);
		if (this.status === 200) {
			alert('Got Dir:\n' + this.response);
		} else {
			alert('GetDir OnLoad Bad result: ' + this.status + " -> " + this.statusText);
		}
	};
	
	xhr.onerror = function(e) {
		clearTimeout(theTimeout);
		alert('Get Dir Error: ');
	};
	
	theTimeout = setTimeout(function (){xhr.abort(); alert('GetDir Timed Out!');}, 4000);
	xhr.send();
}


// Call on Android device ready event 
function init() {
  document.getElementById('downloadFile').onclick = doDownloadClick;
  document.getElementById('uploadFile').onclick = doUploadClick;
  document.getElementById('getDir').onclick = doGetDirClick;
}

var logStr = "";

function clearLog() {
	logStr = "";
	document.getElementById('logText').value = logStr;
}

function logit(theStr) {
	logStr += " |" + theStr;
	document.getElementById('logText').value = logStr;
}


// Wait for device API libraries to load
document.addEventListener("deviceready", init, false);


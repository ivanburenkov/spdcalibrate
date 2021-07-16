/*   This file is part of Full Statistical Mode Reconstruction Project
 *
 *   Copyright (C) 2021 Ivan Burenkov - All Rights Reserved
 *   You may use, distribute and modify this code under the
 *   terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function init() {
  //Pth = Module.cwrap("Pt", "number", ["number", "number", "number", "number"]);
  calibratespd = Module.cwrap("spdcalibrate", "number", [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number"
  ]);
}
window.onload = init();
function cArray(size) {
  var offset = Module._malloc(size * 8);
  Module.HEAPF64.set(new Float64Array(size), offset / 8);
  return {
    data: Module.HEAPF64.subarray(offset / 8, offset / 8 + size),
    offset: offset,
    size: size
  };
}
function cFree(cArrayVar) {
  Module._free(cArrayVar.offset);
}
function cArrayInt(size) {
  const nBytes = Int32Array.BYTES_PER_ELEMENT;
  const offset = Module._malloc(size * nBytes);
  return {
    data: Module.HEAP32.subarray(offset / nBytes, offset / nBytes + size),
    offset: offset,
    size: size
  };
}
/* 
//This function executes code when WASM has finished loading
Module["onRuntimeInitialized"] = function () {
  //console.log("wasm loaded");
  //runCcode();
};
 */
//Global vars
var tsvG2Values = "";
var tsvClickValues = "";
var tsvAfterpulseValues = "";
var t0; // = performance.now()
var t1; // = performance.now()
var dataLength;
var tmult;
var tres;
var norm=1.0;
var islog=0;
var isnorm=0;
var myArray;
var c;
var histlength=400;
var firstRun=1;

document.getElementById('inputfile') 
			.addEventListener('change', function() {
        //var name = document.getElementById('inputfile').files.item(0).name;  
        //alert('Selected file: ' + name.files.item(0).name);
			var nn;
			var fr=new FileReader; 
			fr.onload=function(){ 
				//document.getElementById('output').textContent=fr.result;
				var b = fr.result.split('\n')
				var a=[];
				height=b.length-1;
				width=1;
				for(const i in b){
					a.push(b[i].split('\t').map(Number));
					if(a[i].length>width){
						width=a[i].length;
            nn=width*length;
					}
				}
        dataLength=nn;
				a.pop();
				var x = Math.floor(400/width);
				var y = Math.floor(400/height);
				c = a.flat();
				myArray = cArray(width*height);
				if(!c.some(isNaN)){
				  for(const i in c){
				    myArray.data[i]=c[i];
				    dataready=true;
				  }
					/* for(const i in a){
						for(const j in a[i]){
						ctx.fillStyle = 'rgb('+a[i][j]*10+','+a[i][j]*10+','+a[i][j]*10+')';
						ctx.fillRect(j*x,i*y,(j+1)*x,(i+1)*y);
						}
					}  */
          ////////////////////////////////////
          //document.getElementById('plotlyDivLabel').innerHTML="<h2>Loaded data</h2><span id='plotlyDiv'></span>";
          //produceOutput('plotlyDiv',nn,myArray);
		
          //myArrayg2 = cArrayInt(599);
          //calcg2(myArray.offset,width*height,1,myArrayg2.offset);
          //produceOutput('plotlyDiv',599,myArray);
          

          ////////////////////////////////////
				} else {
					alert("Uploaded file contains nonnumerical values");
				}
				//document.getElementById('res').innerHTML=makeTableHTML(a);
			} 
	fr.onprogress = function(data) {
		if (data.lengthComputable) {                                            
		  var valeur= Math.round((data.loaded * 100) / data.total);
		  $('.progress-bar').css('width', valeur+'%').attr('aria-valuenow', valeur);
		    //console.log(progress);
		}
	      }					
          document.getElementById('fileLoaded').innerHTML="Now, please, set desired parameters and hit 'Calculate!' button.";
			fr.readAsText(this.files[0]); 
  showonlyID('g2controls');

		}) 


function runCcodeG2() {
  document.getElementById('fileLoaded').innerHTML="Calculating ... <div class='spinner-border' role='status'>  <span class='visually-hidden'>Loading...</span></div>";
  setTimeout(function(){runCcodeG2true();},100);
}
function runCcodeG2true() {
  t0 = performance.now();

  myArrayg2 = cArrayInt(histlength);
  myArrayClics = cArrayInt(5*histlength);
  tmult = document.getElementById("sLoss").value;
  tres = document.getElementById("tRes").value;
  var binconversion = tmult/tres;
  //console.log(binconversion);
  //console.log(HEAPF64[(myArray.offset)/8],HEAPF64[(myArray.offset)/8+width*height-1],HEAP32[(myArrayg2.offset)/4],HEAP32[(myArrayg2.offset)/4+598]);
  //console.log(myArray,width*height,binconversion,myArrayg2,norm);
  norm=calibratespd(myArray.offset,width*height,binconversion,myArrayg2.offset,myArrayClics.offset,norm);
  //console.log(myArray,width*height,binconversion,myArrayg2,norm);
  //console.log(HEAPF64[(myArray.offset)/8],HEAPF64[(myArray.offset)/8+width*height-1],HEAP32[(myArrayg2.offset)/4],HEAP32[(myArrayg2.offset)/4+598]);
  //document.getElementById('plotlyDiv').innerHTML="<h2>Reconstructed data</h2><span id='plotlyDivG2'></span>";
  
  plotAll();

  t1 = Math.floor(performance.now() - t0);
if(firstRun==1){
  hideonlyID('fitIntro');
  showonlyID('tsvdata');
  showonlyID('LogScale');		
  showonlyID('NormG2');
  firstRun=0;	
}
  document.getElementById("timing").innerHTML = "Done in " + t1 + " ms";
  //cFree(myArrayg2);
  //cFree(myArrayClics);
}

function plotAll(){
  var title="Second-order autocorrelation function (start-multistop)";
  produceOutput('plotlyDiv',histlength,myArrayg2.data,islog,isnorm,title,0);
  title="Second-order autocorrelation function (start-single stop)";
  produceOutputClicks('plotlyDivClics',histlength,myArrayClics.data,islog,0,title);
  var afterpulse=[];
  for(i=0;i<histlength;i++)myArrayg2.data[i]-norm>0 ? afterpulse[i]=myArrayg2.data[i]-norm : afterpulse[i]=0;
  title="Afterpulsing profile of the detector";
  produceOutput('plotlyDivAfterpulse',histlength,afterpulse,islog,0,title,1);
}

function produceOutput(divName,sizeXY,dataCArray,islog,isnorm,title,tsvdata){
  let nn=sizeXY;
  var g2Values = [];
  var tValues = [];
  var g2ValuesErr = [];
  var tsv = "";
  var tunit;
  var tunitmul;
  if(tres<10){
    tunit="ns";
    tunitmul=1;
  } else {
    if(tres<10000){
      tunit="us";
      tunitmul=1000;
    } else {
      if(tres<10000000){
        tunit="ms";
        tunitmul=1000000;
      }
    }
  }
  for (i = 0; i < nn; i++) {
    if(isnorm==1){
      tValues[i]=i*tres/tunitmul;
      g2Values[i] = dataCArray[i]/norm;
      //g2ValuesErr[i]=Math.sqrt(g2Values[i]/norm);
    } else {
      tValues[i]=i*tres/tunitmul;
      g2Values[i] = dataCArray[i];
      //g2ValuesErr[i]=Math.sqrt(g2Values[i]);
    }
    if (i == nn - 1) {
      tsv = tsv + tValues[i] + "\t" + g2Values[i];
    } else {
      tsv = tsv + tValues[i] + "\t" + g2Values[i] + "\n";
    }
  }
  if(tsvdata==0)tsvG2Values=tsv;
  if(tsvdata==1)tsvAfterpulseValues=tsv;
  document.getElementById("datatsv").value = tsvG2Values;
  
  var data = [
    {
      x: tValues,
      y: g2Values,
      /* error_y: {
        type: 'data',
        array: g2ValuesErr,
        visible: true
      }, */
      xaxis: "Delay",
      yaxis: "<var>G</var><sup>(2)<sup>(<var>t</var>)",
      type: 'scatter'
    }
  ];
  var plotlyButtons = {
    modeBarButtonsToRemove: ["toImage", "sendDataToCloud"],
    modeBarButtonsToAdd: [
      {
        name: "Save as SVG",
        icon: Plotly.Icons.camera,
        click: function (gd) {
          Plotly.downloadImage(gd, { format: "svg" });
        }
      }
    ]
  };
  if(islog==1){
    var plotlyLayout = {
      title: title,
      xaxis: {title: 't, '+tunit},
      yaxis: {title: "G<sup>(2)</sup>(t)",
      type: 'log',
          autorange: true
        }
    };
  } else {
    var plotlyLayout = {
      title: title,
      xaxis: {title: 't, '+tunit},
      yaxis: {title: "G<sup>(2)</sup>(t)"}
  };  
  }
  /* if(isnorm==1){
    var plotlyLayout = {
      title: "Second order autocorrelation function",
      xaxis: {title: 't, '+tunit},
      yaxis: {title: "g<sup>(2)</sup>(t)"}
    };
  } */
  Plotly.newPlot(divName, data, plotlyLayout, plotlyButtons);
}

function produceOutputClicks(divName,sizeXY,dataCArray,islog,isnorm,title){
  let nn=sizeXY;
  var g2Values = [];
  var tValues = [];
  //var g2ValuesErr = [];
  //tsvG2Values = "";
  var tsv="";
  var tunit;
  var tunitmul;
  if(tres<10){
    tunit="ns";
    tunitmul=1;
  } else {
    if(tres<10000){
      tunit="us";
      tunitmul=1000;
    } else {
      if(tres<10000000){
        tunit="ms";
        tunitmul=1000000;
      }
    }
  }
  for(j=0;j<5;j++){
    g2Values[j]=[];
    for (i = 0; i < nn; i++) {
      if(isnorm==1){
        tValues[i]=i*tres/tunitmul;
        g2Values[j][i] = dataCArray[j*histlength+i]/norm;
        //g2ValuesErr[i]=Math.sqrt(g2Values[i]/norm);
      } else {
        tValues[i]=i*tres/tunitmul;
        g2Values[j][i] = dataCArray[j*histlength+i];
        //g2ValuesErr[i]=Math.sqrt(g2Values[i]);
      }
    }
  }

  for (i = 0; i < nn; i++) {
    tsv = tsv + tValues[i];
    for(j=0;j<5;j++)tsv = tsv + "\t" + g2Values[j][i];
    if (i != nn - 1) {
      tsv = tsv + "\n";
    } 
  }
  tsvClickValues=tsv;
  //document.getElementById("datatsv").value = tsvG2Values;
  
  var data = [];
  for(j=0;j<5;j++){
    i=j+1;
    data[j]=
    {
      x: tValues,
      y: g2Values[j],
      /* error_y: {
        type: 'data',
        array: g2ValuesErr,
        visible: true
      }, */
      name: "Detection number "+i,
      xaxis: "Delay",
      yaxis: "<var>G</var><sup>(2)<sup>(<var>t</var>)",
      type: 'scatter'
    };
  }
  var plotlyButtons = {
    modeBarButtonsToRemove: ["toImage", "sendDataToCloud"],
    modeBarButtonsToAdd: [
      {
        name: "Save as SVG",
        icon: Plotly.Icons.camera,
        click: function (gd) {
          Plotly.downloadImage(gd, { format: "svg" });
        }
      }
    ]
  };
  if(islog==1){
    var plotlyLayout = {
      title: title,
      xaxis: {title: 't, '+tunit},
      yaxis: {title: "G<sup>(2)</sup>(t)",
      type: 'log',
          autorange: true
        }
    };
  } else {
    var plotlyLayout = {
      title: title,
      xaxis: {title: 't, '+tunit},
      yaxis: {title: "G<sup>(2)</sup>(t)"}
  };  
  }
  /* if(isnorm==1){
    var plotlyLayout = {
      title: "Second order autocorrelation function",
      xaxis: {title: 't, '+tunit},
      yaxis: {title: "g<sup>(2)</sup>(t)"}
    };
  } */
  Plotly.newPlot(divName, data, plotlyLayout, plotlyButtons);
}


// var JapanTestNamesService = "https://geogratis.gc.ca/services/geoname/en/geonames.csv";
// var JapanTestNamesService = "https://raw.githubusercontent.com/yuya-0411/csv_test/refs/heads/main/geonames.csv";
var JapanTestNamesService = "hospital_status.csv";

onload=function(){
	addEventListener("zoomPanMap",  getGeoNames);
	getGeoNames();
}


var crsAD=1;
var maxItems=100;

async function getGeoNames(){
	var geoViewBox = svgMap.getGeoViewBox(); // 地理的な表示領域を得る
	var req = getJapanTestNamesReq(geoViewBox); // 表示領域をもとにサービスへのクエリを組み立てる
	var csv = await getCsv(req); // クエリを使って非同期でCSVを取得
	if ( csv.length > maxItems){ // 最大数以上の場合メッセージを出す
		messageDiv.innerText="Exceeded maximum number. Please zoom in.";
	}else{
		messageDiv.innerText="";
	}
	drawPoints(csv); // 取得したデータを可視化する
}

function getJapanTestNamesReq(geoArea){
	var area_x0=geoArea.x;
	var area_y0=geoArea.y;
	var area_x1=geoArea.x+geoArea.width;
	var area_y1=geoArea.y+geoArea.height;
	var ans = `${JapanTestNamesService}?bbox=${area_x0},${area_y0},${area_x1},${area_y1}&num=${maxItems}`;
	return ( ans );
}

async function getCsv(url){
	var response = await fetch(url); 
	var txt = await response.text();
	txt = txt.split("\n");
	var ans = [];
	for ( var line of txt ){
		// https://www.ipentec.com/document/csharp-read-csv-file-by-regex ダブルクォーテーションエスケープを加味したcsvパース
		line = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
		if (line.length > 1){
			ans.push(line);
		}
	}
	return ( ans );
}

// function drawPoints(csv){
//     removeUses();

//     const latCol = csv[0].indexOf("latitude");
//     const lngCol = csv[0].indexOf("longitude");
//     const powerStateIdx = csv[0].indexOf("電源状態");

//     svgImage.documentElement.setAttribute("property", csv[0].join(","));

//     for (let i = 1; i < csv.length; i++) {
//         const point = csv[i];
//         const lat = Number(point[latCol]);
//         const lng = Number(point[lngCol]);

//         // ✅ 電源状態の色分け
//         let powerState = point[powerStateIdx];
//         if (powerState === "GOOD") {
//             powerState = `<span style='color:green;font-weight:bold;'>${powerState}</span>`;
//         } else if (powerState === "BAD" || powerState === "OFF") {
//             powerState = `<span style='color:red;font-weight:bold;'>${powerState}</span>`;
//         }

//         // ✅ CSV行を表示内容として組み立てる（色付きの電源状態を反映）
//         const meta = [
//             point[0],              // ID
//             point[1],              // 施設名
//             point[2],              // mac_address
//             powerState,            // colored 電源状態
//             point[4],              // 消費電源
//             point[5],              // 更新時刻
//             // point[6], point[7],    // lat lng
//             ...[8, 9, 10, 11, 12].map(j => {
//                 const val = point[j]?.trim(); // ← 余分な改行や空白を除去
//                 if (val && val.startsWith("camera_streaming_data")) {
//                     console.log(`画像${j - 5}のURL:`, val);
//                     return `<button onclick="showImage('${val}')">画像${j - 7}表示</button>`;
//                 } else {
//                     return "--";
//                 }
//             })

//         ].join(",");

//         const use = svgImage.createElement("use");
//         use.setAttribute("xlink:href", "#p0");
//         use.setAttribute("content", meta);
//         use.setAttribute("x", 0);
//         use.setAttribute("y", 0);
//         use.setAttribute("transform", `ref(svg,${lng},${-lat})`);
//         svgImage.documentElement.appendChild(use);
//     }

//     svgMap.refreshScreen();
// }

function drawPoints(csv) {
    removeUses();

    const headers = csv[0];
    const latCol = headers.indexOf("latitude");
    const lngCol = headers.indexOf("longitude");
    const powerCol = headers.indexOf("電源状態");

    const excludeCols = ["latitude", "longitude", "title/Layer"];
    const displayHeaders = headers.filter(h => !excludeCols.includes(h));
    svgImage.documentElement.setAttribute("property", displayHeaders.join(","));

    for (let i = 1; i < csv.length; i++) {
        const row = csv[i];
        const lat = Number(row[latCol]);
        const lng = Number(row[lngCol]);

        const meta = [];

        for (let j = 0; j < headers.length; j++) {
            const header = headers[j];
            let value = row[j]?.trim() || "--";

            if (excludeCols.includes(header)) {
                continue;
            }

            if (header === "電源状態") {
                if (value === "GOOD") {
                    value = `<span style='color:green;font-weight:bold;'>${value}</span>`;
                } else if (value === "BAD" || value === "OFF") {
                    value = `<span style='color:red;font-weight:bold;'>${value}</span>`;
                }
            }

            // 画像カラムの処理
            if (header.startsWith("画像") && value.startsWith("camera_streaming_data")) {
                value = `<button onclick="showImage('${value}')">${header}表示</button>`;
            }

            meta.push(value);
        }

        const use = svgImage.createElement("use");
        use.setAttribute("xlink:href", "#p0");
        use.setAttribute("content", meta.join(","));
        use.setAttribute("x", 0);
        use.setAttribute("y", 0);
        use.setAttribute("transform", `ref(svg,${lng},${-lat})`);
        svgImage.documentElement.appendChild(use);
    }

    svgMap.refreshScreen();
}


function showImage(url){
	const panel = document.getElementById("imagePanel");
	const img = document.getElementById("popupImage");
	img.src = url;
	panel.style.display = "block";
}


function removeUses(){
    var uses = svgImage.getElementsByTagName("use");
    for (var i = uses.length - 1; i >= 0; i--) {
        uses[i].remove();
    }
}
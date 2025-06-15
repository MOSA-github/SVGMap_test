
// var JapanTestNamesService = "https://geogratis.gc.ca/services/geoname/en/geonames.csv";
// var JapanTestNamesService = "https://raw.githubusercontent.com/yuya-0411/csv_test/refs/heads/main/geonames.csv";
var JapanTestNamesService = "https://raw.githubusercontent.com/yuya-0411/csv_test/refs/heads/main/hospital_status.csv";

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

function drawPoints(csv){
    removeUses();

    const latCol = csv[0].indexOf("latitude");
    const lngCol = csv[0].indexOf("longitude");

    svgImage.documentElement.setAttribute("property", csv[0].join(","));

    for (let i = 1; i < csv.length; i++) {
        const point = csv[i];
        const lat = Number(point[latCol]);
        const lng = Number(point[lngCol]);

        // ✅ 複数画像URLを拾う（image_url1, image_url2, ...）という名前で列がある前提
        const imageButtons = [];
        for (let j = 1; j <= 5; j++) { // 最大5枚まで対応（必要なら拡張）
            const colName = `image_url${j}`;
            const idx = csv[0].indexOf(colName);
            if (idx !== -1 && point[idx] && point[idx].startsWith("http")) {
                const url = point[idx];
                imageButtons.push(`<button onclick="showImage('${url}')">画像${j}表示</button>`);
				// console.log(`URL >> ${url}`);
            }
        }

        const meta = [
            point[0], point[1], point[2], point[3], point[4], point[5], point[6], point[7],
            ...imageButtons
        ].join(",");

        const use = svgImage.createElement("use");
        use.setAttribute("xlink:href", "#p0");
        use.setAttribute("content", meta);
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
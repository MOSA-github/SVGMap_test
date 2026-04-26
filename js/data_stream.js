var dataUrl = "https://mosa-github.github.io/data_test_server_page/data/latest.json";
var locationMasterUrl = "../json/node_master.json"; // 座標管理ファイル

var locationMaster = {}; // 座標データを保持する変数

onload = function() {
    initSystem();
    addEventListener("zoomPanMap", getGeoNames);
};

// 最初に一度だけ座標マスターを読み込む
async function initSystem() {
    try {
        const response = await fetch(locationMasterUrl);
        locationMaster = await response.json();
        getGeoNames(); // マスター読み込み後に初回描画
    } catch (e) {
        console.error("Location master load error:", e);
    }
}

async function getGeoNames() {
    // 最新ステータスを取得
    var response = await fetch(dataUrl);
    var statusData = await response.json();
    
    drawPoints(statusData);
}

function drawPoints(data) {
    removeUses();
    
    // 1. nameカラムの見出し（スキーマ）を定義
    // ここに並べた単語が、表の左側（name）に順番に表示されます
    var schema = "部屋名,ID,状態,時刻,電力(W),緯度,経度";
    svgImage.documentElement.setAttribute("property", schema);

    for (var i = 0; i < data.length; i++) {
        var node = data[i];
        var pos = locationMaster[node.id];
        
        if (pos) {
            // 2. 緯度経度を小数点第一位に丸める
            var lat = pos.lat;
            var lng = pos.lng;
            var shortLat = lat.toFixed(1);
            var shortLng = lng.toFixed(1);

            // 3. value側の表示内容を必要最低限に構成（schemaの順番と一致させる）
            // カンマ区切りで作成することで、ライブラリが自動的に分割して各行に割り当てます
            var meta = [
                node.room,           // 部屋名
                node.id,             // ID
                node.status,         // 状態
                node.time.split(' ')[1], // 時刻（日付を削って時間だけに抽出）
                node.power_w,        // 電力
                shortLat,            // 緯度 (1位まで)
                shortLng             // 経度 (1位まで)
            ].join(",");

            var use = svgImage.createElement("use");
            use.setAttribute("xlink:href", "#p0");
            use.setAttribute("content", meta);
            
            use.setAttribute("x", 0);
            use.setAttribute("y", 0);
            use.setAttribute("transform", `ref(svg,${shortLng},${-shortLat})`);
            use.setAttribute("class", node.status.toLowerCase());
			
            svgImage.documentElement.appendChild(use);
        }
    }
    svgMap.refreshScreen();
}


function removeUses() {
    var uses = svgImage.getElementsByTagName("use");
    for (var i = uses.length - 1; i >= 0; i--) {
        uses[i].remove();
    }
}
<?php
function file_get_contents_curl($url) {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);       

    $data = curl_exec($ch);
    curl_close($ch);

    return $data;
}

if(isset($_GET["bbox"]) and isset($_GET["num"]) ){
header("Content-type: text/html");
  echo file_get_contents_curl("https://geogratis.gc.ca/services/geoname/en/geonames.csv?bbox=" . urldecode($_GET["bbox"]) . "&num=" . urldecode($_GET["num"]), true);
} else {
  echo "error";
}
?>

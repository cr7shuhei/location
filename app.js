// HTML要素を取得
const btn = document.getElementById('getLocationAndAddressBtn');
const latitudeSpan = document.getElementById('latitude');
const longitudeSpan = document.getElementById('longitude');
const addressSpan = document.getElementById('address');
const municipalityNameSpan = document.getElementById('municipalityName'); // ★ 追加
const muniCodeSpan = document.getElementById('muniCode');
const statusMessage = document.getElementById('statusMessage');

// (ボタンのクリックイベントやGeolocation関連の関数は変更なし)
// ...
btn.addEventListener('click', () => {
    statusMessage.textContent = '現在地の座標を取得中です...';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
    } else {
        statusMessage.textContent = "お使いのブラウザは位置情報取得に対応していません。";
    }
});

function geolocationSuccess(position) {
    statusMessage.textContent = '座標の取得に成功しました。住所を検索中です...';
    
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    latitudeSpan.textContent = latitude;
    longitudeSpan.textContent = longitude;

    getAddressFromCoords(latitude, longitude);
}

function geolocationError(error) {
    let message = "";
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "位置情報の利用が許可されていません。";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "位置情報を取得できませんでした。";
            break;
        case error.TIMEOUT:
            message = "位置情報の取得がタイムアウトしました。";
            break;
        default:
            message = "原因不明のエラーが発生しました。";
            break;
    }
    statusMessage.textContent = message;
}
/**
 * 住所文字列から市区町村名を抽出するヘルパー関数
 * @param {string} fullAddress - 完全な住所文字列
 * @returns {string|null} - 抽出した市区町村名、見つからない場合はnull
 */
function parseMunicipality(fullAddress) {
    // 例: "東京都千代田区" や "北海道札幌市中央区" などを抽出する正規表現
    const regex = /.+?[都道府県](.+?郡.+?[町村]|.+?[市区町村])/;
    const match = fullAddress.match(regex);
    return match ? match[1] : null;
}

/**
 * 座標から住所を取得する (国土地理院API)
 */
async function getAddressFromCoords(lat, lon) {
    const endpoint = `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lon}`;
    
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`APIエラー: ${response.status}`);
        
        const data = await response.json();
        
        if (data.results) {
            const fullAddress = data.results.lv01Nm;
            const muniCode = data.results.muniCd;
            const municipalityName = parseMunicipality(fullAddress); // ★ 追加

            addressSpan.textContent = fullAddress;
            muniCodeSpan.textContent = muniCode;
            municipalityNameSpan.textContent = municipalityName || '抽出できませんでした'; // ★ 追加
            statusMessage.textContent = '住所の取得が完了しました。';
        } else {
            // ... エラー時の表示をリセット ...
            addressSpan.textContent = '該当する住所が見つかりませんでした。';
            muniCodeSpan.textContent = '---';
            municipalityNameSpan.textContent = '---';
            statusMessage.textContent = '';
        }

    } catch (error) {
        // ... エラー時の表示をリセット ...
        console.error('国土地理院APIでの取得に失敗しました:', error);
        statusMessage.textContent = '住所の取得に失敗しました。';
        addressSpan.textContent = '---';
        muniCodeSpan.textContent = '---';
        municipalityNameSpan.textContent = '---';
    }
}
// HTML要素を取得
const btn = document.getElementById('getLocationAndAddressBtn');
const latitudeSpan = document.getElementById('latitude');
const longitudeSpan = document.getElementById('longitude');
const addressSpan = document.getElementById('address');
const statusMessage = document.getElementById('statusMessage');

// ボタンがクリックされたときの処理
btn.addEventListener('click', () => {
    statusMessage.textContent = '現在地の座標を取得中です...';
    
    // ブラウザがGeolocation APIに対応しているかチェック
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
    } else {
        statusMessage.textContent = "お使いのブラウザは位置情報取得に対応していません。";
    }
});

/**
 * Geolocation APIでの位置情報取得が成功したときの処理
 */
function geolocationSuccess(position) {
    statusMessage.textContent = '座標の取得に成功しました。住所を検索中です...';
    
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // 取得した座標を画面に表示
    latitudeSpan.textContent = latitude;
    longitudeSpan.textContent = longitude;

    // 取得した座標を使って、国土地理院APIで住所を取得
    getAddressFromCoords(latitude, longitude);
}

/**
 * Geolocation APIでの位置情報取得が失敗したときの処理
 */
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
 * 座標から住所を取得する (国土地理院API)
 * @param {number} lat - 緯度
 * @param {number} lon - 経度
 */
async function getAddressFromCoords(lat, lon) {
    // APIのエンドポイントURLを構築
    const endpoint = `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lon}`;
    
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`APIエラー: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 国土地理院APIのレスポンスから住所情報を取得
        if (data.results) {
            const address = data.results.lv01Nm; // 'lv01Nm' に住所文字列が含まれる
            addressSpan.textContent = address;
            statusMessage.textContent = '住所の取得が完了しました。';
        } else {
            addressSpan.textContent = '該当する住所が見つかりませんでした。';
            statusMessage.textContent = '';
        }

    } catch (error) {
        console.error('国土地理院APIでの取得に失敗しました:', error);
        statusMessage.textContent = '住所の取得に失敗しました。';
        addressSpan.textContent = '---';
    }
}
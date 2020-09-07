$(document).ready(() => {
    let inp = $('.c1');
    let p = $('.c2');
    inp.on('input', function(e){
        // 1. Создаём новый объект XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // 2. Конфигурируем его: GET-запрос на URL 'phones.json'
                xhr.open('GET', 'https://public-api.nazk.gov.ua/v1/declaration/?q=', false);

        // 3. Отсылаем запрос
                xhr.send();

        // 4. Если код ответа сервера не 200, то это ошибка
                if (xhr.status != 200) {
                    // обработать ошибку
                    alert( xhr.status + ': ' + xhr.statusText ); // пример вывода: 404: Not Found
                } else {
                    // вывести результат
                    alert( xhr.responseText ); // responseText -- текст ответа.
                }
    });
});
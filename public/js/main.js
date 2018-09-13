$(document).ready((e) => {
    let body = document.body,
        html = document.documentElement;

    let menu_but = $('#menu_but');
    let panel = $("#panel");
    let footer = $("#footer");
    let header = $("#header");
    menu_but.click(function(){
        if(panel.css('display') == 'none'){
            panel.css({
                'display':'flex',
                'position': 'fixed',
                'right': '0',
                'height': header.height(),
                'background-color': '#B3E5FC',
                'width': '400px'
            });
            $("#upload_but").css('line-height', panel.height() + "px");
        }
        else{
            panel.css({'display':'none'});
        }
    });

    let find_input = $('.find_input');
    find_input.keypress((e1) => {
        if (e1.which == 13){ // if is enter was pressed
            document.location = '/find/' + find_input.val().replace(', ', '-').replace(' ', '_');
        }
    });

    let logoImg = $("#logo_img");
    logoImg.click(function(){
        document.location = '/';
    });

    let meme = $('.meme');
    meme.click(function(e1){
        let ob = $("#" + e1.target.id);
        document.location = '/post/' + ob.css('background-image').split('/')[4].split('.')[0];
    });

    let upload_but = $("#upload_but");
    upload_but.click((e1) => {
        document.location = '/upload';
    });

    $("#meme_file").change((e1) => {
        if ($("#meme_file").val() != '') {
            $("#meme_file").prev().text('Выбрано файлов: ' + $("#meme_file")[0].files.length);
            $("#img").show().attr('src',URL.createObjectURL($("#meme_file")[0].files[0])).css({
                'margin': 'auto',
                'max-width': '400px',
                'display': 'block'
            });
            $(".fileUrl").text($("#meme_file")[0].files[0].name);
        }
        else {
            $("#meme_file").prev().text('Выберать файл');
            $("#img").hide();
        }
    });

    let tags_span = $("#tags span");
    tags_span.click((e1) => {
        document.location = '/find/' + e1.target.innerText.replace('#', '');
    });

    setInterval(() => {
        let height = Math.max($("#main").height() + 70, html.clientHeight);
        footer.css({
            'position': 'absolute',
            'top': height,
            'width': '100%'
        });
        if (document.location.toString().split("/")[3] == "post"){
            let img = document.createElement('img');
            body.appendChild(img);
            img.src = $("#post").css('background-image').split('"')[1];
            let width = $(img).width(),
                height = $(img).height();
            img.remove();
            if (width > height) {
                if (window.innerWidth > 842)
                    $("#post").css({
                        'background-size': '600px auto'
                    });
                else if (window.innerWidth > 442)
                    $("#post").css({
                        'background-size': '500px auto'
                    });
                else
                    $("#post").css({
                        'background-size': '400px auto'
                    });
            }
            else {
                if (window.innerWidth > 842)
                    $("#post").css({
                        'background-size': 'auto 600px'
                    });
                else if (window.innerWidth > 442)
                    $("#post").css({
                        'background-size': 'auto 500px'
                    });
                else
                    $("#post").css({
                        'background-size': 'auto 400px'
                    });
            }
        }
        else if (document.location.toString().split("/").length == 4){
            $(".meme").each(function(index){
                let img = document.createElement('img');
                body.appendChild(img);
                img.src = $(this).css('background-image').split('"')[1];
                let width = $(img).width(),
                    height = $(img).height();
                img.remove();
                if (width > height) {
                    $(this).css({
                        'background-size': '400px auto'
                    });
                }
                else {
                    $(this).css({
                        'background-size': 'auto 400px'
                    });
                }
            });
        }
    }, 100);

    $("#share_copy").click((event) => {
        let $temp = $("<input>");
        $("body").append($temp);
        $temp.val($("#post").css('background-image').split("\"")[1]).select();
        document.execCommand("copy");
        $temp.remove();
        $("#share_copy").text("Скопировано в буфер");
        setTimeout(() => $("#share_copy").text("Скопировать ссылку на мем"), 1500);
    });


});


$(document).ready((e) => {
    let body = document.body,
        html = document.documentElement;

    let popup = $("#popup_bg");
    popup.hide();

    let panel = $("#panel");
    let footer = $("#footer");
    let footer2 = $("#footer2");
    let header = $("#header");
    let find_input = $('.find_input');
    find_input.keypress((e1) => {
        if (e1.which == 13){ // if enter was pressed
            document.location = '/find/' + find_input.val().replace(', ', '-').replace(' ', '_');
        }
    });


    /*let logoImg = $("#logo_img");
    logoImg.click(function(){
        document.location = '/';
    });*/
    

    let meme = $('.meme');
    meme.click(function(e1){
        let ob = $("#" + e1.target.id);
        document.location = '/post/' + ob.css('background-image').split('/')[4].split('.')[0];
    });

    $("#meme_file").change((e1) => {
        if ($("#meme_file").val() != '') {
            $("#meme_file").prev().text('Выбрано файлов: ' + $("#meme_file")[0].files.length);
            $("#img").show().attr('src',URL.createObjectURL($("#meme_file")[0].files[0])).css({
                'margin': 'auto',
                'max-width': '350px',
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
        else if (document.location.toString().split("/")[3] == "" ||
            document.location.toString().split("/")[3] == "find"){

        }
        var maxWidth = 0;
        $(".sugPostTags").each(function() {
            let currentWidth = $(this).outerWidth();
            if (currentWidth > maxWidth) {
                maxWidth = currentWidth;
            }
        }).width(maxWidth);
    }, 100);

    $(".meme_img").each(function(index){
        let width = $(this).width(),
            height = $(this).height();
        if (width > height) {
            $(this).width(400);
            $(this).css('margin-top', (400 - $(this).height()) / 2)
        }
        else {
            $(this).height(400);
        }
    });

    $("#share_copy").click((event) => {
        let $temp = $("<input>");
        $("body").append($temp);
        $temp.val($("#post").css('background-image').split("\"")[1]).select();
        document.execCommand("copy");
        $temp.remove();
        $("#share_copy").text("Скопировано в буфер");
        setTimeout(() => $("#share_copy").text("Скопировать ссылку на мем"), 1500);
    });

    let indiv = $("#complain_panel");
    indiv.text("Подать заявку");
    indiv.hide();
    $("#post").mouseover((e1) => {
        indiv.show();
    });

    $("#post").mouseleave((e1) => {
        indiv.hide();
    });
    
    let sugPostImg = $(".sugPostImg");
    sugPostImg.click((e1) => {
        document.location = "/ya_moder_bl/panel/post/" + e1.target.id.split('sugPostImg')[1].split('.')[0].toString();
    });

    let cl = 0;
    indiv.click((e1) => {
        if (cl) {
            popup.hide();
            cl = 0;
        }
        else{
            popup.show();
            cl = 1;
        }
    });

    popup.click((e1) => {
        if(e1.target.id == "popup_bg")
            popup.hide();
    });


    $(window).resize(centerBox);
    $(window).scroll(centerBox);
    centerBox();

    function centerBox() {
        let winWidth = $(window).width();
        let winHeight = $(window).height();
        let docWidth = $(document).width();
        let docHeight = $(document).height();
        let scrollPos = $(window).scrollTop();
        let disWidth = (winWidth - 400) / 2;
        let disHeight = (winHeight - $("#popup_content").height()) / 2;
        $('#popup_content').css({'width' : '400px', 'left' : disWidth+'px', 'top' : disHeight+'px'});
        $('#popup_bg').css({'width' : winWidth+'px', 'height' : docHeight+'px'});
    }

    $('.close_popup').click((e1) => {
        if (cl) {
            popup.hide();
        }
    });

    let meme_edit_img = $('.meme_edit_img');
    let meme_edit_info_table = $('.meme_edit_info_table');
    meme_edit_img.height(($(window).height() - header.height() - 50));
    meme_edit_info_table.width(meme_edit_img.width());

    let tags_modifications = $('#tags_modifications');
    let meme_edit_tags_mod = $('.meme_edit_tags_mod');
    tags_modifications.width(meme_edit_tags_mod.width());

    let meme_edit_save_btn = $('.meme_edit_save_btn');

});


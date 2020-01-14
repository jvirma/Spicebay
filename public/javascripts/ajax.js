toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "2000",
    "extendedTimeOut": "2000",
    "showEasing": "linear",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}


function loadCart(id) {
    var url = '/addtocart/' + id;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            var obj = JSON.parse(xhttp.response);
            $("#cartTotalQty").html(obj.itemsQty);
            $("#" + id).text('Added to shopping cart');
            $("#" + id).removeClass('btn-success').addClass('btn-secondary disabled').attr("disabled", true);
        }
    };
    xhttp.open("POST", url, true);
    xhttp.send();
};


$(document).ready(function () {
    $('#userareaModal').modal(
        { backdrop: 'static' }

    )



    $('.form-check-input').click(function () {
       
        if ($(this).attr('value') == 'Canada')
            $('.areaImage').attr("src", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/CAN_orthographic.svg/220px-CAN_orthographic.svg.png");
        if ($(this).attr('value') == 'India')
            $('.areaImage').attr("src", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/India_%28orthographic_projection%29.svg/220px-India_%28orthographic_projection%29.svg.png");
        if ($(this).attr('value') == 'Finland')
            $('.areaImage').attr("src", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/EU-Finland_%28orthographic_projection%29.svg/220px-EU-Finland_%28orthographic_projection%29.svg.png");

    });


    $(".userInput").on("input", function () {

        var qty = parseFloat($(this).val());
        var data = $(this).attr('data-value');
        var data = data.split(",");
        var id = data[0];
        var price = parseFloat(data[1]);
        var unitcost = price * qty;
        console.log($(this).val());
        if (!($(this).val()))
            return;

        $("#unitpriceText" + id).text(unitcost.toFixed(4));
        var total = 0;
        $(".unitprices").each(function (index) {
            total = total + parseFloat($(this).text());
            $('#totalSum').text('Total price $' + total.toFixed(4));
        });

        var url = '/update/' + id + '/' + qty;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {

            }
        };
        xhttp.open("POST", url, true);
        xhttp.send();

    })
    



});








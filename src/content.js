var requestCategory = [];
var triggerClick = true;

function refreshPage() {
    sessionStorage.setItem("category", JSON.stringify(requestCategory));
    window.location.reload();
}

function checkErrorMsg(diff) {
    sessionStorage.removeItem("category");
    var dialogIDs = [
        'plAvailabilityErrorDialog', 'expirationExtendDialog', 'sessionUserExpiredDialog', 'expirationDialog', 'ticketDistributionProcssingDialog',
        'warningTimeoutWRDialog', 'timeoutWRExpirationDialog', 'requestProcessingDialog', 'ajaxErrorDialog', 'unsupportedBrowserPrinterCheck',
        'ajaxErrorDialogReload', 'ajaxErrorDialogContinueShopping', 'sessionExpiredDialog', 'sessionExpiredWhileGeneratingTicketDialog', 'concurrencyDialog',
        'removeMainOwnerTicketError', 'tooManyRequestTickets', 'dialogAvailabilityError', 'invalidRequestedQuantityError', 'quotaDistributionLimitExceededError',
        'quotaDistributionMisconfiguredError', 'transferSeatCatMisconfiguredError'
    ];
    var timePeriod = diff == 1 ? 2000 : 3500;
    setTimeout(function () {
        if (diff == 1) {
            if ($("#notification_static_limit").hasClass("hidden") == false || $("#notification_static_avail").hasClass("hidden") == false) {
                refreshPage();
            }
        } else {
            if ($("#companionTicketsAlone").hasClass("hidden") == false) {
                refreshPage();
            }
        }
        for (var i in dialogIDs) {
            if ( $('div[aria-describedby="ajaxErrorDialogReload"]').css("display") == "block" ) {
                refreshPage();
            }
            var displayStyle = $("#" + dialogIDs[i]).css("dispplay");
            if ( displayStyle == 'block') {
                refreshPage();
            }
        }
    }, timePeriod);
}
function ticketValidator() {
    triggerClick = true;
    for (var i in requestCategory) {
        var purchaseAmount = requestCategory[i];

        if (purchaseAmount > 0) {
            if ($("#list_ticket_items tbody tr")[i] == undefined) {
                triggerClick = false;
            }
            $("#list_ticket_items tbody tr").each(function (index, elm) {
                if (i == index) {
                    var cateQuantity = $(this).find(".quantity").find("select").find("option").length - 1;
                    if (cateQuantity >= purchaseAmount) {
                        var cmbId = $(this).find(".quantity").find("select").attr("id");
                        $("select#" + cmbId).val(purchaseAmount);
                        $("select#" + cmbId)[0].dispatchEvent(new Event("change"));
                    } else {
                        triggerClick = false;
                    }
                }
            });
        }
    }
    $("#book")[0].dispatchEvent(new Event("click"));

    if (triggerClick) {
        checkErrorMsg(1);
    } else {
        refreshPage();
    }
}
function filterValidator() {
    var isRefresh = false;
    var clickAble = true;
    if ( $("#seat_categories_table").css("display") == "none" ) {
        clickAble = false;
    }
    for (var i in requestCategory) {
        var purchaseAmount = requestCategory[i];
        if (purchaseAmount > 0) {
            if (clickAble)
                $("#seat_categories_table").find("input[type='checkbox']")[i].click();
            
            if ($("#list_ticket_items table tbody tr.group_start").length < purchaseAmount) {
                isRefresh = true;
            }
            $("#list_ticket_items table tbody tr.group_start").each(function (index, ele) {
                var cateName = $(ele).find(".seatCat").text();
                if (cateName.indexOf("Cate") > -1) {
                    if (index < purchaseAmount) {
                        $(ele)[0].dispatchEvent(new Event("click"));
                    }
                }
            })
            if (clickAble)
                $("#seat_categories_table").find("input[type='checkbox']")[i].click();
        }
    }

    $("#book")[0].dispatchEvent(new Event("click"));
        
    if (!isRefresh) {
        checkErrorMsg();
    } else {
        refreshPage();
    }
}
function secureSeat() {
    var isRefresh = true;
    for (var i in requestCategory) {
        var purchaseAmount = requestCategory[i];
        if (purchaseAmount > 0) {
            $("#collapsiblePanel_main_content_seat_selection .group_start.group_end.seat_category_end").each(function (index, ele) {
                if ( $(ele).hasClass("category_unavailable") == false ) {
                    var cateName = $(this).find("th.category").text()
                    if (cateName.indexOf("Category") > -1) {
                        var cateIndex = cateName.split("Category ")[1];
                        if (cateIndex - 1 == i) {
                            var quantityNum = $(this).find("td.quantity").find("select").find("option").length;
                            if (quantityNum >= purchaseAmount) {
                                isRefresh = false;
                                var eleId = $(this).find("td.quantity").find("select").attr("id");
                                $(this).find("td.quantity").find("select").val(purchaseAmount);
                                $(this).find("td.quantity").find("select")[0].dispatchEvent(new Event("change"));
                            }
                        }
                    }
                }
            })
        }
    }

    $("#book")[0].dispatchEvent(new Event("click"));
        
    if (!isRefresh) {
        checkErrorMsg();
    } else {
        refreshPage();
    }
}

function start() {
    if ($("#item_filters").length > 0) {
        filterValidator();
    } else if ( $("#collapsiblePanel_main_content_seat_selection").length > 0 ) {
        secureSeat();
    } else {
        ticketValidator();
    }
}

function stop() {
    requestCategory = [];
    sessionStorage.removeItem("category");
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.message === "start") {
            sessionStorage.removeItem("category");
            requestCategory = request.data;
            start();
        }
        if (request.message == "stop") {
            stop();
        }
    }
);

$(document).ready(function () {
    if (window.location.href.indexOf("https://resale-intl.fwc22.tickets.fifa.com/cart/reservation") > -1) {
        chrome.extension.sendRequest({message: "playAudio"});
    } else if (window.location.href == "https://resale-intl.fwc22.tickets.fifa.com/error/noAvailability") {
        history.back();
    } else {
        setTimeout(function () {
            console.clear();
            var category = sessionStorage.getItem("category");
            if (category) {
                requestCategory = JSON.parse(category);
                start();
            }
        }, 3000)
    }
});
import $ from 'zepto';
import bugsnagClient from './bugsnagClient';
import flatpickr from "flatpickr";

(() => {
    const template = '\
<div class="row converter-plugin-area" style="text-align:center">\
    <h3>HAND CONVERTER PLUGIN AREA</h3>\
    <label>Download all hands since this date</label>\
    <input class="js-hc-start-time" />\
    <a class="button js-hc-convert" style="margin:1rem">DOWNLOAD IN POKER STARS FORMAT</a>\
    <p>Status: <span class="js-hc-status"></span></p>\
    <div class="js-hc-spinning" style="display:none"><img src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif" /></div>\
    <textarea class="js-hc-log" style="width:100%;height:120px;color: #fff;background-color: #333;border: 1px solid #666;"></textarea>\
</div>';

    let $historyDateContainer;
    let $statusContainer;
    let $logContainer;
    let $startTimeContainer;

    setInterval(() => {
        if ($('.converter-plugin-area').length > 0) {
            // We have already initialized
            return;
        }

        $historyDateContainer = $('.history-date-container');
        if ($historyDateContainer.length > 0) {
            initialize();
        }
    }, 1000);

    function initialize() {
        $historyDateContainer.append(template);

        $('.js-hc-convert').click(onClickDownload);
        $statusContainer = $('.js-hc-status');
        $logContainer = $('.js-hc-log');
        $startTimeContainer = $('.js-hc-start-time');

        flatpickr('.js-hc-start-time', {
            defaultDate: new Date(),
        });
    }

    function onClickDownload() {
        $('.js-hc-spinning').show();
        const startTime = new Date($startTimeContainer.val()).getTime();

        window.chrome.runtime.sendMessage({action: 'hc.convertHands', options: {startTime}}, response => {
            $('.js-hc-spinning').hide();

            if (response && response.success) {
                $statusContainer.html('Finished');
            } else {
                $statusContainer.html('Failure');
                alert('Something went wrong. Please open an issue at https://github.com/mr-feek/global-poker-hand-history-converter/issues.');
                $logContainer.append(JSON.stringify(response));
            }
        });
    }

    window.chrome.runtime.onConnect.addListener(port => {
        port.onMessage.addListener(data => {
            if (data.action === 'hc.updateStatus') {
                $statusContainer.html(data.message);
                $logContainer.append(`${data.message}\n`);
            }
        });
    });
})();


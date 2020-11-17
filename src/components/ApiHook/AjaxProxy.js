import { proxy } from "ajax-hook";
import messageCenter from './MessageCenter';

function ajaxProxy() {
    const _proxy = proxy({
        onRequest: (config, handler) => {
            handler.next(config);
            // config.xhr.abort();
        },
        onError: (err, handler) => {
            handler.next(err);
        },
        // onabort: () => {

        // },
        onResponse: (response, handler) => {
            messageCenter.postOriginMessage({
                response,
                handler,
            });
        }
    });
    messageCenter.observe(_proxy);
    _proxy.onEditMessage = ({ response, handler }) => {
        handler.next(response);
    };
}

export default ajaxProxy;
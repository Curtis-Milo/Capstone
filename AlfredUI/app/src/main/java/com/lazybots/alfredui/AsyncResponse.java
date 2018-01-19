package com.lazybots.alfredui;

/**
 * Created by Keyur on 2018-01-17.
 *
 * Implemented by any class using NetworkCalls. Allows data to be passed
 * back to calling activity when NetworkCalls (an asynchronous task) has completed execution.
 */

public interface AsyncResponse {
    /**
     * @param responseCode: http response code. Other error codes also sent as responseCode
     * @param x:            Any Object you wish to send to the calling class
     */
    void processFinish(int responseCode, Object x);
}

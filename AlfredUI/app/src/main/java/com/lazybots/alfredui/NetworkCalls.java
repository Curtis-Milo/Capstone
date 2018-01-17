package com.lazybots.alfredui;

import android.os.AsyncTask;
import android.util.Base64;

import com.google.gson.Gson;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;

/**
 * Created by Keyur on 2018-01-14.
 */

public class NetworkCalls extends AsyncTask {

    public AsyncResponse delegate = null;
    public String api_key = null;

    public NetworkCalls() {
    }

    public NetworkCalls(String x, AsyncResponse y) {
        delegate = y;
        api_key = x;
    }

    @Override
    protected Object doInBackground(Object[] objects) {
        URL url;
        URLConnection con;
        Object ret = null;
        HttpURLConnection http;

        try {
            if (api_key.equals("table_token")) {
                url = new URL("http://130.113.68.87:8080/table?table_id=" + Integer.toString((int) objects[0]));
                con = url.openConnection();

                http = (HttpURLConnection) con;
                http.setRequestMethod("POST"); // PUT is another valid option

                String encoding;
                encoding = Base64.encodeToString(("admin:admin").getBytes("UTF-8"), 0);

                http.setRequestProperty("Authorization", "Basic " + encoding);
                http.setRequestProperty("Content-Type", "application/json");

                http.setDoOutput(true);
                int x = http.getResponseCode();
                if (x < 400) {
                    BufferedReader br = new BufferedReader(new InputStreamReader(http.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        sb.append(line + "\n");
                    }
                    br.close();

                    String resStr = sb.toString();
                    JSONObject y = new JSONObject(resStr);
                    String tok = (String) y.get("token");
                    ret = new Object[]{x, tok};
                }
            } else if (api_key.equals("placeOrder")) {
                url = new URL("http://130.113.68.87:8080/placeOrder?table_id=" + Integer.toString((int) objects[0]));
                con = url.openConnection();
                http = (HttpURLConnection) con;
                http.setRequestMethod("POST"); // PUT is another valid option

                Gson gson = new Gson();
                DrinkOrder x = new DrinkOrder((ArrayList<String[]>) objects[2]);
                String json = gson.toJson(x);


                http.setRequestProperty("Authorization", "bearer " + objects[1]);
                http.setRequestProperty("Content-Type", "application/json");


                http.setDoOutput(true);
                OutputStream os = http.getOutputStream();
                os.write(json.getBytes("UTF-8"));
                os.flush();
                os.close();
                int resp = http.getResponseCode();
                if (resp == 200) {

                    BufferedReader br = new BufferedReader(new InputStreamReader(http.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        sb.append(line + "\n");
                    }
                    br.close();

                    String resStr = sb.toString();
                    JSONObject y = new JSONObject(resStr);

                    ret = new Object[]{resp, y.get("placeInLine")};
                } else {
                    ret = new Object[]{resp, false};
                }
            } else if (api_key.equals("login")) {
                url = new URL("http://130.113.68.87:8080/login");
                con = url.openConnection();
                http = (HttpURLConnection) con;
                http.setRequestMethod("POST"); // PUT is another valid option

                http.setRequestProperty("Authorization", "Basic " + objects[0]);
                http.setRequestProperty("Content-Type", "application/json");

                http.setDoOutput(true);
                int resp = http.getResponseCode();
                if (resp == 200) {
                    ret = new Object[]{resp, true};
                } else {
                    ret = new Object[]{resp, false};
                }
            }
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }

        /*
            api_key=="sendOrder" ===> ret object is a boolean
         */
        return ret;
    }

    @Override
    protected void onPostExecute(Object result) {
        delegate.processFinish((int) ((Object[]) result)[0], ((Object[]) result)[1]);
        //if (api_key.equals("table_token")) token = (String)result;
        //else if (api_key.equals("sendOrder")) orderDelivered = (boolean)result;
    }
}

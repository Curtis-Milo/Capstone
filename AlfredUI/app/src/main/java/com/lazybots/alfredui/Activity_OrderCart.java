package com.lazybots.alfredui;

import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.ListView;
import android.widget.TextView;

import com.google.gson.Gson;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * Created by Keyur on 2017-11-08.
 */

public class Activity_OrderCart extends AppCompatActivity{
    ArrayList<Drink> currentCart;
    HashMap<String,Drink> drinkReference;
    ArrayList<String[]> rawCartData;
    double totalCurrentCartPrice;
    ListView lv ;
    String token;
    boolean orderDelivered;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drinks_cart);

        currentCart = (ArrayList<Drink>) getIntent().getSerializableExtra("drinks");
        drinkReference = (HashMap) getIntent().getSerializableExtra("DrinksInfo");
        rawCartData = new ArrayList<>();

        new NetworkCalls("table_token").execute();

        setUpRawCartData();
        TextView totalPrice = (TextView) findViewById(R.id.currentCartTotal);
        totalPrice.setText("$"+Double.toString(totalCurrentCartPrice));
        lv = (ListView) findViewById(R.id.drinkCartListView);
        lv.setAdapter(new DrinkCartListAdapter(this,rawCartData));


    }

    private void setUpRawCartData() {
        for(Drink x : currentCart) {
            if (x.getAmount()>0) {
                rawCartData.add(new String[]{x.getName(), Integer.toString(x.getAmount()), Double.toString(x.getPriceForAmount())});
                totalCurrentCartPrice+=x.getPriceForAmount();
            }
        }
    }

    /**
     *
     * @param v
     * @throws IOException
     * @throws JSONException
     */
    public void onClickSendOrder(View v) throws IOException, JSONException {
        new NetworkCalls("sendOrder").execute();
    }

    private class NetworkCalls extends AsyncTask<String,Integer,Object> {
        String api_key;
        public NetworkCalls(String x) {
            api_key=x;
        }
        @Override
        protected Object doInBackground(String... strings) {
            URL url;
            URLConnection con;
            Object ret = null;
            HttpURLConnection http;

            try {
                if (api_key.equals("table_token")) {
                    url = new URL("http://130.113.68.87:8080/table?table_id=5");
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
                        table_tokenResponse resJSON = new Gson().fromJson(resStr, table_tokenResponse.class);
                        ret = resJSON.token;
                    }
                }
                else if (api_key.equals("sendOrder")) {
                    url = new URL("http://130.113.68.87:8080/placeOrder?table_id=5");
                    con = url.openConnection();
                    http = (HttpURLConnection)con;
                    http.setRequestMethod("POST"); // PUT is another valid option

                    Gson gson = new Gson();
                    DrinkItem x = new DrinkItem(rawCartData);
                    String json = gson.toJson(x);


                    http.setRequestProperty("Authorization","bearer "+token);
                    http.setRequestProperty("Content-Type","application/json");



                    http.setDoOutput(true);
                    OutputStream os = http.getOutputStream();
                    os.write(json.getBytes("UTF-8"));
                    os.flush();
                    os.close();

                    if (http.getResponseCode()==200){ ret = true;}
                    else{ ret = false;}
                }
            }catch (MalformedURLException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (Exception e) {
                e.printStackTrace();
            }
            return ret;
        }

        @Override
        protected void onPostExecute(Object result) {
            if (api_key.equals("table_token")) token = (String)result;
            else if (api_key.equals("sendOrder")) orderDelivered = (boolean)result;
        }
    }

    private class table_tokenResponse {
        private String token_type;
        private String token;
    }


}

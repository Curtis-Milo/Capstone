package com.lazybots.alfredui;

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

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drinks_cart);

        currentCart = (ArrayList<Drink>) getIntent().getSerializableExtra("drinks");
        drinkReference = (HashMap) getIntent().getSerializableExtra("DrinksInfo");
        rawCartData = new ArrayList<>();
        try {
            token = getTableToken();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
            Log.d("ERROROROROROR",e.getStackTrace().toString());
        }

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

        URL url = new URL("http://www.cps1.cas.mcmaster.ca:8080/table?table_id=5");
        URLConnection con = url.openConnection();
        HttpURLConnection http = (HttpURLConnection)con;
        http.setRequestMethod("POST"); // PUT is another valid option

        Gson gson = new Gson();
        DrinkItem x = new DrinkItem();
        x.setUpOrder(rawCartData);
        String json = gson.toJson(x);

        http.setRequestProperty("Authorization","bearer"+token);
        http.setRequestProperty("Content-Type","application/json");
        OutputStream os = http.getOutputStream();

        os.write(json.getBytes("UTF-8"));
        http.setDoOutput(true);
        String response = http.getInputStream().toString();
        JSONObject orderResp = new JSONObject(response);
        int y;
    }

    /**
     *
     * @return
     * @throws IOException
     * @throws JSONException
     */
    private String getTableToken() throws IOException, JSONException {
        URL url = new URL("http://www.cps1.cas.mcmaster.ca:8080/table?table_id=5");
        URLConnection con = url.openConnection();
        HttpURLConnection http = (HttpURLConnection)con;
        http.setRequestMethod("POST"); // PUT is another valid option
        String encoding = Base64.encodeToString(("admin:admin").getBytes("UTF-8"),0);
        http.setRequestProperty("Authorization","Basic"+encoding);

        //http.setDoOutput(true);
        String response = http.getInputStream().toString();
        JSONObject jsonobj = new JSONObject(response);
        return jsonobj.getString("token");
    }
}

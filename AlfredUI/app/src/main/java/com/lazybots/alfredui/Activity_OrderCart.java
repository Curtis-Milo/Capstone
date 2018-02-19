package com.lazybots.alfredui;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;

import java.io.IOException;
import java.util.ArrayList;

/**
 * Created by Keyur on 2017-11-08.
 */

/**
 *
 */
public class Activity_OrderCart extends AppCompatActivity implements AsyncResponse {
    ArrayList<Drink> currentCart;
    ArrayList<String[]> rawCartData;
    double totalCurrentCartPrice;
    ListView lv = null;
    NetworkCalls server = null;
    SharedPreferences appData;
    boolean orderSent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drinks_cart);

        currentCart = (ArrayList<Drink>) getIntent().getSerializableExtra("drinks");
        rawCartData = new ArrayList<>();

        server = new NetworkCalls();
        server.api_key = "placeOrder";
        server.delegate = this;
        appData = getSharedPreferences("prefs", 0);
        //server = (com.lazybots.alfredui.NetworkCalls) new com.lazybots.alfredui.NetworkCalls("table_token",this).execute();

        setUpRawCartData();
        TextView totalPrice = (TextView) findViewById(R.id.currentCartTotal);

        totalPrice.setText("$"+Double.toString(totalCurrentCartPrice));
        lv = (ListView) findViewById(R.id.drinkCartListView);
        lv.setAdapter(new DrinkCartListAdapter(this,rawCartData));


    }

    /**
     *
     */
    private void setUpRawCartData() {
        for(Drink x : currentCart) {
            if (x.getAmount()>0) {
                rawCartData.add(new String[]{x.getName(), Integer.toString(x.getAmount()), Double.toString(x.getPriceForAmount())});
                totalCurrentCartPrice+=x.getPriceForAmount();
            }
            totalCurrentCartPrice = Math.round(totalCurrentCartPrice * 100.0) / 100.0;
        }
    }

    /**
     *
     * @param v
     * @throws IOException
     * @throws JSONException
     */
    public void onClickSendOrder(View v) throws IOException, JSONException {
        if (rawCartData.size() > 0) {
            server = new NetworkCalls();
            server.api_key = "placeOrder";
            server.delegate = this;
            server.execute(appData.getInt("tableNum", 1), getIntent().getSerializableExtra("tableToken"), rawCartData);
        } else {
            Toast.makeText(Activity_OrderCart.this, "Empty cart!", Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void processFinish(int responseCode, Object x) {
        if (responseCode == 200) {
            Toast.makeText(Activity_OrderCart.this, "Order has been received by Alfred", Toast.LENGTH_SHORT).show();
            orderSent = true;
            if (x != null) {
                TextView placeInLine = (TextView) findViewById(R.id.CartPlaceInLine);
                placeInLine.setText("Place in line: " + (int) x);
                placeInLine.setVisibility(View.VISIBLE);
            }

        } else {
            Toast.makeText(Activity_OrderCart.this, "Order Placement Unsuccessful", Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onBackPressed() {
        Intent intent = new Intent();
        intent.putExtra("orderSent", orderSent);
        setResult(RESULT_OK, intent);
        finish();
    }
}

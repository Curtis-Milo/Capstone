package com.lazybots.alfredui;

import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.Button;
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
        }
    }

    /**
     *
     * @param v
     * @throws IOException
     * @throws JSONException
     */
    public void onClickSendOrder(View v) throws IOException, JSONException {
        server.execute(appData.getInt("tableNum", 1), getIntent().getSerializableExtra("tableToken"), rawCartData);
        //new NetworkCalls("sendOrder").execute();
    }

    @Override
    public void processFinish(int responseCode, Object x) {
        if (responseCode == 200) {
            Button bt = (Button) findViewById(R.id.buttonCartSendOrder);
            bt.setBackgroundColor(Color.GREEN);
        } else {
            Toast.makeText(Activity_OrderCart.this, "Order Placement Unsuccessful", Toast.LENGTH_LONG);
        }
    }
}

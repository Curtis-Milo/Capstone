package com.lazybots.alfredui;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.ListView;

import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Created by Keyur on 2017-11-08.
 */

public class Activity_OrderCart extends AppCompatActivity{
    HashMap<String,DrinkItem> currentCart;
    HashMap<String,Drink> drinkReference;
    ArrayList<String[]> rawCartData;
    ListView lv ;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drinks_cart);

        currentCart = (HashMap) getIntent().getSerializableExtra("CurrentCartList");
        drinkReference = (HashMap) getIntent().getSerializableExtra("DrinksInfo");
        rawCartData = new ArrayList<String[]>();

        setUpRawCartData();
        lv = (ListView) findViewById(R.id.drinkCartListView);
        lv.setAdapter(new DrinkCartListAdapter(this,rawCartData));


    }

    private void setUpRawCartData() {
        Iterator it = currentCart.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry) it.next();

            DrinkItem x = (DrinkItem) pair.getValue();
            String key = (String) pair.getKey();
            Drink y = drinkReference.get(key);

            int[] amts = x.getOrderAmounts();
            if (amts[0] > 0) {
                rawCartData.add(new String[]{key, "Small", Integer.toString(amts[0]), "$ " + Double.toString(y.getPriceForSize("SMALL") * amts[0])});
            }
            if (amts[1] > 0) {
                rawCartData.add(new String[]{key, "Medium", Integer.toString(amts[1]), "$ " + Double.toString(y.getPriceForSize("MEDIUM") * amts[1])});
            }
            if (amts[2] > 0) {
                rawCartData.add(new String[]{key, "Large", Integer.toString(amts[2]), "$ " + Double.toString(y.getPriceForSize("LARGE") * amts[2])});
            }

            it.remove();
        }

    }

    public void onClickSendOrder(View v){
        /*URL url = new URL("https://www.example.com/login");
        URLConnection con = url.openConnection();
        HttpURLConnection http = (HttpURLConnection)con;
        http.setRequestMethod("POST"); // PUT is another valid option
        http.setDoOutput(true);

*/    }
}

package com.lazybots.alfredui;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.GridView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;


public class Activity_DrinksList extends AppCompatActivity implements AsyncResponse {

    private final int GO_TO_CART = 1;
    private int tableNum ;
    private HashMap<String,Drink> drinkReference;
    private ArrayList<Drink> drinks;
    private GridView gv;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drinks_list);

        drinkReference = new HashMap<>();

        gv = (GridView) findViewById(R.id.drinksGrid);

        //TEST DATA SETUP
        drinks = new ArrayList<>();
        drinks.add(new Drink("Sprite", 234, R.drawable.sprite, 2.99));
        drinks.add(new Drink("Coke", 333, R.drawable.coke, 3.99));
        drinks.add(new Drink("Fanta", 654, R.drawable.fanta, 3.99));
        //drinks.add(new Drink ("red",200,R.drawable.alfred,2.99));
        //drinks.add(new Drink ("black",225,R.drawable.alfred,2.99));
        //drinks.add(new Drink ("pink",69,R.drawable.alfred,2.99));

        for (Iterator<Drink> i = drinks.iterator(); i.hasNext();) {
            Drink d = i.next();
            String name = d.getName();
            drinkReference.put(name,d);
        }

        // Set the view adapter for the gridview to the custom adapter created for our purpose
        DrinksViewAdapter customAdapter = new DrinksViewAdapter (Activity_DrinksList.this, drinks);
        gv.setAdapter(customAdapter);
    }

    public void onClickViewCart (View v) {
        Intent myIntent = new Intent(v.getContext(), Activity_OrderCart.class);

        myIntent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);

        myIntent.putExtra("DrinksInfo", this.drinkReference);
        myIntent.putExtra("drinks",setUpCurrentCart());
        myIntent.putExtra("tableToken", (String) getIntent().getSerializableExtra("tableToken"));

        startActivityForResult(myIntent, GO_TO_CART);
    }

    public void onClickGoSettings(View v) {
        Intent myIntent = new Intent(v.getContext(), Activity_Login.class);

        //myIntent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);

        //myIntent.putExtra("drinks",setUpCurrentCart());
        //myIntent.putExtra("tableToken", (String) getIntent().getSerializableExtra("tableToken"));

        //int GO_TO_CART = 1;
        startActivity(myIntent);
    }

    private ArrayList<Drink> setUpCurrentCart() {
        return ((DrinksViewAdapter)gv.getAdapter()).getAllItems();
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == GO_TO_CART) {
            if (resultCode == RESULT_OK && data!=null) {
                if ((Boolean) data.getSerializableExtra("orderSent")) {
                    resetCurrentSelections();
                }
            }
        }
    }

    private void resetCurrentSelections() {
        for (Drink x : drinks) {
            x.setAmount(0);
        }
        DrinksViewAdapter customAdapter = new DrinksViewAdapter(Activity_DrinksList.this, drinks);
        gv.setAdapter(customAdapter);
    }

    @Override
    public void onBackPressed() {
        //do nothing when back is pressed from this menu
    }
    @Override
    public void processFinish(int responseCode, Object x) {

    }
}

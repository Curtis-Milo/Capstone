package com.lazybots.alfredui;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.GridView;
import android.view.View;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;


public class Activity_DrinksList extends AppCompatActivity {

    private int tableNum ;
    private HashMap<String,Drink> drinkReference;
    private GridView gv;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drinks_list);

        drinkReference = new HashMap<>();

        gv = (GridView) findViewById(R.id.drinksGrid);

        //TEST DATA SETUP
        ArrayList<Drink> drinks = new ArrayList<>();
        drinks.add(new Drink ("Sprite",234,R.drawable.image1,2.99));
        drinks.add(new Drink ("Coke",333,R.drawable.image1,3.99));
        drinks.add(new Drink ("Fanta",654,R.drawable.image1,3.99));
        drinks.add(new Drink ("red",200,R.drawable.image1,2.99));
        drinks.add(new Drink ("black",225,R.drawable.image1,2.99));
        drinks.add(new Drink ("pink",69,R.drawable.image1,2.99));

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

        myIntent.putExtra("DrinksInfo", this.drinkReference);
        myIntent.putExtra("drinks",setUpCurrentCart());

        int GO_TO_CART = 1;
        startActivityForResult(myIntent, GO_TO_CART);
        Log.d("ONCLICKEOLIDWHEOWI","ON VIEW CART CLICKED !!!!!!!!\n ON VIEW CART CLICKED !!!!!!!!\n ON VIEW CART CLICKED !!!!!!!!\n ON VIEW CART CLICKED !!!!!!!!\n ON VIEW CART CLICKED !!!!!!!!\n ON VIEW CART CLICKED !!!!!!!!\n");
        Toast.makeText(Activity_DrinksList.this, "Go To cart clicked",Toast.LENGTH_SHORT);

    }

    private ArrayList<Drink> setUpCurrentCart() {
        return ((DrinksViewAdapter)gv.getAdapter()).getAllItems();
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        int GET_ORDER_FOR_SELECTED_DRINK = 0;
        if(requestCode == GET_ORDER_FOR_SELECTED_DRINK) {
            if (resultCode == RESULT_OK && data!=null) {
            }
        }
    }

}

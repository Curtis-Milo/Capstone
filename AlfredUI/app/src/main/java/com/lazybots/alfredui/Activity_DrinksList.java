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
    private HashMap<String,DrinkItem> drinkLink;
    private HashMap<String,Drink> drinkReference;
    private GridView gv;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drinks_list);

        drinkLink = new HashMap<>();
        drinkReference = new HashMap<>();

        gv = (GridView) findViewById(R.id.drinksGrid);

        //NumberPicker np = (NumberPicker)findViewById(R.id.tableNum);
        //np.setMaxValue(9);
        //np.setMinValue(1);
        //np.setValue(1);
        //np.setOnValueChangedListener(new NumberPicker.OnValueChangeListener() {
           // @Override
           // public void onValueChange(NumberPicker numberPicker, int i, int i2) {
           //     tableNum = i2;
           // }
        //});


        //TEST DATA SETUP
        ArrayList<Drink> drinks = new ArrayList<>();
        drinks.add(new Drink ("blue",234,R.drawable.image1,2.99));
        drinks.add(new Drink ("yellow",333,R.drawable.image1,3.99));
        drinks.add(new Drink ("green",654,R.drawable.image1,3.99));
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
/*
        try {

            gv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    //get the selected item
                    Drink selectedItem = (Drink) parent.getItemAtPosition(position);
                    Intent myIntent = new Intent(view.getContext(), Activity_DrinkOptions.class);

                    myIntent.putExtra("selectedDrink", selectedItem);
                    myIntent.putExtra("selectedDrinkOrderInfo",drinkLink.get(selectedItem.getName()));

                    startActivityForResult(myIntent,GET_ORDER_FOR_SELECTED_DRINK);
                }
            });
        } catch(Exception e) {
            Log.d("ERROR",e.getStackTrace().toString());
        }
*/


    }

    public void onClickViewCart (View v) {
        Intent myIntent = new Intent(v.getContext(), Activity_OrderCart.class);

        myIntent.putExtra("CurrentCartList", this.drinkLink);
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
                DrinkItem temp = (DrinkItem)data.getSerializableExtra(("SelectedDrinkOrder"));
                String drinkName = data.getStringExtra("drinkName");
                drinkLink.put(drinkName,temp);

                //Log.d("tagASDASDASDASDASDASASA",drinkItemList.get(0).getOrderAmounts().toString());
            }
        }
    }

}

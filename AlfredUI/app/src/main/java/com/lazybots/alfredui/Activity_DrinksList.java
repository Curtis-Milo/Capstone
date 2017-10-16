package com.lazybots.alfredui;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.AdapterView;
import android.widget.GridView;
import android.view.View;
import android.widget.NumberPicker;
import android.widget.Toast;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;


public class Activity_DrinksList extends AppCompatActivity {
    private final int GET_ORDER_FOR_SELECTED_DRINK = 0;

    private int tableNum ;
    private ArrayList<DrinkItem> drinkItemList;
    private HashMap<String,DrinkItem> drinkLink;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_drinks_list);

        drinkItemList = new ArrayList<DrinkItem>();
        drinkLink = new HashMap<String,DrinkItem>();

        GridView gv = (GridView) findViewById(R.id.drinksGrid);

        NumberPicker np = (NumberPicker)findViewById(R.id.tableNum);
        np.setMaxValue(9);
        np.setMinValue(1);
        np.setValue(1);
        np.setOnValueChangedListener(new NumberPicker.OnValueChangeListener() {
            @Override
            public void onValueChange(NumberPicker numberPicker, int i, int i2) {
                tableNum = i2;
            }
        });


        //TEST DATA SETUP
        ArrayList<Drink> drinks = new ArrayList<Drink>();
        drinks.add(new Drink ("blue",new int[]{123,234,345},R.drawable.image1,new double[]{2.99,3.99,4.99}));
        drinks.add(new Drink ("yellow",new int[]{222,333,444},R.drawable.image1,new double[]{2.99,3.99,4.99}));
        drinks.add(new Drink ("green",new int[]{543,654,765},R.drawable.image1,new double[]{2.99,3.99,4.99}));
        drinks.add(new Drink ("red",new int[]{100,200,300},R.drawable.image1,new double[]{2.99,3.99,4.99}));
        drinks.add(new Drink ("black",new int[]{58,225,450},R.drawable.image1,new double[]{2.99,3.99,4.99}));
        drinks.add(new Drink ("pink",new int[]{69,666,1234},R.drawable.image1,new double[]{2.99,3.99,4.99}));


        // Set the view adapter for the gridview to the custom adapter created for our purpose
        DrinksViewAdapter customAdapter = new DrinksViewAdapter (Activity_DrinksList.this, drinks);
        gv.setAdapter(customAdapter);

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



    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
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

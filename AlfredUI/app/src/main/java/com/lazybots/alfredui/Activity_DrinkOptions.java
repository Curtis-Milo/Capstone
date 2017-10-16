package com.lazybots.alfredui;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

/**
 * Created by Keyur on 2017-10-14.
 */

public class Activity_DrinkOptions extends AppCompatActivity {
    private Drink selectedDrink;
    private DrinkItem drinkItem;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        try {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_drink_options);

            //LinearLayout lv = (LinearLayout) findViewById(R.id.drink_options);
            this.selectedDrink = (Drink) getIntent().getSerializableExtra("selectedDrink");
            this.drinkItem = (DrinkItem) getIntent().getSerializableExtra("selectedDrinkOrderInfo");
            if (this.drinkItem==null) {
                this.drinkItem = new DrinkItem();
            }

            TextView drink_name = (TextView) findViewById(R.id.drink_name);
            drink_name.setText(this.selectedDrink.getName());

            RelativeLayout small_order = (RelativeLayout) findViewById(R.id.drink_info_small);
            RelativeLayout medium_order = (RelativeLayout) findViewById(R.id.drink_info_medium);
            //RelativeLayout large_order = (RelativeLayout) findViewById(R.id.drink_info_large);

            ((TextView)findViewById(R.id.drink_calories)).setText(((Integer)selectedDrink.getCaloriesForSize("SMALL")).toString());
            ((TextView)findViewById(R.id.drink_medium_calories)).setText(((Integer)selectedDrink.getCaloriesForSize("MEDIUM")).toString());
            ((TextView)findViewById(R.id.drink_small_price)).setText("$"+((Double)selectedDrink.getPriceForSize("SMALL")).toString());
            ((TextView)findViewById(R.id.drink_medium_price)).setText("$"+((Double)selectedDrink.getPriceForSize("MEDIUM")).toString());
            ((TextView)findViewById(R.id.drink_small_amt)).setText(((Integer)this.drinkItem.getOrderAmountForSize("SMALL")).toString());
            ((TextView)findViewById(R.id.drink_medium_amt)).setText(((Integer)this.drinkItem.getOrderAmountForSize("MEDIUM")).toString());

            Button small_add = (Button) findViewById(R.id.drink_small_plus);
            Button small_remove = (Button) findViewById(R.id.drink_small_minus);
            Button medium_add = (Button) findViewById(R.id.drink_medium_plus);
            Button medium_remove = (Button) findViewById(R.id.drink_medium_minus);


        } catch (Exception e) {
            Log.d("ERROR",e.getStackTrace().toString());
        }
    }

    public void onClickSmallPlus (View v) {
        this.drinkItem.setOrderAmt("SMALL", this.drinkItem.getOrderAmountForSize("SMALL")+1);
        ((TextView)findViewById(R.id.drink_small_amt)).setText(((Integer)this.drinkItem.getOrderAmountForSize("SMALL")).toString());

    }
    public void onClickSmallMinus (View v) {
        this.drinkItem.setOrderAmt("SMALL", this.drinkItem.getOrderAmountForSize("SMALL")-1);
        ((TextView)findViewById(R.id.drink_small_amt)).setText(((Integer)this.drinkItem.getOrderAmountForSize("SMALL")).toString());
    }
    public void onClickMediumPlus (View v) {
        this.drinkItem.setOrderAmt("MEDIUM", this.drinkItem.getOrderAmountForSize("MEDIUM")+1);
        ((TextView)findViewById(R.id.drink_medium_amt)).setText(((Integer)this.drinkItem.getOrderAmountForSize("MEDIUM")).toString());
    }
    public void onClickMediumMinus (View v) {
        this.drinkItem.setOrderAmt("MEDIUM", this.drinkItem.getOrderAmountForSize("MEDIUM")-1);
        ((TextView)findViewById(R.id.drink_medium_amt)).setText(((Integer)this.drinkItem.getOrderAmountForSize("MEDIUM")).toString());
    }

    public void onClickAddToOrder (View v) {
        //super.onBackPressed();
        Intent i = new Intent();
        Toast.makeText(Activity_DrinkOptions.this, this.drinkItem.getOrderAmounts().toString(),Toast.LENGTH_SHORT);
        i.putExtra("SelectedDrinkOrder",this.drinkItem);
        i.putExtra("drinkName",this.selectedDrink.getName());

        setResult(RESULT_OK,i);
        finish();
    }
}

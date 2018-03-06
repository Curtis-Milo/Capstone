package com.lazybots.alfredui;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.NumberPicker;
import android.widget.TextView;

import java.util.ArrayList;

/**
 * Created by Keyur on 2017-10-13.
 */

public class DrinksViewAdapter extends BaseAdapter {
    ArrayList<Drink> drinks;
    Context context;
    LayoutInflater inflater;


    public DrinksViewAdapter(Context context, ArrayList<Drink> drinks){
        this.drinks = drinks;
        this.context = context;


    }

    @Override
    public int getCount() {
        if (drinks.size()==0) {
            return 0;
        } else {
            return drinks.size();
        }
    }

    public ArrayList<Drink> getAllItems() {return drinks;}

    public void setAllItems(ArrayList<Drink> drinks) {
        this.drinks = drinks;
    }

    @Override
    public Object getItem(int position) {
        return drinks.get(position);
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }

    @Override
    public View getView(final int position, View convertView, ViewGroup parent) {
        View grid = convertView;
        final ViewHolder holder;


        Drink drink = drinks.get(position);

        if (convertView == null) {
            inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            holder = new ViewHolder();

            grid = new View(context);
            grid = inflater.inflate(R.layout.drink_item_in_grid, null);

            holder.name = (TextView) grid.findViewById(R.id.drink_name);
            holder.image = (ImageView)grid.findViewById(R.id.drink_image);
            holder.price = (TextView)grid.findViewById(R.id.drink_price);
            holder.calories = (TextView)grid.findViewById(R.id.drink_calories);
            holder.amount = (NumberPicker)grid.findViewById(R.id.numberPicker);



            grid.setTag(holder);


        } else {
            holder = (ViewHolder) grid.getTag();

        }

        holder.name.setText(drink.getName());
        holder.image.setImageResource(drink.getImage());
        holder.price.setText("$" + Double.toString(drink.getPrice()));
        holder.calories.setText(Integer.toString(drink.getCalories()));
        holder.amount.setMinValue(0);
        holder.amount.setMaxValue(25);
        holder.amount.setValue(drink.getAmount());
        holder.amount.setOnValueChangedListener(new NumberPicker.OnValueChangeListener() {
            @Override
            public void onValueChange(NumberPicker picker, int oldVal, int newVal) {
                View parentView = (View)picker.getParent();
                GridView gv = (GridView) parentView.getParent();
                final int pos = gv.getPositionForView(parentView);
                ((Drink)getItem(position)).setAmount(newVal);
                holder.amount.setTag(newVal);
            }
        });

        //holder.amount = (TextView)grid.findViewById(R.id.drink_amount);
        //holder.btn_up = (Button)grid.findViewById(R.id.button_plus);
        //holder.btn_down = (Button)grid.findViewById(R.id.button_minus);



        return grid;
    }

    static class ViewHolder{
        TextView name;
        ImageView image;
        TextView price;
        TextView calories;
        NumberPicker amount;
    }

}


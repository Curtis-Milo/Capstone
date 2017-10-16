package com.lazybots.alfredui;

import android.app.Activity;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.ArrayList;

/**
 * Created by Keyur on 2017-10-13.
 */

public class DrinksViewAdapter extends BaseAdapter {
    ArrayList<Drink> drinks;
    Context context;


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

    @Override
    public Object getItem(int position) {
        return drinks.get(position);
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        View grid;
        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        Drink drink = drinks.get(position);

        if (convertView == null) {
            grid = new View(context);
            grid = inflater.inflate(R.layout.drink_item_in_grid, null);

            TextView name = (TextView) grid.findViewById(R.id.drink_name);
            ImageView image = (ImageView)grid.findViewById(R.id.drink_image);

            name.setText(drink.getName());
            image.setImageResource(drink.getImage());
        } else {
            grid = convertView;
        }

        return grid;
    }


}

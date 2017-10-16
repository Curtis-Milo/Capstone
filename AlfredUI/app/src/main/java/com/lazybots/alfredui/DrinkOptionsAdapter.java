package com.lazybots.alfredui;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;

/**
 * Created by Keyur on 2017-10-15.
 */

class DrinkOptionsAdapter extends BaseAdapter  {
    Context context;
    Drink selectedDrink;

    public DrinkOptionsAdapter(Context context, Drink selectedDrink)  {
        this.context = context;
        this.selectedDrink = selectedDrink;
    }

    @Override
    public int getCount() {
        return 0;
    }

    @Override
    public Object getItem(int position) {
        return null;
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        View linear;
        LayoutInflater inflater;
        return null;
    }
}

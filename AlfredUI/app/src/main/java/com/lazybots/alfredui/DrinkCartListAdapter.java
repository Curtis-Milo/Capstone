package com.lazybots.alfredui;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

import java.util.ArrayList;

/**
 * Created by Keyur on 2017-12-27.
 */

public class DrinkCartListAdapter extends BaseAdapter {

    private static LayoutInflater inflater = null;
    Context context;
    ArrayList<String[]> currentCart;

    public DrinkCartListAdapter(Context context, ArrayList<String[]> currentCart) {
        this.context = context;
        this.currentCart = currentCart;
        inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    }

    @Override
    public int getCount() {
        return currentCart.size();
    }

    @Override
    public Object getItem(int position) {
        return currentCart.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        View vi = convertView;
        if (vi==null) vi = inflater.inflate(R.layout.drink_cart_row,null);
        TextView name = (TextView) vi.findViewById(R.id.drinkCart_name);
        TextView amt = (TextView) vi.findViewById(R.id.drinkCart_amt);
        TextView price = (TextView) vi.findViewById(R.id.drinkCart_price);

        name.setText(currentCart.get(position)[0]);
        amt.setText(currentCart.get(position)[1]);
        price.setText("$" + currentCart.get(position)[2]);

        return vi;
    }
}
